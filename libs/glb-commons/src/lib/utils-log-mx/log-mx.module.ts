import { DynamicModule, Module } from '@nestjs/common';
import { LogMxModuleInitInterface } from './interface/log-mx-module-init.interface';
import { LogMxLoggerProvider } from './private-providers/log-mx-logger.provider';
import { LogMxProvider } from './public-providers/log-mx.provider';
import { LogMxHttpLoggingInterceptor } from './interceptor/log-mx-http.interceptor';
import { LogMxQueueService } from './private-providers/log-mx-queue.service';
import { LogMxWorkerService } from './private-providers/log-mx-worker.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RnDefaultLogMxEntity } from '../core-typeorm/entity/sub-database/rn-default-log-mx.mysql-entity';
import { RN_DATABASE_SUBMYSQL_CONNECTION_NAME } from '../core-typeorm/utils/typeorm.utils';

@Module({})
export class GlbLogMxModule {
  /**
   * 동기 모듈 초기화
   *
   * 주의! 인터셉터 사용 여부는 메인 모듈 초기화 시 설정해야 함
   */
  static forRoot(options: LogMxModuleInitInterface): DynamicModule {
    return {
      module: GlbLogMxModule,
      imports: [
        TypeOrmModule.forFeature(
          [RnDefaultLogMxEntity],
          RN_DATABASE_SUBMYSQL_CONNECTION_NAME,
        ),
      ],
      providers: [
        LogMxQueueService,
        LogMxWorkerService,
        LogMxLoggerProvider,
        LogMxProvider,
        {
          provide: 'LogMxModule.RootOptions',
          useValue: options,
        },
        ...(options.useInterceptor === true
          ? [
              {
                provide: APP_INTERCEPTOR,
                useClass: LogMxHttpLoggingInterceptor,
              },
            ]
          : []),
      ],
      exports: [LogMxProvider],
    };
  }
}
