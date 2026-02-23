/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogMxQueueService, LogMxQueueItem } from './log-mx-queue.service';
import { RnDefaultLogMxEntity } from '../../core-typeorm/entity/sub-database/rn-default-log-mx.mysql-entity';
import { RN_DATABASE_SUBMYSQL_CONNECTION_NAME } from '../../core-typeorm/utils/typeorm.utils';

@Injectable()
export class LogMxWorkerService implements OnModuleInit, OnModuleDestroy {
  private static _instance: LogMxWorkerService;
  private readonly logger = new Logger(LogMxWorkerService.name);
  private workerInterval: NodeJS.Timeout | null = null;
  private readonly intervalMs = 1000; // 1초마다 큐 확인
  private readonly minBatchSize = 100; // 최소 배치 사이즈
  private isRunning = false;

  constructor(
    @InjectRepository(
      RnDefaultLogMxEntity,
      RN_DATABASE_SUBMYSQL_CONNECTION_NAME,
    )
    private readonly logRepository: Repository<RnDefaultLogMxEntity>,
    private readonly queueService: LogMxQueueService,
  ) {
    if (LogMxWorkerService._instance) {
      // 이미 인스턴스가 있으면 기존 인스턴스 반환
      return LogMxWorkerService._instance;
    }
    LogMxWorkerService._instance = this;
  }

  static getInstance(): LogMxWorkerService {
    return LogMxWorkerService._instance;
  }

  async onModuleInit(): Promise<void> {
    // 이미 워커가 실행 중이면 시작하지 않음
    if (this.isRunning) {
      this.logger.log('LogMx Worker already running, skipping start');
      return;
    }

    this.startWorker();
    this.logger.log('LogMx Worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.stopWorker();
    this.logger.log('LogMx Worker stopped');
  }

  /**
   * 워커 시작
   */
  private startWorker(): void {
    if (this.workerInterval || this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.workerInterval = setInterval(async () => {
      try {
        await this.processQueue();
      } catch (error) {
        this.logger.error('Error processing log queue:', error);
      }
    }, this.intervalMs);
  }

  /**
   * 워커 중지
   */
  private async stopWorker(): Promise<void> {
    this.isRunning = false;

    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }

    // 남은 큐 모두 처리
    await this.processQueue();
  }

  /**
   * 큐에서 로그를 가져와서 배치로 저장
   */
  private async processQueue(): Promise<void> {
    if (this.queueService.isEmpty()) {
      return;
    }

    // 큐 사이즈가 최소 배치 사이즈보다 작으면 대기 (단, 워커 종료 시에는 모두 처리)
    const queueSize = this.queueService.size();
    if (queueSize < this.minBatchSize && this.isRunning) {
      return;
    }

    const items = this.queueService.dequeue();
    if (items.length === 0) {
      return;
    }

    try {
      await this.saveBatch(items);
      this.logger.debug(`Processed ${items.length} log items`);
    } catch (error) {
      this.logger.error(`Failed to save batch of ${items.length} logs:`, error);

      // 실패한 로그들을 다시 큐에 넣기 (최대 3회까지만)
      const retriableItems = items.filter((item) => {
        const retryCount = (item as any).retryCount || 0;
        return retryCount < 3;
      });

      retriableItems.forEach((item) => {
        (item as any).retryCount = ((item as any).retryCount || 0) + 1;
        this.queueService.enqueue(item);
      });
    }
  }

  /**
   * 로그 배치를 데이터베이스에 저장
   */
  private async saveBatch(items: LogMxQueueItem[]): Promise<void> {
    const entities = items.map((item) =>
      this.logRepository.create({
        level: item.level,
        message: item.message,
        contextName: item.contextName,
        method: item.method,
        url: item.url,
        statusCode: item.statusCode,
        ip: item.ip,
        resultCode: item.resultCode,
        userAgent: item.userAgent,
        userId: item.userId,
        tenantCode: item.tenantCode,
        createdAt: item.timestamp,
      }),
    );

    // 배치 저장으로 성능 최적화
    await this.logRepository.save(entities);
  }

  /**
   * 워커 상태 정보 반환
   */
  getWorkerStats(): {
    isRunning: boolean;
    intervalMs: number;
    minBatchSize: number;
    queueStats: ReturnType<LogMxQueueService['getStats']>;
  } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      minBatchSize: this.minBatchSize,
      queueStats: this.queueService.getStats(),
    };
  }
}
