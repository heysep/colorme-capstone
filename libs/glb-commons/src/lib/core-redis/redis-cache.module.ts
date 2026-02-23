import { DynamicModule, Module } from '@nestjs/common';
import { GlbRedisCoreModule } from './redis-root.module';
import { RedisCacheInterceptor } from './interceptor/redis-cache.interceptor';

@Module({})
export class RedisCacheModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: RedisCacheModule,
      imports: [GlbRedisCoreModule],
      providers: [RedisCacheInterceptor],
      exports: [RedisCacheInterceptor],
    };
  }
}
