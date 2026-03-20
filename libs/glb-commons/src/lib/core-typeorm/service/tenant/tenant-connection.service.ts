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
import { getTzDayjs, rnDayjs } from '../../../utils-dayjs/utils-dayjs.util';
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
            `CREATE DATABASE ${TENANT_CONNECTION_TEST_TENANT_CODE}`,
          );

          /**
           * 테이블 초기화
           */
          await this.executeProvisioningWithTransaction({
            dbName: TENANT_CONNECTION_TEST_TENANT_CODE,
            name: '[SYSTEM] 테넌트 연결 상태 확인 전용 테넌트',
            code: TENANT_CONNECTION_TEST_TENANT_CODE,
            domainName: TENANT_CONNECTION_TEST_TENANT_CODE,
          });

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
  private async executeProvisioningWithTransaction(data: {
    dbName: string;
    name: string;
    code: string;
    domainName: string;
  }): Promise<void> {
    // 멱등성 체크 - 이미 존재하는 테넌트인지 확인
    const existingTenant = await this.tenantRepository.repository.findOne({
      where: { dbName: data.dbName },
    });

    if (existingTenant) {
      await this.logger.log(`이미 존재하는 테넌트: ${data.dbName}`);
    }

    const dbConfig = GlbCoreTypeOrmModule.getOption(null);
    let rootDs: DataSource | null = null;
    let subConnection: DataSource | null = null;
    let schemaCreated = false;
    let ddlExecuted = false;

    try {
      await this.logger.log(`테넌트 프로비저닝 시작: ${data.dbName}`);

      // 1단계: Root DB 연결 및 스키마 생성
      rootDs = new DataSource({
        type: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        charset: 'utf8mb4',
        timezone: 'Asia/Seoul',
        logging: false,
        extra: {
          connectionLimit: 1,
          multipleStatements: true,
          enableKeepAlive: true,
          keepAliveInitialDelay: 30_000,
          connectTimeout: 30_000, // 30초로 증가
        },
      });

      await rootDs.initialize();
      await this.logger.log(`Root DB 연결 성공: ${data.dbName}`);

      // 스키마 생성 및 DDL 실행을 트랜잭션으로 처리
      const queryRunner = rootDs.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 스키마 생성
        await this.createSchemaWithTransaction(queryRunner, data.dbName);
        schemaCreated = true;
        await this.logger.log(`스키마 생성 완료: ${data.dbName}`);

        // DDL 실행
        await this.executeDDLWithTransaction(queryRunner, data.dbName);
        ddlExecuted = true;
        await this.logger.log(`DDL 실행 완료: ${data.dbName}`);

        await queryRunner.commitTransaction();
        await this.logger.log(
          `스키마 및 DDL 트랜잭션 커밋 완료: ${data.dbName}`,
        );
      } catch (error: any) {
        await queryRunner.rollbackTransaction();
        await this.logger.error(
          `스키마/DDL 트랜잭션 롤백: ${data.dbName} - ${error?.message}`,
        );
        throw error;
      } finally {
        await this.safeReleaseQueryRunner(queryRunner);
      }

      // 2단계: 테넌트 DB 연결 및 비즈니스 초기화
      subConnection = new DataSource({
        type: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        charset: 'utf8mb4',
        timezone: 'Asia/Seoul',
        logging: false,
        database: data.dbName,
        synchronize: false,
        extra: {
          connectionLimit: 1,
          multipleStatements: true,
          enableKeepAlive: true,
          keepAliveInitialDelay: 30_000,
          connectTimeout: 30_000, // 30초로 증가
        },
        entities: [
          RnTenantEmployeeAccountEntity,
          RnTenantPermissionEntity,
          RnTenantRoleEntity,
          RnTenantRoleAndPermissionEntity,
          RnTenantPermissionByMenuEntity,
          RnTenantUserAiMetadataEntity,
          ...CBIZ_GROUP_ENTITY,
        ],
      });

      await subConnection.initialize();
      await this.logger.log(`테넌트 DB 연결 성공: ${data.dbName}`);

      // 3단계: 테넌트 정보 저장 (메인 DB 트랜잭션)
      const tenantQueryRunner =
        this.tenantRepository.repository.manager.connection.createQueryRunner();
      await tenantQueryRunner.connect();
      await tenantQueryRunner.startTransaction();

      try {
        const newTenant = this.tenantRepository.repository.create({
          name: data.name,
          code: data.code,
          dbName: data.dbName,
          domainName: data.domainName || 'default',
          regionConfig: 'root',
        });

        await tenantQueryRunner.manager.save(newTenant);
        await tenantQueryRunner.commitTransaction();
        await this.logger.log(`테넌트 정보 저장 완료: ${data.dbName}`);
      } catch (error: any) {
        await tenantQueryRunner.rollbackTransaction();
        await this.logger.error(
          `테넌트 정보 저장 실패: ${data.dbName} - ${error?.message}`,
        );
        throw error;
      } finally {
        await this.safeReleaseQueryRunner(tenantQueryRunner);
      }

      await this.logger.log(`테넌트 프로비저닝 전체 완료: ${data.dbName}`);
    } catch (e: any) {
      await this.logger.error(
        `프로비저닝 실패: ${data.dbName} - ${e?.message}`,
      );

      // 부분 실패 시 롤백 처리
      await this.handlePartialFailureRollback(data.dbName, {
        schemaCreated,
        ddlExecuted,
      });
    } finally {
      // 안전한 리소스 정리
      await this.safeCleanupConnections(rootDs, subConnection);
    }
  }

  /*───────────────────────────────────────────────────────────*/
  private async createSchemaWithTransaction(
    queryRunner: any,
    dbName: string,
  ): Promise<void> {
    // DB명 유효성 검사 (SQL Injection 방지)
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(`Invalid database name format: ${dbName}`);
    }

    await queryRunner.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    // 스키마 전환
    await queryRunner.query(`USE \`${dbName}\``);
  }

  /*───────────────────────────────────────────────────────────*/
  private async executeDDLWithTransaction(
    queryRunner: any,
    dbName: string,
  ): Promise<void> {
    const path = require('path');
    const resourcePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'resources',
      'provisioning-tenant',
    );

    const fs = require('fs/promises');

    // 디렉토리 존재 확인
    try {
      await fs.access(resourcePath);
    } catch {
      throw new Error(
        `DDL 리소스 디렉토리를 찾을 수 없습니다: ${resourcePath}`,
      );
    }

    // 파일 목록 읽기
    const files = await fs.readdir(resourcePath);

    if (files.length === 0) {
      throw new Error(`DDL 파일이 존재하지 않습니다: ${resourcePath}`);
    }

    // 날짜 형식 파일 필터링 및 정렬
    const validFiles = files.filter((file: string) =>
      /^\d{8}_.*\.sql$/i.test(file),
    );

    if (validFiles.length === 0) {
      throw new Error(
        `유효한 DDL 파일 형식(YYYYMMDD_*.sql)이 없습니다: ${resourcePath}`,
      );
    }

    // 최신 파일 선택 (날짜와 버전 고려)
    const latestFile = validFiles.sort((a: string, b: string) => {
      // 버전 형식 파일 매칭 (YYYYMMDD_v{major}.{minor}.sql)
      const aVersionMatch = a.match(/^(\d{8})_v(\d+)\.(\d+)\.sql$/i);
      const bVersionMatch = b.match(/^(\d{8})_v(\d+)\.(\d+)\.sql$/i);

      if (aVersionMatch && bVersionMatch) {
        // 둘 다 버전 형식인 경우
        const aDate = aVersionMatch[1];
        const bDate = bVersionMatch[1];

        // 날짜 먼저 비교
        const dateDiff = getTzDayjs(rnDayjs(bDate, 'YYYYMMDD', true)).diff(
          getTzDayjs(rnDayjs(aDate, 'YYYYMMDD', true)),
        );

        if (dateDiff !== 0) {
          return dateDiff;
        }

        // 날짜가 같으면 버전 비교 (최신 버전이 앞에 오도록)
        const aMajor = parseInt(aVersionMatch[2]);
        const aMinor = parseInt(aVersionMatch[3]);
        const bMajor = parseInt(bVersionMatch[2]);
        const bMinor = parseInt(bVersionMatch[3]);

        if (bMajor !== aMajor) {
          return bMajor - aMajor;
        }

        return bMinor - aMinor;
      } else if (aVersionMatch || bVersionMatch) {
        // 하나만 버전 형식인 경우
        const aDate = aVersionMatch ? aVersionMatch[1] : a.split('_')[0];
        const bDate = bVersionMatch ? bVersionMatch[1] : b.split('_')[0];

        const dateDiff = getTzDayjs(rnDayjs(bDate, 'YYYYMMDD', true)).diff(
          getTzDayjs(rnDayjs(aDate, 'YYYYMMDD', true)),
        );

        if (dateDiff !== 0) {
          return dateDiff;
        }

        // 날짜가 같으면 버전 형식을 우선
        return bVersionMatch ? 1 : -1;
      } else {
        // 둘 다 기존 형식 (날짜만 비교)
        const aDate = a.split('_')[0];
        const bDate = b.split('_')[0];
        return getTzDayjs(rnDayjs(bDate, 'YYYYMMDD', true)).diff(
          getTzDayjs(rnDayjs(aDate, 'YYYYMMDD', true)),
        );
      }
    })[0];

    const fullPath = path.join(resourcePath, latestFile);

    await this.logger.log(`DDL 파일 선택: ${latestFile} for ${dbName}`);

    // DDL 파일 읽기 및 실행
    const ddl = await fs.readFile(fullPath, 'utf8');

    if (!ddl.trim()) {
      throw new Error(`DDL 파일이 비어있습니다: ${fullPath}`);
    }

    await queryRunner.query(ddl);
    await this.logger.log(`DDL 실행 완료: ${latestFile} for ${dbName}`);
  }

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

  /*───────────────────────────────────────────────────────────*/
  private async safeCleanupConnections(
    rootDs: DataSource | null,
    subConnection: DataSource | null,
  ): Promise<void> {
    const cleanupPromises = [];

    if (rootDs) {
      cleanupPromises.push(
        rootDs
          .destroy()
          .catch((error) =>
            this.logger.error(
              `Root DataSource 정리 중 오류: ${error?.message}`,
            ),
          ),
      );
    }

    if (subConnection) {
      cleanupPromises.push(
        subConnection
          .destroy()
          .catch((error) =>
            this.logger.error(`Sub DataSource 정리 중 오류: ${error?.message}`),
          ),
      );
    }

    // 모든 정리 작업을 병렬로 실행
    await Promise.all(cleanupPromises);
  }

  /*───────────────────────────────────────────────────────────*/
  private async handlePartialFailureRollback(
    dbName: string,
    state: {
      schemaCreated: boolean;
      ddlExecuted: boolean;
    },
  ): Promise<void> {
    try {
      await this.logger.log(
        `부분 실패 롤백 시작: ${dbName} - Schema: ${state.schemaCreated}, DDL: ${state.ddlExecuted}`,
      );

      // 생성된 스키마가 있다면 삭제 시도 (주의: 운영환경에서는 신중하게 고려)
      if (state.schemaCreated) {
        try {
          const dbConfig = GlbCoreTypeOrmModule.getOption(null);
          const cleanupDs = new DataSource({
            type: 'mysql',
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.username,
            password: dbConfig.password,
            charset: 'utf8mb4',
            timezone: 'Asia/Seoul',
            logging: false,
            extra: {
              connectionLimit: 1,
              connectTimeout: 10_000,
            },
          });

          await cleanupDs.initialize();
          const qr = cleanupDs.createQueryRunner();
          await qr.connect();

          try {
            // 주의: 실제 운영환경에서는 스키마 삭제 대신 상태 플래그 관리를 고려
            await qr.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
            await this.logger.log(`롤백: 스키마 삭제 완료 - ${dbName}`);
          } finally {
            await qr.release();
            await cleanupDs.destroy();
          }
        } catch (cleanupError: any) {
          await this.logger.error(
            `롤백 중 스키마 삭제 실패: ${dbName} - ${cleanupError?.message}`,
          );
        }
      }

      await this.logger.log(`부분 실패 롤백 완료: ${dbName}`);
    } catch (rollbackError: any) {
      await this.logger.error(
        `롤백 처리 중 예상치 못한 오류: ${dbName} - ${rollbackError?.message}`,
      );
    }
  }
}
