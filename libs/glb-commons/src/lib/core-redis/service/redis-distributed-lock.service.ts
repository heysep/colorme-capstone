import { Injectable, Logger } from '@nestjs/common';
import { Propagation, runInTransaction } from 'typeorm-transactional';
import { v4 as uuidv4 } from 'uuid';
import {
  ITenantTransactionContext,
  removeTenantCodeRRNumber,
} from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { GlbRedisCoreService } from './redis-root.service';

export interface DistributedLock {
  lockKey: string;
  lockValue: string;
  acquiredAt: Date;
  ttl: number;
}

export interface AcquireLockOptions {
  ttl?: number; // TTL in seconds
  timeout?: number; // Timeout for acquiring lock in milliseconds
  retryDelay?: number; // Retry delay in milliseconds
}

export enum GlbRedisDistributedLockNamespace {
  STORAGE_LIMITER_WORKER = 'storage-limiter-worker',
  TENANT_CONNECTION_POOL_CREATION = 'tenant-connection-pool-creation',
  SALES_ORDER_PRODUCT = 'sales-order-product',
  SELF_ORDER_PRODUCT = 'self-order-product',
  WORKSHEET_SCHEDULE = 'worksheet-schedule',
  PRODUCT_STOCK = 'product-stock',
  PRODUCT_STOCK_HISTORY = 'product-stock-history',
  PRODUCT_STOCK_RESERVATION = 'product-stock-reservation',
  WORKSHEET = 'worksheet',
}

@Injectable()
export class GlbRedisDistributedLockService {
  private readonly logger = new Logger(GlbRedisDistributedLockService.name);

  public static readonly DEFAULT_TTL = 30; // 30 seconds
  public static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  public static readonly DEFAULT_RETRY_DELAY = 100; // 100ms

  public static readonly NO_RETRY_OPTIONS: AcquireLockOptions = {
    retryDelay: -1,
    ttl: 30,
    timeout: -1,
  };

  // Lua script for atomic lock release
  private readonly RELEASE_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  // Lua script for atomic lock extension
  private readonly EXTEND_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("expire", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  constructor(private readonly redis: GlbRedisCoreService) {}

  /**
   * 분산락 획득
   * @param lockKey 락 키
   * @param options 락 획득 옵션
   * @returns DistributedLock 객체 또는 null
   */
  async acquire(
    lockKey: string,
    options: AcquireLockOptions = {},
  ): Promise<DistributedLock | null> {
    const {
      ttl = GlbRedisDistributedLockService.DEFAULT_TTL,
      timeout = GlbRedisDistributedLockService.DEFAULT_TIMEOUT,
      retryDelay = GlbRedisDistributedLockService.DEFAULT_RETRY_DELAY,
    } = options;

    const lockValue = uuidv4();
    const startTime = Date.now();

    if (retryDelay === -1 && timeout === -1) {
      try {
        // SET key value EX ttl NX - atomic operation
        const result = await this.redis
          .getRedis()
          .set(lockKey, lockValue, 'EX', ttl, 'NX');

        if (result === 'OK') {
          this.logger.debug(`Lock acquired: ${lockKey}`);
          return {
            lockKey,
            lockValue,
            acquiredAt: new Date(),
            ttl,
          };
        }
        this.logger.warn(`Failed to acquire lock ${lockKey}`);
        return null;
      } catch (error) {
        this.logger.error(`Error acquiring lock ${lockKey}:`, error);
        throw error;
      }
    } else {
      while (Date.now() - startTime < timeout) {
        try {
          // SET key value EX ttl NX - atomic operation
          const result = await this.redis
            .getRedis()
            .set(lockKey, lockValue, 'EX', ttl, 'NX');

          if (result === 'OK') {
            this.logger.debug(`Lock acquired: ${lockKey}`);
            return {
              lockKey,
              lockValue,
              acquiredAt: new Date(),
              ttl,
            };
          }

          // Wait before retry
          await this.sleep(retryDelay);
        } catch (error) {
          this.logger.error(`Error acquiring lock ${lockKey}:`, error);
          throw error;
        }
      }
    }

    this.logger.warn(
      `Failed to acquire lock ${lockKey} within timeout ${timeout}ms`,
    );
    return null;
  }

  /**
   * 분산락 해제
   * @param lock DistributedLock 객체
   * @returns 해제 성공 여부
   */
  async release(lock: DistributedLock): Promise<boolean> {
    try {
      const result = (await this.redis
        .getRedis()
        .eval(this.RELEASE_SCRIPT, 1, lock.lockKey, lock.lockValue)) as number;

      const released = result === 1;
      if (released) {
        this.logger.debug(`Lock released: ${lock.lockKey}`);
      } else {
        this.logger.warn(
          `Failed to release lock: ${lock.lockKey} (may have expired or been released by another process)`,
        );
      }

      return released;
    } catch (error) {
      this.logger.error(`Error releasing lock ${lock.lockKey}:`, error);
      throw error;
    }
  }

  /**
   * 분산락 연장
   * @param lock DistributedLock 객체
   * @param ttl 새로운 TTL (초)
   * @returns 연장 성공 여부
   */
  async extend(lock: DistributedLock, ttl: number): Promise<boolean> {
    try {
      const result = (await this.redis
        .getRedis()
        .eval(
          this.EXTEND_SCRIPT,
          1,
          lock.lockKey,
          lock.lockValue,
          ttl,
        )) as number;

      const extended = result === 1;
      if (extended) {
        lock.ttl = ttl;
        this.logger.debug(`Lock extended: ${lock.lockKey} for ${ttl}s`);
      } else {
        this.logger.warn(
          `Failed to extend lock: ${lock.lockKey} (may have expired or been released)`,
        );
      }

      return extended;
    } catch (error) {
      this.logger.error(`Error extending lock ${lock.lockKey}:`, error);
      throw error;
    }
  }

  /**
   * 락 상태 확인
   * @param lockKey 락 키
   * @returns 락이 존재하는지 여부
   */
  async isLocked(lockKey: string): Promise<boolean> {
    try {
      const exists = await this.redis.getRedis().exists(lockKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Error checking lock status ${lockKey}:`, error);
      throw error;
    }
  }

  /**
   * 락과 함께 작업 실행 (자동 획득/해제)
   * @param lockKey 락 키
   * @param operation 실행할 작업
   * @param options 락 획득 옵션
   * @returns 작업 결과
   */
  async withLock<T>(
    lockKey: string,
    operation: () => Promise<T>,
    options: AcquireLockOptions = {},
  ): Promise<T> {
    const lock = await this.acquire(lockKey, options);

    if (!lock) {
      throw new Error(`Failed to acquire lock: ${lockKey}`);
    }

    try {
      return await operation();
    } finally {
      await this.release(lock);
    }
  }

  /**
   * 락과 함께 작업 실행 (트랜잭션 내에서 자동 획득/해제)
   * @param ctx 테넌트 컨텍스트
   * @param lockKey 락 키
   * @param operation 실행할 작업
   * @param options 락 획득 옵션
   * @returns 작업 결과
   */
  async withLockForTransaction<T>(
    ctx: ITenantTransactionContext,
    lockKey: string | string[],
    operation: () => Promise<T>,
    options: AcquireLockOptions = {},
  ): Promise<T> {
    if (Array.isArray(lockKey)) {
      const locks = await this.acquireMultiple(lockKey, options);
      // if (!locks) {
      //   throw new Error(`Failed to acquire lock: ${lockKey}`);
      // }

      try {
        return await runInTransaction(
          async () => {
            return await operation();
          },
          {
            connectionName: ctx.tenantCode,
            propagation: Propagation.REQUIRED,
          },
        );
      } finally {
        await this.releaseMultiple(locks);
      }
    } else {
      const lock = await this.acquire(lockKey, options);

      if (!lock) {
        throw new Error(`Failed to acquire lock: ${lockKey}`);
      }

      try {
        return await runInTransaction(
          async () => {
            return await operation();
          },
          {
            connectionName: ctx.tenantCode,
            propagation: Propagation.REQUIRED,
          },
        );
      } finally {
        await this.release(lock);
      }
    }
  }

  /**
   * 여러 락을 순서대로 획득 (데드락 방지를 위해 정렬된 순서로)
   * @param lockKeys 락 키들
   * @param options 락 획득 옵션
   * @returns 획득된 락들의 배열
   */
  async acquireMultiple(
    lockKeys: string[],
    options: AcquireLockOptions = {},
  ): Promise<DistributedLock[]> {
    // 데드락 방지를 위해 키를 정렬
    const sortedKeys = [...lockKeys].sort();
    const acquiredLocks: DistributedLock[] = [];

    try {
      for (const key of sortedKeys) {
        const lock = await this.acquire(key, options);
        if (!lock) {
          // 하나라도 실패하면 모든 락 해제
          await this.releaseMultiple(acquiredLocks);
          throw new Error(`Failed to acquire lock: ${key}`);
        }
        acquiredLocks.push(lock);
      }

      return acquiredLocks;
    } catch (error) {
      await this.releaseMultiple(acquiredLocks);
      throw error;
    }
  }

  /**
   * 여러 락을 해제
   * @param locks 해제할 락들의 배열
   */
  async releaseMultiple(locks: DistributedLock[]): Promise<void> {
    await Promise.all(
      locks.map((lock) =>
        this.release(lock).catch((error) => {
          this.logger.error(`Error releasing lock ${lock.lockKey}:`, error);
        }),
      ),
    );
  }

  /**
   * 락 키에 prefix 추가
   * @param namespace 네임스페이스
   * @param key 원본 키
   * @param ctx 테넌트 컨텍스트
   * @returns prefix가 추가된 키
   */
  static createLockKey(
    namespace: GlbRedisDistributedLockNamespace,
    key: string,
    ctx: ITenantTransactionContext,
  ): string {
    if (ctx?.tenantCode) {
      return `lock:${namespace.valueOf()}:${key}:${removeTenantCodeRRNumber(
        ctx?.tenantCode,
      )}`;
    }

    return `lock:${namespace.valueOf()}:${key}`;
  }

  static createLockKeys(
    namespace: GlbRedisDistributedLockNamespace,
    keys: string[],
    ctx: ITenantTransactionContext,
  ): string[] {
    const lockKeys = keys.map((key) => this.createLockKey(namespace, key, ctx));
    return lockKeys;
  }

  /**
   * 락 키에 prefix 추가
   * @param namespace 네임스페이스
   * @param key 원본 키
   * @returns prefix가 추가된 키
   */
  static createLockKeyNoCtx(
    namespace: GlbRedisDistributedLockNamespace,
    key: string,
  ): string {
    return `lock:${namespace.valueOf()}:${key}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
