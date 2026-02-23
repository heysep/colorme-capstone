import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './rate-limit.guard';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';
import { GlbRedisCoreModule } from '../core-redis/redis-root.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import {
  getRedisClientConfig,
  getRedisClusterClientConfig,
  loadRedisEnv,
} from '../core-redis/redis-env-loader.utils';
import Redis, { Cluster } from 'ioredis';

@Module({})
export class GlbRateLimitModule {
  static forRoot(option: ThrottlerModuleOptions): DynamicModule {
    const redisClientConfig = loadRedisEnv();
    const redisClient: Redis | Cluster = redisClientConfig?.isDev
      ? getRedisClientConfig(redisClientConfig)
      : getRedisClusterClientConfig(redisClientConfig);

    return {
      controllers: [],
      module: GlbRateLimitModule,
      exports: [],
      imports: [
        GlbRedisCoreModule.forRoot({
          isGlobal: false,
        }),
        GlbLogMxModule.forRoot({
          contextName: 'GlbRateLimitModule',
          useInterceptor: false,
        }),
        ThrottlerModule.forRoot({
          throttlers: option?.throttler
            ? option.throttler.map((x) => {
                return {
                  name: x.name,
                  ttl: x.ttl,
                  limit: x.limit,
                };
              })
            : [
                {
                  name: 'default',
                  ttl: 1000,
                  limit: 1,
                },
              ],

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storage: new ThrottlerStorageRedisService(redisClient as any),
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerBehindProxyGuard,
        },
        {
          provide: 'ThrottlerModuleOptions.RootOptions',
          useValue: option,
        },
      ],
    };
  }
}

export interface ThrottlerModuleOptions {
  rateLimitNoCheckHeaderName?: string; // Rate Limiting 을 적용하지 않을 API 를 구분할 Header 이름
  rateLimitNoCheckMasterKey?: string; // Rate Limiting 을 적용하지 않을 API 를 구분할 Header 값
  throttler?: {
    // Rate Limiting 설정
    name: string;
    ttl: number;
    limit: number;
  }[];
}
