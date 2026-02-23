/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';
import { ServiceRegionModule } from '../utils-service-region/service-region.module';
import { RnDefaultAdminUserEntity } from './entity/default/rn-default-admin-user.mysql-entity';
import { RnDefaultBugfixBoardCommentEntity } from './entity/default/rn-default-bugfix-board-comment.mysql-entity';
import { RnDefaultBugfixBoardEntity } from './entity/default/rn-default-bugfix-board.mysql-entity';
import { RnDefaultInciIngredientHistoryEntity } from './entity/default/rn-default-inci-ingredient-history.mysql-entity';
import { RnDefaultInciIngredientEntity } from './entity/default/rn-default-inci-ingredient.mysql-entity';
import { RnDefaultPcAnalysisEntity } from './entity/default/rn-default-pc-analysis.mysql-entity';
import { RnDefaultPcSavedLookEntity } from './entity/default/rn-default-pc-saved-look.mysql-entity';
import { RnDefaultPcUserEntity } from './entity/default/rn-default-pc-user.mysql-entity';
import { RnDefaultPersonalColorEntity } from './entity/default/rn-default-personal-color.mysql-entity';
import { RnDefaultServiceAccessEntity } from './entity/default/rn-default-service-access.mysql-entity';
import { RnDefaultTenantConfigEntity } from './entity/default/rn-default-tenant-config.mysql-entity';
import { RnDefaultTenantRegionEntity } from './entity/default/rn-default-tenant-region.mysql-entity';
import { RnDefaultTenantEntity } from './entity/default/rn-default-tenant.mysql-entity';
import { RnDefaultUploadFileEntity } from './entity/default/rn-default-upload-file.mysql-entity';
import { RnDefaultRootUserEntity } from './entity/default/rn-default-user.mysql-entity';
import { RnDefaultLogMxEntity } from './entity/sub-database/rn-default-log-mx.mysql-entity';
import { RnDefaultInciIngredientHistoryRepository } from './repository/default/rn-default-inci-ingredient-history.repository';
import { RnDefaultInciIngredientRepository } from './repository/default/rn-default-inci-ingredient.repository';
import { RnDefaultRootAdminUserRepository } from './repository/default/rn-default-root-admin-user.repository';
import { RnDefaultRootUserRepository } from './repository/default/rn-default-root-user.repository';
import { RnDefaultServiceAccessRepository } from './repository/default/rn-default-service-access.repository';
import { RnDefaultTenantRegionRepository } from './repository/default/rn-default-tenant-region.repository';
import { RnDefaultTenantRepository } from './repository/default/rn-default-tenant.repository';
import { RnTenantCbizEmployeeRepository } from './repository/tenant/rn-tenant-cbiz-employee.repository';
import { RnTenantEmployeeAccountRepository } from './repository/tenant/rn-tenant-employee-account.repository';
import { RnTenantPermissionRepository } from './repository/tenant/rn-tenant-permission.repository';
import { RnTenantRoleAndPermissionRepository } from './repository/tenant/rn-tenant-role-and-permission.repository';
import { RnTenantRoleRepository } from './repository/tenant/rn-tenant-role.repository';
import { TenantConnectionService } from './service/tenant/tenant-connection.service';
import { TypeOrmCustomLogger } from './service/typeorm-logger.service';
import { ensureTenantConnection } from './utils/ensure-tenant-connection.utils';
import { RN_DATABASE_SUBMYSQL_CONNECTION_NAME } from './utils/typeorm.utils';

export const RN_MAIN_DATABASE_CONNECTION_NAME = 'rn-main-database';
export const TENANT_INJECT_KEY = Symbol('TENANT_INJECT_KEY');

export const TENANT_CODE_HEADER = 'x-tenant-code';
export const TENANT_CODE_ROOT = 'root';
export const TENANT_CONNECTION_KEY = 'tenantConnection';

export const TYPE_ORM_FOR_FEATURE = TypeOrmModule.forFeature([
  RnDefaultRootUserEntity,
  RnDefaultAdminUserEntity,
  RnDefaultTenantEntity,
  RnDefaultTenantConfigEntity,
  RnDefaultTenantRegionEntity,
  RnDefaultUploadFileEntity,
  RnDefaultBugfixBoardEntity,
  RnDefaultBugfixBoardCommentEntity,
  RnDefaultServiceAccessEntity,
  RnDefaultInciIngredientEntity,
  RnDefaultInciIngredientHistoryEntity,
  RnDefaultPersonalColorEntity,
  RnDefaultPcUserEntity,
  RnDefaultPcAnalysisEntity,
  RnDefaultPcSavedLookEntity,
]);

export const TYPE_ORM_FOR_FEATURE_SUBMYSQL = TypeOrmModule.forFeature(
  [RnDefaultLogMxEntity],
  RN_DATABASE_SUBMYSQL_CONNECTION_NAME,
);

export interface IGlbCoreTypeOrmModuleRegionOptions {
  isUseRegion: boolean;
  serviceRegionId: string;
}

@Module({})
export class GlbCoreTypeOrmModule {
  /**
   * 로그 데이터베이스 접속 정보 조회
   */
  static getLogDbOption(): IGlbCoreTypeOrmModuleLogDbOptions {
    const logDbHost = process?.env?.['SUBMYSQL_DB_HOST'] as any;
    if (!logDbHost) {
      throw new Error('GlbCoreTypeOrmModule - SUBMYSQL_DB_HOST is not set');
    }
    const logDbPort = process?.env?.['SUBMYSQL_DB_PORT'] as any;
    if (!logDbPort) {
      throw new Error('GlbCoreTypeOrmModule - SUBMYSQL_DB_PORT is not set');
    }

    return {
      host: logDbHost,
      port: +parseInt(logDbPort, 10),
      database: 'logsdb',
    };
  }

  /**
   * 메인 데이터베이스 접속 정보 조회
   */
  static getOption(
    region: IGlbCoreTypeOrmModuleRegionOptions | null,
  ): IGlbCoreTypeOrmModuleOptions {
    let dbHost = process?.env?.['HAPROXY_DB_HOST'] as any;
    if (!dbHost) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_HOST is not set');
    }

    let dbPort = process?.env?.['HAPROXY_DB_PORT'] as any;
    if (!dbPort) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_PORT is not set');
    }

    let dbUser = process?.env?.['HAPROXY_DB_USERNAME'] as any;
    if (!dbUser) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_USERNAME is not set');
    }

    let dbPassword = process?.env?.['HAPROXY_DB_PASSWORD'] as any;
    if (!dbPassword) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_PASSWORD is not set');
    }

    const dbSync = process?.env?.['HAPROXY_DB_SYNC'] as any;
    if (!dbSync) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_SYNC is not set');
    }

    const dbName = process?.env?.['HAPROXY_DB_NAME'] as any;
    if (!dbName) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_NAME is not set');
    }

    let dbSlave1Host = process?.env?.['HAPROXY_DB_SLAVE1_HOST'] as any;
    if (!dbSlave1Host) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE1_HOST is not set',
      );
    }
    let dbSlave1Port = process?.env?.['HAPROXY_DB_SLAVE1_PORT'] as any;
    if (!dbSlave1Port) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE1_PORT is not set',
      );
    }
    let dbSlave1User = process?.env?.['HAPROXY_DB_SLAVE1_USERNAME'] as any;
    if (!dbSlave1User) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE1_USERNAME is not set',
      );
    }
    let dbSlave1Password = process?.env?.['HAPROXY_DB_SLAVE1_PASSWORD'] as any;
    if (!dbSlave1Password) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE1_PASSWORD is not set',
      );
    }
    const dbSlave1Database = process?.env?.[
      'HAPROXY_DB_SLAVE1_DATABASE'
    ] as any;
    if (!dbSlave1Database) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE1_DATABASE is not set',
      );
    }

    let dbSlave2Host = process?.env?.['HAPROXY_DB_SLAVE2_HOST'] as any;
    if (!dbSlave2Host) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE2_HOST is not set',
      );
    }
    let dbSlave2Port = process?.env?.['HAPROXY_DB_SLAVE2_PORT'] as any;
    if (!dbSlave2Port) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE2_PORT is not set',
      );
    }
    let dbSlave2User = process?.env?.['HAPROXY_DB_SLAVE2_USERNAME'] as any;
    if (!dbSlave2User) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE2_USERNAME is not set',
      );
    }
    let dbSlave2Password = process?.env?.['HAPROXY_DB_SLAVE2_PASSWORD'] as any;
    if (!dbSlave2Password) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE2_PASSWORD is not set',
      );
    }
    const dbSlave2Database = process?.env?.[
      'HAPROXY_DB_SLAVE2_DATABASE'
    ] as any;
    if (!dbSlave2Database) {
      throw new Error(
        'GlbCoreTypeOrmModule - HAPROXY_DB_SLAVE2_DATABASE is not set',
      );
    }

    return {
      host: dbHost,
      port: +parseInt(dbPort, 10),
      username: dbUser,
      password: dbPassword,
      synchronize: dbSync === 'true' ? true : false,
      /**
       * 아래는 개발 환경에서만 사용하는 설정
       */
      // synchronize: false,
      logging: true,
      charset: 'utf8',
      database: dbName,
      slaves: [
        {
          host: dbSlave1Host,
          port: +parseInt(dbSlave1Port, 10),
          username: dbSlave1User,
          password: dbSlave1Password,
          database: dbSlave1Database,
        },
        {
          host: dbSlave2Host,
          port: +parseInt(dbSlave2Port, 10),
          username: dbSlave2User,
          password: dbSlave2Password,
          database: dbSlave2Database,
        },
      ],
    };
  }

  static forRoot(): DynamicModule {
    const options = this.getOption(null);
    const logDbOption = this.getLogDbOption();

    const dbName = process?.env?.['HAPROXY_DB_NAME'] as any;
    if (!dbName) {
      throw new Error('GlbCoreTypeOrmModule - HAPROXY_DB_NAME is not set');
    }

    // 데이터베이스 접속 정보
    const databaseConfig: TypeOrmModuleAsyncOptions = {
      useFactory: () => ({
        type: 'mysql',
        database: dbName,
        autoLoadEntities: true,
        timezone: 'Asia/Seoul',
        ssl: false,
        keepConnectionAlive: true,
        logging: options.logging,
        charset: options.charset,
        logger: new TypeOrmCustomLogger(),
        synchronize: options.synchronize,
        replication: {
          master: {
            host: options.host,
            port: options.port,
            username: options.username,
            password: options.password,
            database: dbName,
          },
          slaves: options.slaves.map((slave) => ({
            host: slave.host,
            port: slave.port,
            username: slave.username,
            password: slave.password,
            database: slave.database,
          })),
        },
        // 데이터베이스 이름 네이밍 전략을 카멜 케이스로 변경
        // namingStrategy: new SnakeNamingStrategy(),
        entities: [__dirname + '/dist/**/*.mysql-entity.{js,ts}'],
        subscribers: [__dirname + '/dist/**/*.mysql-subscriber.{js,ts}'],
        migrations: [__dirname + '/dist/**/*.mysql-migration.{js,ts}'],
        migrationsTableName: 'typeorm_migrations',
        migrationsTransactionMode: 'each',
        extra: {
          enableKeepAlive: true, // 소켓 keep-alive 활성화
          keepAliveInitialDelay: 30000, // 30 s 후부터 ping
          connectTimeout: 10000, // 10 s 안에 핸드셰이크 실패 → 재시도
        },
      }),
    };

    return {
      global: true,
      module: GlbCoreTypeOrmModule,
      imports: [
        /**
         * 서브 데이터베이스 접속 정보
         */
        TypeOrmModule.forRoot({
          name: RN_DATABASE_SUBMYSQL_CONNECTION_NAME,
          type: 'mysql',
          database: logDbOption.database,
          host: logDbOption.host,
          port: logDbOption.port,
          // --------------------------
          // 부모 설정 복사
          // --------------------------
          autoLoadEntities: true,
          timezone: 'Asia/Seoul',
          ssl: false,
          username: options.username,
          password: options.password,
          logging: options.logging,
          charset: options.charset,
          logger: new TypeOrmCustomLogger(),
          synchronize: options.synchronize,
        }),
        /**
         * 데이터베이스 접속 정보
         */
        TypeOrmModule.forRootAsync({
          ...databaseConfig,

          async dataSourceFactory(options) {
            if (!options) {
              throw new Error('Invalid options passed');
            }

            let dataSource = getDataSourceByName(
              RN_MAIN_DATABASE_CONNECTION_NAME,
            );
            if (!dataSource) {
              dataSource = addTransactionalDataSource({
                dataSource: new DataSource({
                  ...options,
                }),
                name: RN_MAIN_DATABASE_CONNECTION_NAME,
              });
            }

            return dataSource;
          },
        }),
        /**
         * 서비스 리전 모듈
         */
        ServiceRegionModule.forRoot(),
        // -----------------
        TYPE_ORM_FOR_FEATURE,
      ],
      providers: [
        // -----------------
        {
          provide: TENANT_INJECT_KEY,
          scope: Scope.REQUEST,
          useFactory: async (
            request: any,
            tenantConnectionService: TenantConnectionService,
          ) => {
            const tenantConnection = await ensureTenantConnection({
              request,
              tenantConnectionService,
            });
            return tenantConnection;
          },
          inject: [REQUEST, TenantConnectionService],
        },
        // -----------------
        RnDefaultRootUserRepository,
        RnDefaultRootAdminUserRepository,
        RnDefaultTenantRepository,
        RnDefaultServiceAccessRepository,
        RnDefaultTenantRegionRepository,
        TenantConnectionService,
        RnDefaultInciIngredientRepository,
        RnDefaultInciIngredientHistoryRepository,
        {
          provide: 'GlbCoreTypeOrmModule.Options',
          useValue: {
            ...options,
          },
        },
        // -----------------
        // 테넌트
        // -----------------
        RnTenantEmployeeAccountRepository,
        RnTenantRoleRepository,
        RnTenantPermissionRepository,
        RnTenantRoleAndPermissionRepository,
        RnTenantCbizEmployeeRepository,
        // -----------------
      ],
      exports: [
        TenantConnectionService,
        // ------------------
        RnDefaultRootUserRepository,
        RnDefaultRootAdminUserRepository,
        RnDefaultTenantRepository,
        RnDefaultServiceAccessRepository,
        RnDefaultTenantRegionRepository,
        RnDefaultInciIngredientRepository,
        RnDefaultInciIngredientHistoryRepository,
        // -----------------
        // 테넌트
        // -----------------
        RnTenantEmployeeAccountRepository,
        RnTenantRoleRepository,
        RnTenantPermissionRepository,
        RnTenantRoleAndPermissionRepository,
        RnTenantCbizEmployeeRepository,
        // ------------------
        TENANT_INJECT_KEY,
      ],
    };
  }
}

export interface IGlbCoreTypeOrmModuleOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  charset: string;
  slaves: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }[];
}

export interface IGlbCoreTypeOrmModuleLogDbOptions {
  host: string;
  port: number;
  database: string;
}

/**
 * 테넌트 프로바이더 [Middleware 주입 전용]
 */
export const TenantProviderForMiddlewareInjectOnly = [
  {
    provide: 'GlbCoreTypeOrmModule.Options',
    useValue: {
      ...GlbCoreTypeOrmModule.getOption(null),
    },
  },
];
