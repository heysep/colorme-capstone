import { DynamicModule, Module } from '@nestjs/common';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';
import { ServiceRegionCacheService } from './service-region-cache.service';

@Module({})
export class ServiceRegionModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ServiceRegionModule,
      imports: [
        /**
         * 로깅 모듈
         */
        GlbLogMxModule.forRoot({
          contextName: 'GLB-UTILS-SERVICE-REGION',
          useInterceptor: false,
        }),
      ],
      providers: [ServiceRegionCacheService],
      exports: [ServiceRegionCacheService],
    };
  }
}
