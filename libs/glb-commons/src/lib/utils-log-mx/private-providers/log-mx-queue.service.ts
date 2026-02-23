import { Injectable, Inject } from '@nestjs/common';
import { LogMxModuleInitInterface } from '../interface/log-mx-module-init.interface';

export interface LogMxQueueItem {
  level: string;
  message: string;
  contextName: string;
  method?: string;
  url?: string;
  statusCode?: number;
  ip?: string;
  resultCode?: string;
  userAgent?: string;
  userId?: string;
  tenantCode?: string;
  timestamp: Date;
}

@Injectable()
export class LogMxQueueService {
  private static _instance: LogMxQueueService;
  private readonly queue: LogMxQueueItem[] = [];
  private readonly maxQueueSize: number;
  private readonly batchSize: number;

  constructor(
    @Inject('LogMxModule.RootOptions')
    readonly options: LogMxModuleInitInterface,
  ) {
    if (LogMxQueueService._instance) {
      // 이미 인스턴스가 있으면 기존 인스턴스 반환
      return LogMxQueueService._instance;
    }

    this.maxQueueSize = options.queueOptions?.maxQueueSize ?? 10000;
    this.batchSize = options.queueOptions?.batchSize ?? 100;
    LogMxQueueService._instance = this;
  }

  static getInstance(): LogMxQueueService {
    return LogMxQueueService._instance;
  }

  /**
   * 로그 아이템을 큐에 추가
   */
  enqueue(item: Omit<LogMxQueueItem, 'timestamp'>): void {
    // 큐 사이즈 제한 체크
    if (this.queue.length >= this.maxQueueSize) {
      // 큐가 가득 찬 경우 오래된 로그부터 제거
      this.queue.shift();
    }

    this.queue.push({
      ...item,
      timestamp: new Date(),
    });
  }

  /**
   * 큐에서 배치 단위로 아이템들을 가져옴
   */
  dequeue(size: number = this.batchSize): LogMxQueueItem[] {
    const items = this.queue.splice(0, Math.min(size, this.queue.length));
    return items;
  }

  /**
   * 큐의 현재 크기 반환
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * 큐가 비어있는지 확인
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * 큐 상태 정보 반환
   */
  getStats(): {
    queueSize: number;
    maxQueueSize: number;
    batchSize: number;
  } {
    return {
      queueSize: this.queue.length,
      maxQueueSize: this.maxQueueSize,
      batchSize: this.batchSize,
    };
  }
}
