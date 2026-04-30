/* eslint-disable @typescript-eslint/no-explicit-any */
import { WelcomeMessageService } from '../../other/welcome-message.func';

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { strict as assert } from 'assert';
import { EventEmitter } from 'events';
import { DataSource, QueryRunner } from 'typeorm';
import {
  addTransactionalDataSource,
  deleteDataSourceByName,
} from 'typeorm-transactional';
import {
  GlbRedisDistributedLockNamespace,
  GlbRedisDistributedLockService,
} from '../../../core-redis/service/redis-distributed-lock.service';
import { CommonError } from '../../../core-response/utils/common-error.util';
import { GlbOptionalValue } from '../../../utils-optional/utils-optional.util';
import { GlbCoreTypeOrmModule } from '../../core-typeorm.module';
import { CBIZ_GROUP_ENTITY } from '../../entity/tenant/core-biz-entity/rn-tenant-cbiz-group.tenant-mysql-group';
import { RnTenantEmployeeAccountEntity } from '../../entity/tenant/rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantPermissionByMenuEntity } from '../../entity/tenant/rn-tenant-permission-by-menu.tenant-mysql-entity';
import { RnTenantPermissionEntity } from '../../entity/tenant/rn-tenant-permission.tenant-mysql-entity';
import { RnTenantRoleAndPermissionEntity } from '../../entity/tenant/rn-tenant-role-and-permission.tenant-mysql-entity';
import { RnTenantRoleEntity } from '../../entity/tenant/rn-tenant-role.tenant-mysql-entity';
import { RnTenantUserAiMetadataEntity } from '../../entity/tenant/rn-tenant-user-ai-metadata.tenant-mysql-entity';
import { GlbCoreTypeOrmError } from '../../error/tenant/tenant-error.error';
import { RnDefaultTenantRepository } from '../../repository/default/rn-default-tenant.repository';
import { TENANT_CONNECTION_TEST_TENANT_CODE } from '../../utils/typeorm.utils';
import { TypeOrmCustomLogger } from '../typeorm-logger.service';
import { initTenantBizTask } from './tenant-connection-for-biz.service';

interface TenantConnectionPool {
  dataSources: DataSource[];
  currentIndex: number;
  createdAt: Date;
  healthCheckTimeouts: NodeJS.Timeout[];
}

@Injectable()
export class TenantConnectionService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(TenantConnectionService.name);

  private isInitialized = false;

  // 기본 풀 크기 (라운드로빈 적용)
  public static readonly defaultPoolSize = 1;
  // 테넌트별 DataSource 풀 (키: 입력받은 테넌트 코드)
  public static readonly connectionPool = new Map<
    string,
    TenantConnectionPool
  >();
  // 풀 생성 Promise 캐싱 (락 대신 사용)
  public static readonly poolCreationPromises = new Map<
    string,
    Promise<TenantConnectionPool>
  >();
  public static readonly events = new EventEmitter();
  public static readonly maxRetries = 3;
  public static readonly healthCheckInterval = 15000; // 15초
  public static readonly maxConnectionAge = 3600000; // 1시간
  public static readonly cleanupInterval = 300000; // 5분
  public static isShuttingDown = false;

  private static metrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    connectionErrors: 0,
  };

  // 정리 타이머
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly tenantRepository: RnDefaultTenantRepository,
    private readonly dataSource: DataSource,
    private readonly distributedLockService: GlbRedisDistributedLockService,
  ) {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    WelcomeMessageService();

    // 정리 타이머 시작
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldConnectionPools();
      this.logMetrics();
    }, TenantConnectionService.cleanupInterval);

    this.logger.log(
      `TenantConnectionService initialized with healthCheckInterval: ${TenantConnectionService.healthCheckInterval}, maxRetries: ${TenantConnectionService.maxRetries}, maxConnectionAge: ${TenantConnectionService.maxConnectionAge}`,
    );
  }

  /**
   * 모듈 초기화 시 최대 커넥션 설정
   */
  async onModuleInit() {
    // 최대 커넥션 설정
    const maxConnections = parseInt(process.env?.['GLB_CORE_TYPEORM_MAX_CONNECTIONS'] ?? '151', 10);
    if (isNaN(maxConnections) || maxConnections < 1 || maxConnections > 100000) {
      this.logger.warn(`잘못된 GLB_CORE_TYPEORM_MAX_CONNECTIONS 값, 기본값 151 사용`);
      await this.dataSource.query(`SET GLOBAL max_connections = 151;`);
    } else {
      await this.dataSource.query(`SET GLOBAL max_connections = ?;`, [maxConnections]);
    }

    /**
     * [2025-09-30] 테넌트 연결 상태 확인 전용 테넌트 생성
     *
     * 1. 분산락 진입
     * 2. 테넌트 데이터베이스 생성
     * 3. 테넌트 테이블 생성
     * 4. 분산락 해제
     */
    const lockKey = GlbRedisDistributedLockService.createLockKeyNoCtx(
      GlbRedisDistributedLockNamespace.TENANT_CONNECTION_POOL_CREATION,
      TENANT_CONNECTION_TEST_TENANT_CODE,
    );
    await this.distributedLockService.withLock(
      lockKey,
      async () => {
        // 데이터베이스 생성 여부 확인
        const tenantInfo = await this.tenantRepository.findByCode({
          code: TENANT_CONNECTION_TEST_TENANT_CODE,
        });

        if (tenantInfo.isEmpty()) {
          // 데이터베이스 생성
          await this.dataSource.query(
            `CREATE DATABASE IF NOT EXISTS ${TENANT_CONNECTION_TEST_TENANT_CODE}`,
          );

          // 테넌트 정보 저장
          const newTenant = this.tenantRepository.repository.create({
            name: '[SYSTEM] 테넌트 연결 상태 확인 전용 테넌트',
            code: TENANT_CONNECTION_TEST_TENANT_CODE,
            dbName: TENANT_CONNECTION_TEST_TENANT_CODE,
            domainName: TENANT_CONNECTION_TEST_TENANT_CODE,
            regionConfig: 'root',
          });
          await this.tenantRepository.repository.save(newTenant);

          this.logger.log(
            `Tenant connection test tenant created: ${TENANT_CONNECTION_TEST_TENANT_CODE}`,
          );
        } else {
          this.logger.log(
            `Tenant connection test tenant already exists: ${TENANT_CONNECTION_TEST_TENANT_CODE}`,
          );
        }
      },
      {
        ttl: 20, // 20초 TTL (connection 생성 시간 고려)
        timeout: 15_000, // 15초 timeout
        retryDelay: 1000, // 1초 retry delay
      },
    );
  }

  /**
   * 메트릭 값들의 유효성을 검증하고 필요시 보정합니다.
   */
  private validateMetrics(): void {
    if (TenantConnectionService.metrics.totalConnections < 0) {
      this.logger.warn('totalConnections became negative, resetting to 0');
      TenantConnectionService.metrics.totalConnections = 0;
    }

    if (TenantConnectionService.metrics.activeConnections < 0) {
      this.logger.warn('activeConnections became negative, resetting to 0');
      TenantConnectionService.metrics.activeConnections = 0;
    }

    if (
      TenantConnectionService.metrics.activeConnections >
      TenantConnectionService.metrics.totalConnections
    ) {
      this.logger.warn(
        'activeConnections exceeds totalConnections, correcting...',
      );
      TenantConnectionService.metrics.totalConnections =
        TenantConnectionService.metrics.activeConnections;
    }
  }

  /**
   * 메트릭 정보를 로깅합니다.
   */
  private logMetrics(): void {
    this.validateMetrics(); // metrics 검증 추가

    this.logger.debug(
      `TenantConnectionService Metrics - totalConnections: ${TenantConnectionService.metrics.totalConnections}, activeConnections: ${TenantConnectionService.metrics.activeConnections}, failedConnections: ${TenantConnectionService.metrics.failedConnections}, connectionErrors: ${TenantConnectionService.metrics.connectionErrors}`,
    );
  }

  /**
   * 연결이 만료되었는지 확인합니다.
   */
  private isConnectionExpired(createdAt: Date): boolean {
    return (
      Date.now() - createdAt.getTime() >
      TenantConnectionService.maxConnectionAge
    );
  }

  private getNextInitializedDataSource(
    pool: TenantConnectionPool,
  ): DataSource | undefined {
    if (!pool || pool.dataSources.length === 0) {
      return undefined;
    }

    const { dataSources } = pool;
    const initialIndex = pool.currentIndex;

    for (let attempt = 0; attempt < dataSources.length; attempt++) {
      const index = pool.currentIndex % dataSources.length;
      const candidate = dataSources[index];
      pool.currentIndex = (index + 1) % dataSources.length;

      if (candidate?.isInitialized) {
        return candidate;
      }

      // 모든 데이터소스를 한 번씩 확인했는데도 초기화된 커넥션이 없다면 중단
      if (pool.currentIndex === initialIndex) {
        break;
      }
    }

    return undefined;
  }

  /**
   * 동일 테넌트 코드에 대해 라운드로빈 방식으로 DataSource 인스턴스를 선택합니다.
   * Redis 분산락을 사용하여 멀티인스턴스 환경에서의 동시 접근을 제어합니다.
   */
  async getConnection(options: { tenantCode: string }): Promise<DataSource> {
    if (TenantConnectionService.isShuttingDown) {
      throw new Error('Service is shutting down');
    }

    const { tenantCode } = options;

    // 1차 체크: 락 없이 기존 풀 확인 (성능 최적화)
    const existingPool = TenantConnectionService.connectionPool.get(tenantCode);
    if (
      existingPool &&
      existingPool.dataSources.length > 0 &&
      !this.isConnectionExpired(existingPool.createdAt)
    ) {
      const dataSource = this.getNextInitializedDataSource(existingPool);

      if (dataSource) {
        await initTenantBizTask(dataSource);

        return dataSource;
      }
    }

    // 락으로 보호된 풀 생성
    const lockKey = GlbRedisDistributedLockService.createLockKey(
      GlbRedisDistributedLockNamespace.TENANT_CONNECTION_POOL_CREATION,
      tenantCode,
      { tenantCode, dataSource: this.dataSource },
    );

    return await this.distributedLockService.withLock(
      lockKey,
      async () => {
        // 2차 체크: 락 내부에서 다시 풀 존재 확인 (Double-checked locking)
        const pool = TenantConnectionService.connectionPool.get(tenantCode);
        if (pool) {
          const expired = this.isConnectionExpired(pool.createdAt);
          const nextDataSource = this.getNextInitializedDataSource(pool);
          const noValid = !nextDataSource;

          if (!expired && !noValid && nextDataSource) {
            await initTenantBizTask(nextDataSource);

            return nextDataSource;
          }

          await this.removeConnectionPool(tenantCode);
        }

        // 새 풀 생성 중인 Promise가 있다면 사용
        let creationPromise =
          TenantConnectionService.poolCreationPromises.get(tenantCode);
        if (!creationPromise) {
          creationPromise = this.createNewConnectionPool({ tenantCode });
          TenantConnectionService.poolCreationPromises.set(
            tenantCode,
            creationPromise,
          );
          creationPromise
            .then((pool) => {
              TenantConnectionService.connectionPool.set(tenantCode, pool);
              TenantConnectionService.poolCreationPromises.delete(tenantCode);
            })
            .catch(async (error) => {
              TenantConnectionService.poolCreationPromises.delete(tenantCode);

              // 부분 생성된 pool이 있다면 정리
              const partialPool =
                TenantConnectionService.connectionPool.get(tenantCode);
              if (partialPool) {
                await this.removeConnectionPool(tenantCode);
              }

              this.logger.error(
                `Failed to create connection pool for tenant ${tenantCode}: ${error}`,
              );
            });
        }

        const newPool = await creationPromise;
        const dataSource = this.getNextInitializedDataSource(newPool);

        if (!dataSource) {
          throw new Error(
            `No initialized DataSource available for tenant ${tenantCode}`,
          );
        }

        await initTenantBizTask(dataSource);

        return dataSource;
      },
      {
        ttl: 60, // 60초 TTL (connection 생성 시간 고려)
        timeout: 15000, // 15초 timeout
        retryDelay: 100, // 100ms retry delay
      },
    );
  }

  /**
   * 입력 테넌트 코드에 대해 defaultPoolSize 만큼 DataSource 인스턴스를 생성합니다.
   * 각 인스턴스 생성 시 static sequenceCounter를 사용해 고유 순번(예: "gpntest-dev-1")을 부여하며,
   * 각 인스턴스에는 헬스 체크 타이머를 설정하고
   */
  private async createNewConnectionPool(options: {
    tenantCode: string;
  }): Promise<TenantConnectionPool> {
    const { tenantCode } = options;
    const dataSources: DataSource[] = [];
    const healthCheckTimeouts: NodeJS.Timeout[] = [];

    try {
      for (let i = 0; i < TenantConnectionService.defaultPoolSize; i++) {
        const ds = await this.createConnectionWithRetry({
          tenantCode,
          index: i,
        });
        dataSources.push(ds);

        let isHealthChecking = false;
        const timer = setInterval(async () => {
          if (TenantConnectionService.isShuttingDown || isHealthChecking) {
            return;
          }

          isHealthChecking = true;

          try {
            if (!(await this.validateConnection(ds))) {
              this.logger.warn(
                `Unhealthy connection detected for tenant ${tenantCode}`,
              );
              await this.removeSingleConnection(tenantCode, ds);
            }
          } catch (healthCheckError: any) {
            this.logger.error(
              `Health check execution failed for tenant ${tenantCode}: ${healthCheckError?.message ?? healthCheckError}`,
            );
          } finally {
            isHealthChecking = false;
          }
        }, TenantConnectionService.healthCheckInterval);
        healthCheckTimeouts.push(timer);
      }

      // 성공 시에만 metrics 업데이트
      TenantConnectionService.metrics.totalConnections += dataSources.length;
      TenantConnectionService.metrics.activeConnections += dataSources.length;
      TenantConnectionService.events.emit('connectionPoolCreated', tenantCode);

      return {
        dataSources,
        currentIndex: 0,
        createdAt: new Date(),
        healthCheckTimeouts,
      };
    } catch (error) {
      // 예외 발생 시 부분 생성된 리소스들 정리
      this.logger.error(
        `Failed to create connection pool for tenant ${tenantCode}: ${error}`,
      );
      await this.cleanupPartialConnectionPool(
        dataSources,
        healthCheckTimeouts,
        tenantCode,
      );
      throw error;
    }
  }

  /**
   * 부분적으로 생성된 connection pool의 리소스들을 정리합니다.
   */
  private async cleanupPartialConnectionPool(
    dataSources: DataSource[],
    healthCheckTimeouts: NodeJS.Timeout[],
    tenantCode: string,
  ): Promise<void> {
    // 타이머들 정리
    for (const timer of healthCheckTimeouts) {
      clearInterval(timer);
    }

    // DataSource들 정리
    for (const ds of dataSources) {
      try {
        if (ds.isInitialized) {
          await ds.destroy();
        }
        const uniqueName = (ds as any).__uniqueTenantName;
        if (uniqueName) {
          deleteDataSourceByName(uniqueName);
        }
      } catch (error) {
        this.logger.error(`Error cleaning up partial DataSource: ${error}`);
      }
    }

    // metrics 롤백 (부분 생성된 것들만큼)
    TenantConnectionService.metrics.totalConnections -= dataSources.length;
    TenantConnectionService.metrics.activeConnections -= dataSources.length;

    this.logger.warn(
      `Cleaned up partial connection pool for tenant: ${tenantCode}, cleaned ${dataSources.length} DataSources`,
    );
  }

  private async cleanupOldConnectionPools(): Promise<void> {
    try {
      const expiredTenantCodes: string[] = [];

      for (const [
        tenantCode,
        pool,
      ] of TenantConnectionService.connectionPool.entries()) {
        if (this.isConnectionExpired(pool.createdAt)) {
          expiredTenantCodes.push(tenantCode);
        }
      }

      for (const tenantCode of expiredTenantCodes) {
        await this.removeConnectionPool(tenantCode);
      }
    } catch (error: any) {
      this.logger.error(
        `Error cleaning up old connection pools: ${error?.message ?? error}`,
      );
    }
  }

  private async removeSingleConnection(
    tenantCode: string,
    dataSource: DataSource,
  ): Promise<void> {
    const pool = TenantConnectionService.connectionPool.get(tenantCode);
    if (!pool) return;

    // ① 이 커넥션의 고유 이름을 확보
    const uniqueName: string | undefined = (dataSource as any)
      .__uniqueTenantName;

    // ② 타이머·배열 정리
    const idx = pool.dataSources.indexOf(dataSource);
    if (idx > -1) {
      clearInterval(pool.healthCheckTimeouts[idx]);
      pool.healthCheckTimeouts.splice(idx, 1);
      pool.dataSources.splice(idx, 1);
      TenantConnectionService.metrics.activeConnections--;
      TenantConnectionService.metrics.totalConnections--;
    }

    // ③ DataSource 자체 종료
    if (dataSource.isInitialized) {
      try {
        await dataSource.destroy();
        // ④ TypeORM-Transactional 레지스트리에서 **uniqueName** 으로 제거
        if (uniqueName) deleteDataSourceByName(uniqueName);
      } catch (e: any) {
        this.logger.error(
          `Error destroying connection ${uniqueName}: ${e.message}`,
        );
      }
    }

    TenantConnectionService.events.emit(
      'connectionRemoved',
      uniqueName || tenantCode,
    );
  }

  private async removeConnectionPool(tenantCode: string): Promise<void> {
    const pool = TenantConnectionService.connectionPool.get(tenantCode);
    if (!pool) return;

    // 헬스 체크 타이머들 정리
    for (const timer of pool.healthCheckTimeouts) {
      clearInterval(timer);
    }

    // 각 DataSource 개별 정리
    for (const ds of pool.dataSources) {
      try {
        // DataSource 종료
        await ds.destroy();

        // 각 DataSource의 실제 uniqueName으로 TypeORM-Transactional 레지스트리에서 제거
        const uniqueName: string | undefined = (ds as any).__uniqueTenantName;
        if (uniqueName) {
          deleteDataSourceByName(uniqueName);
        }

        // 성공적으로 destroy된 경우에만 metrics 감소
        TenantConnectionService.metrics.activeConnections--;
        TenantConnectionService.metrics.totalConnections--;
      } catch (error) {
        this.logger.error(
          `Error destroying DataSource ${
            (ds as any).__uniqueTenantName || 'unknown'
          } for tenant ${tenantCode}: ${error}`,
        );
      }
    }

    // connectionPool에서 제거
    TenantConnectionService.connectionPool.delete(tenantCode);

    // 이벤트 발생
    TenantConnectionService.events.emit('connectionPoolRemoved', tenantCode);
  }

  private async validateConnection(connection: DataSource): Promise<boolean> {
    if (!connection.isInitialized) {
      this.logger.warn(`Health check failed: Connection is not initialized`);
      return false;
    }

    const timeoutMs = 5000;
    const controller = new AbortController();
    let queryRunner: QueryRunner | null = null;
    let timeout: NodeJS.Timeout | undefined;

    const abortPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener(
        'abort',
        () => {
          try {
            if (queryRunner && !queryRunner.isReleased) {
              const rawConnection = (queryRunner as any)?.databaseConnection;
              if (
                rawConnection &&
                typeof rawConnection.destroy === 'function'
              ) {
                rawConnection.destroy(
                  new Error('Validation aborted by timeout'),
                );
              }
            }
          } catch (abortError: any) {
            this.logger.warn(
              `Error aborting validation query: ${abortError?.message ?? abortError}`,
            );
          }
          reject(new Error('Validation aborted by timeout'));
        },
        { once: true },
      );
    });

    try {
      queryRunner = connection.createQueryRunner();
      await queryRunner.connect();

      timeout = setTimeout(() => controller.abort(), timeoutMs);

      await Promise.race([queryRunner.query('SELECT 1'), abortPromise]);

      return true;
    } catch (error: any) {
      if (controller.signal.aborted) {
        this.logger.warn(
          `Connection validation timed out after ${timeoutMs}ms: ${error?.message ?? error}`,
        );
      } else {
        this.logger.warn(
          `Connection validation failed: ${error?.message ?? error}`,
        );
      }
      return false;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (queryRunner) {
        await this.safeReleaseQueryRunner(queryRunner);
      }
    }
  }

  async onModuleDestroy() {
    TenantConnectionService.isShuttingDown = true;
    clearInterval(this.cleanupTimer);
    for (const tenantCode of TenantConnectionService.connectionPool.keys()) {
      await this.removeConnectionPool(tenantCode);
    }
  }

  getMetrics() {
    return { ...TenantConnectionService.metrics };
  }

  /**
   * 테넌트 커넥션 생성
   * 입력받은 테넌트 코드에 대해 static sequenceCounter를 사용해 순차 번호를 부여하고,
   * 고유한 이름(예: "gpntest-dev-1")을 생성하여 DataSource에 메타데이터로 저장합니다.
   */
  async createConnection(options: {
    tenantCode: string;
    index: number;
  }): Promise<DataSource> {
    const { tenantCode, index } = options;
    const tenantInfo = await this.tenantRepository.findByCode({
      code: tenantCode,
    });
    if (
      tenantInfo.isEmpty() ||
      !tenantInfo?.value?.dbName ||
      tenantInfo?.value?.dbName == null
    ) {
      this.logger.error(`Tenant not found: ${tenantCode}`);
      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.TENANT_CONNECTION_FAILED,
      );
    }
    GlbOptionalValue.getValueAndEmptyThrowError(
      tenantInfo,
      GlbCoreTypeOrmError.TENANT_CONNECTION_FAILED,
    );

    const dbConfig = GlbCoreTypeOrmModule.getOption(
      tenantInfo.value?.regionConfig === null ||
        tenantInfo?.value?.regionConfig === undefined ||
        tenantInfo?.value?.regionConfig?.length === 0 ||
        tenantInfo?.value?.regionConfig?.replace(/ /g, '') === '' ||
        tenantInfo?.value?.regionConfig?.replace(/"/g, '') === 'root'
        ? null
        : {
            isUseRegion:
              tenantInfo?.value?.regionConfig?.replace(/"/g, '') !== 'root',
            serviceRegionId: tenantInfo?.value?.regionConfig?.replace(/"/g, ''),
          },
    );

    let dataSource = new DataSource({
      replication: {
        master: {
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: tenantInfo.value.dbName,
        },
        slaves: dbConfig.slaves.map((slave) => {
          assert(tenantInfo != null);
          assert(tenantInfo.value != null);
          assert(tenantInfo.value.dbName != null);

          return {
            host: slave.host,
            port: slave.port,
            username: slave.username,
            password: slave.password,
            database: tenantInfo?.value.dbName,
          };
        }),
      },
      // 만약 동기화가 활성화 되어 있다면, 처음 생성되는 테넌트 커넥션일 경우에만 동기화 적용
      // ---------------------
      synchronize: dbConfig.synchronize === true && index === 0 ? true : false,
      // ---------------------
      type: 'mysql',
      database: tenantInfo.value.dbName,
      timezone: 'Asia/Seoul',
      ssl: false,
      logging: true,
      migrationsRun: index === 0,
      migrations: [],
      entities: [
        RnTenantEmployeeAccountEntity,
        RnTenantPermissionEntity,
        RnTenantRoleEntity,
        RnTenantRoleAndPermissionEntity,
        RnTenantPermissionByMenuEntity,
        RnTenantUserAiMetadataEntity,
        ...CBIZ_GROUP_ENTITY,
      ],
      migrationsTableName: 'typeorm_migrations_tenant',
      migrationsTransactionMode: 'each',
      logger: new TypeOrmCustomLogger(),
      charset: dbConfig.charset,
      // ------------------------------------------------------------
      /**
       * 각 멀티 테넌시 환경에서는 각 데이터 소스가 할당되기에 풀 사이즈를 최대 커넥션 수로 설정
       */
      poolSize: Number(process.env?.['GLB_CORE_TYPEORM_POOL_SIZE'] ?? 2),
      // ------------------------------------------------------------
      extra: {
        connectionLimit: Number(
          process.env?.['GLB_CORE_TYPEORM_POOL_SIZE'] ?? 2,
        ),
        waitForConnections: true, // 부족하면 큐잉
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 30000,
        connectTimeout: 20000,
      },
    });

    // 타임스탬프 + 랜덤 기반 고유 이름 생성
    const uniqueName = `${tenantCode}#RR#${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const transactionalDataSource = addTransactionalDataSource({
      name: uniqueName,
      dataSource: dataSource,
    });
    dataSource = transactionalDataSource;
    await dataSource.initialize();
    if (!dataSource.isInitialized) {
      throw new Error('Tenant connection not initialized');
    }
    // 고유 이름을 메타데이터로 저장 (미들웨어 등에서 참조)
    (dataSource as any).__uniqueTenantName = uniqueName;

    this.logger.log(
      `Tenant connection created for tenant: ${tenantCode} with unique name: ${uniqueName}`,
    );
    return dataSource;
  }

  private async createConnectionWithRetry(
    options: { tenantCode: string; index: number },
    attempt = 1,
  ): Promise<DataSource> {
    try {
      return await this.createConnection(options);
    } catch (error: any) {
      this.logger.error(
        `Failed to create connection for tenant ${options.tenantCode} on attempt ${attempt}: ${error?.message}`,
      );
      TenantConnectionService.metrics.failedConnections++;
      TenantConnectionService.metrics.connectionErrors++;
      if (attempt >= TenantConnectionService.maxRetries) {
        throw error;
      }
      const delay = Math.min(100 * Math.pow(2, attempt), 1000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.createConnectionWithRetry(options, attempt + 1);
    }
  }

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------


  /*───────────────────────────────────────────────────────────*/
  private async safeReleaseQueryRunner(queryRunner: any): Promise<void> {
    try {
      if (queryRunner && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    } catch (error: any) {
      await this.logger.error(`QueryRunner 해제 중 오류: ${error?.message}`);
    }
  }

}
