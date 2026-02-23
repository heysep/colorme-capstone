import { DynamicModule } from '@nestjs/common';
import { ExcelUtilService } from './service/excel-util.service';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';

export class ExcelUtilModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ExcelUtilModule,
      imports: [
        GlbLogMxModule.forRoot({
          contextName: 'ExcelUtilModule',
          useInterceptor: false,
        }),
        // -----------
      ],
      providers: [ExcelUtilService],
      exports: [ExcelUtilService],
    };
  }
}
