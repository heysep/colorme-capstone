import { DynamicModule, Module } from '@nestjs/common';
import { ServiceAccessCacheService } from './service-access-cache.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceAccessInterceptor } from './service-access.interceptor';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';

/**
 * 서비스 접근 모듈
 *
 * @author 최시훈
 * @since 2025-10-01
 */
export interface ServiceAccessModuleOptions {
  serviceName: string;
}

@Module({})
export class ServiceAccessModule {
  static forRoot(options: ServiceAccessModuleOptions): DynamicModule {
    return {
      global: true,
      module: ServiceAccessModule,
      imports: [
        /**
         * 로깅 모듈
         */
        GlbLogMxModule.forRoot({
          contextName: 'GLB-UTILS-SERVICE-ACCESS',
          useInterceptor: false,
        }),
      ],
      providers: [
        ServiceAccessCacheService,
        {
          provide: 'SERVICE_ACCESS_NAME',
          useValue: options.serviceName,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ServiceAccessInterceptor,
        },
      ],
      exports: [ServiceAccessCacheService],
    };
  }
}
