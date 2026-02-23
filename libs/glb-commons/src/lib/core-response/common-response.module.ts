import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/common-response.interceptor';
import { CommonHelloServerService } from './service/common-hello-server.service';
import { CommonHelloServerController } from './controller/common-hello-server.controller';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';
import {
  CommonExceptionFilter,
  CommonHttpExceptionFilter,
} from './filter/common-exception.filter';

@Module({})
export class GlbCommonResponseModule {
  static forRoot(option: CommonResponseModuleOptions): DynamicModule {
    return {
      controllers: [CommonHelloServerController],
      module: GlbCommonResponseModule,
      imports: [
        GlbLogMxModule.forRoot({
          contextName: 'GlbCommonResponseModule',
          useInterceptor: false,
        }),
      ],
      global: true,
      providers: [
        CommonHelloServerService,
        {
          provide: 'CommonResponseModule.RootOptions',
          useValue: option,
        },
        ...(option.isWorkerModule === false ||
        option.isWorkerModule === undefined ||
        option.isWorkerModule === null
          ? [
              {
                provide: APP_INTERCEPTOR,
                useClass: TransformInterceptor,
              },
              {
                provide: APP_FILTER,
                useClass: CommonExceptionFilter,
              },
              {
                provide: APP_FILTER,
                useClass: CommonHttpExceptionFilter,
              },
            ]
          : []),
      ],
    };
  }
}

export interface CommonResponseModuleOptions {
  /**
   * 서버 이름
   */
  serverName: string;
  // 인터셉터에서 제외할 경로
  excludePaths?: string[];
  /**
   * 워커 모듈인지 여부
   */
  isWorkerModule?: boolean;
}
