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
import { PersonalColorModule } from '../core/personal-color/personal-color.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServiceAccessModule.forRoot({
      serviceName: 'personal-color',
    }),
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-PERSONAL-COLOR-ROOT',
      useInterceptor: true,
    }),
    RedisCacheModule.forRoot(),
    GlbRedisCoreModule.forRoot({
      isGlobal: true,
    }),
    GlbCommonResponseModule.forRoot({
      serverName: process?.env?.SERVER_NAME,
      excludePaths: [],
    }),
    GlbRateLimitModule.forRoot({
      rateLimitNoCheckHeaderName: process.env.RATE_LIMIT_NO_CHECK_HEADER_NAME,
      rateLimitNoCheckMasterKey: process.env.RATE_LIMIT_NO_CHECK_HEADER_VALUE,
      throttler: [
        {
          name: 'default',
          ttl: 10000,
          limit: 20,
        },
      ],
    }),
    GlbCoreTypeOrmModule.forRoot(),
    GlbCoreAclModule.forRoot({
      isGlobal: true,
    }),
    GlbCoreMinioModule.forRoot(),
    PersonalColorModule,
  ],
  controllers: [],
  providers: [...TenantProviderForMiddlewareInjectOnly],
})
export class AppModule extends UtilTypeOrmMiddleware {}
