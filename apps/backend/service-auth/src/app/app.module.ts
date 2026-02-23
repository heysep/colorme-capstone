import {
  CbizTenantSlimiterModule,
  TenantWriteRestrictionGuard,
} from '@drvalue-bmes-backend/cbiz-commons';
import {
  GlbCommonResponseModule,
  GlbCoreAclModule,
  GlbCoreTypeOrmModule,
  GlbLogMxModule,
  GlbRateLimitModule,
  GlbRedisCoreModule,
  RedisCacheModule,
  ServiceAccessModule,
  TenantProviderForMiddlewareInjectOnly,
  UtilTypeOrmMiddleware,
} from '@drvalue-bmes-backend/glb-commons';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../core/auth/auth.module';
import { TenantModule } from '../core/tenant/tenant.module';

@Module({
  imports: [
    // ----------------------------
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ----------------------------
    CbizTenantSlimiterModule,
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-AUTH-ROOT',
      useInterceptor: true,
    }),
    ScheduleModule.forRoot(),
    /**
     * 서비스 접근 모듈
     */
    ServiceAccessModule.forRoot({
      serviceName: 'auth',
    }),
    /**
     * 공통 응답 모듈
     */
    GlbCommonResponseModule.forRoot({
      serverName: process?.env?.SERVER_NAME,
      excludePaths: [],
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
     * Rate Limit 모듈
     */
    GlbRateLimitModule.forRoot({
      rateLimitNoCheckHeaderName: process.env.RATE_LIMIT_NO_CHECK_HEADER_NAME,
      rateLimitNoCheckMasterKey: process.env.RATE_LIMIT_NO_CHECK_HEADER_VALUE,
      throttler: [
        {
          name: 'default',
          ttl: 10000,
          limit: 100,
        },
        {
          name: 'medium',
          ttl: 6000,
          limit: 500,
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
    // -------------
    AuthModule,
    TenantModule,
    // -------------
  ],
  controllers: [],
  providers: [
    ...TenantProviderForMiddlewareInjectOnly,
    {
      provide: APP_GUARD,
      useClass: TenantWriteRestrictionGuard,
    },
  ],
})
export class AppModule extends UtilTypeOrmMiddleware {}
