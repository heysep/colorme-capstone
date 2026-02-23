import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RnDefaultServiceAccessRepository } from '../core-typeorm/repository/default/rn-default-service-access.repository';
import { RnDefaultServiceAccessEntity } from '../core-typeorm/entity/default/rn-default-service-access.mysql-entity';

/**
 * 서비스 접근 제한 정보 캐시 서비스
 * 1분마다 DB에서 서비스 접근 제한 정보를 조회하여 Map에 캐시
 *
 * @author 최시훈
 * @since 2025-10-01
 */
@Injectable()
export class ServiceAccessCacheService implements OnApplicationBootstrap {
  private static logger = new Logger(ServiceAccessCacheService.name);

  // 서비스 접근 제한 정보를 저장하는 Map (key: string, value: string)
  private static serviceAccessMap = new Map<string, string>();

  // 크론 실행 중인지 확인하는 플래그
  private static isCronRunning = false;

  constructor(
    private readonly serviceAccessRepository: RnDefaultServiceAccessRepository,
  ) {}

  /**
   * 애플리케이션 시작 시 초기 데이터 로드
   */
  async onApplicationBootstrap() {
    ServiceAccessCacheService.logger.log(
      'ServiceAccessCacheService 초기화 시작',
    );
    await this.loadServiceAccessData();
    ServiceAccessCacheService.logger.log(
      'ServiceAccessCacheService 초기화 완료',
    );
  }

  /**
   * 1분마다 서비스 접근 제한 정보 조회 및 캐시 업데이트
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleServiceAccessCacheCron() {
    // 이미 실행 중이면 스킵
    if (ServiceAccessCacheService.isCronRunning) {
      ServiceAccessCacheService.logger.warn(
        '서비스 접근 제한 정보 캐시 크론이 이미 실행 중입니다.',
      );
      return;
    }

    ServiceAccessCacheService.isCronRunning = true;

    try {
      await this.loadServiceAccessData();
    } catch (error) {
      ServiceAccessCacheService.logger.error(
        '서비스 접근 제한 정보 캐시 업데이트 실패:',
        error,
      );
    } finally {
      ServiceAccessCacheService.isCronRunning = false;
    }
  }

  /**
   * DB에서 서비스 접근 제한 정보를 조회하여 Map에 저장
   */
  private async loadServiceAccessData(): Promise<void> {
    try {
      const serviceAccessList: RnDefaultServiceAccessEntity[] =
        await this.serviceAccessRepository.repository.find();

      // 기존 Map 클리어
      ServiceAccessCacheService.serviceAccessMap.clear();

      // 새로운 데이터로 Map 업데이트
      serviceAccessList.forEach((item) => {
        ServiceAccessCacheService.serviceAccessMap.set(item.key, item.value);
      });
    } catch (error) {
      ServiceAccessCacheService.logger.error(
        '서비스 접근 제한 정보 조회 실패:',
        error,
      );
      throw error;
    }
  }

  /**
   * 캐시된 서비스 접근 제한 정보 조회
   * @param key 서비스 접근 제한 정보 키
   * @returns 서비스 접근 제한 정보 값 (없으면 undefined)
   */
  static getServiceAccessValue(key: string): string | undefined {
    return ServiceAccessCacheService.serviceAccessMap.get(key);
  }

  /**
   * 특정 서비스의 접근 제한 여부 확인
   * @param serviceName 서비스명
   * @returns 접근 제한 여부 (true: 제한됨, false: 허용됨, undefined: 설정 없음)
   */
  static isServiceRestricted(serviceName: string): boolean | undefined {
    const key = `service_access_${serviceName}`;
    const value = ServiceAccessCacheService.serviceAccessMap.get(key);

    if (value === undefined) {
      return undefined;
    }

    return value.toLowerCase() === 'true';
  }

  /**
   * 모든 캐시된 서비스 접근 제한 정보 조회
   * @returns 서비스 접근 제한 정보 Map의 복사본
   */
  static getAllServiceAccessData(): Map<string, string> {
    return new Map(ServiceAccessCacheService.serviceAccessMap);
  }

  /**
   * 캐시된 데이터 개수 조회
   * @returns 캐시된 데이터 개수
   */
  static getCacheSize(): number {
    return ServiceAccessCacheService.serviceAccessMap.size;
  }

  /**
   * 캐시 상태 정보 조회 (디버깅용)
   * @returns 캐시 상태 정보
   */
  static getCacheStatus(): {
    size: number;
    isRunning: boolean;
    keys: string[];
  } {
    return {
      size: ServiceAccessCacheService.serviceAccessMap.size,
      isRunning: ServiceAccessCacheService.isCronRunning,
      keys: Array.from(ServiceAccessCacheService.serviceAccessMap.keys()),
    };
  }
}
