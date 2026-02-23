import { Inject, Injectable } from '@nestjs/common';
import { LogMxModuleInitInterface } from '../interface/log-mx-module-init.interface';
import { LogMxQueueService } from './log-mx-queue.service';

@Injectable()
export class LogMxLoggerProvider {
  constructor(
    @Inject('LogMxModule.RootOptions')
    private readonly options: LogMxModuleInitInterface,
    private readonly queueService: LogMxQueueService,
  ) {}

  /**
   * 로그 정보를 큐에 저장 (비동기, 논블로킹)
   */
  saveLog(options: {
    level: string;
    message: string;
    method?: string;
    url?: string;
    statusCode?: number;
    ip?: string;
    resultCode?: string;
    userAgent?: string;
    userId?: string;
    tenantCode?: string;
  }): void {
    // 큐에 로그 정보 추가 (즉시 반환)
    this.queueService.enqueue({
      level: options.level,
      message: options.message,
      contextName: this.options.contextName,
      method: options.method,
      url: options.url,
      statusCode: options.statusCode,
      ip: options.ip,
      resultCode: options.resultCode,
      userAgent: options.userAgent,
      userId: options.userId,
      tenantCode: options.tenantCode,
    });
  }

  /**
   * 큐 상태 확인용 메서드
   */
  getQueueStats() {
    return this.queueService.getStats();
  }
}
