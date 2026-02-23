/**
 * LogMxModule 초기화 인터페이스
 *
 * - 주의! 인터셉터 사용 여부는 메인 모듈 초기화 시 설정해야 함
 */
export interface LogMxModuleInitInterface {
  // contextName
  contextName: string;
  // 인터셉터 사용 여부
  useInterceptor: boolean;
  // 큐 설정 (선택적)
  queueOptions?: {
    // 최대 큐 사이즈 (기본값: 10000)
    maxQueueSize?: number;
    // 배치 사이즈 (기본값: 100)
    batchSize?: number;
    // 워커 실행 간격(ms) (기본값: 1000)
    workerIntervalMs?: number;
    // 최소 배치 사이즈 (기본값: 10)
    minBatchSize?: number;
  };
}
