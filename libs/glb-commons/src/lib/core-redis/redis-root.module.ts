import { DynamicModule, Module } from '@nestjs/common';
import { GlbRedisCacheSystemService } from './service/redis-cache-system.service';
import { GlbRedisCoreService } from './service/redis-root.service';
import { GlbRedisDistributedLockService } from './service/redis-distributed-lock.service';
import { loadRedisEnv, RedisClientConfig } from './redis-env-loader.utils';

@Module({})
export class GlbRedisCoreModule {
  static forRoot(options: GlbRedisCoreModuleOptions): DynamicModule {
    return {
      module: GlbRedisCoreModule,
      global: options.isGlobal,
      providers: [
        GlbRedisCacheSystemService,
        GlbRedisCoreService,
        GlbRedisDistributedLockService,
        {
          provide: 'GlbRedisCoreModule.RootConfig',
          useFactory: (): RedisClientConfig => loadRedisEnv(),
        },
      ],
      exports: [
        GlbRedisCoreService,
        GlbRedisCacheSystemService,
        GlbRedisDistributedLockService,
      ],
    };
  }
}

export interface GlbRedisCoreModuleOptions {
  isGlobal: boolean;
}
