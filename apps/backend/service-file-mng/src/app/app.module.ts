import {
  GlbCommonResponseModule,
  GlbCoreAclModule,
  GlbCoreMinioModule,
  GlbCoreTypeOrmModule,
  GlbLogMxModule,
  GlbRateLimitModule,
  GlbRedisCoreModule,
  RedisCacheModule,
  ServiceAccessModule,
  TenantProviderForMiddlewareInjectOnly,
  UtilTypeOrmMiddleware,
} from '@capstone-project/glb-commons';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FileManagerModule } from '../core/file-manager/file-manager.module';

@Module({
  imports: [
    // ----------------------------
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ----------------------------
    ScheduleModule.forRoot(),
    /**
     * 서비스 접근 모듈
     */
    ServiceAccessModule.forRoot({
      serviceName: 'file-mng',
    }),
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-FILE-MNG-ROOT',
      useInterceptor: true,
    }),
    /**
     * Redis Cache 모듈 (GlbCoreTypeOrmModule보다 먼저 import되어야 함)
     */
    RedisCacheModule.forRoot(),
    /**
     * Redis 모듈
     */
    GlbRedisCoreModule.forRoot({
      isGlobal: true,
    }),
    /**
     * 공통 응답 모듈
     */
    GlbCommonResponseModule.forRoot({
      serverName: process?.env?.SERVER_NAME,
      excludePaths: ['every/file-manager/download'],
    }),
    /**
     * Rate Limit 모듈
     */
    GlbRateLimitModule.forRoot({
      rateLimitNoCheckHeaderName: process.env.RATE_LIMIT_NO_CHECK_HEADER_NAME,
      rateLimitNoCheckMasterKey: process.env.RATE_LIMIT_NO_CHECK_HEADER_VALUE,
      throttler: [
        {
          name: 'default',
          ttl: 10000,
          limit: 300,
        },
      ],
    }),
    /**
     * TypeORM 모듈
     */
    GlbCoreTypeOrmModule.forRoot(),
    /**
     * 권한 관리 모듈
     */
    GlbCoreAclModule.forRoot({
      isGlobal: true,
    }),
    /**
     * MinIO 모듈
     */
    GlbCoreMinioModule.forRoot(),
    // ----------------------------
    FileManagerModule,
  ],
  controllers: [],
  providers: [...TenantProviderForMiddlewareInjectOnly],
})
export class AppModule extends UtilTypeOrmMiddleware {}
