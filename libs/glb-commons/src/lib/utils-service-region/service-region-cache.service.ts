import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RnDefaultTenantRegionRepository } from '../core-typeorm/repository/default/rn-default-tenant-region.repository';
import { RnDefaultTenantRegionEntity } from '../core-typeorm/entity/default/rn-default-tenant-region.mysql-entity';

/**
 * 서비스 리전 정보 캐시 서비스
 * 1분마다 DB에서 서비스 리전 정보를 조회하여 Map에 캐시
 *
 * @author 최시훈
 * @since 2025-10-01
 */
@Injectable()
export class ServiceRegionCacheService implements OnApplicationBootstrap {
  private static logger = new Logger(ServiceRegionCacheService.name);

  // 서비스 리전 정보를 저장하는 Map (key: string, value: RnDefaultTenantRegionEntity)
  private static serviceRegionMap = new Map<
    string,
    RnDefaultTenantRegionEntity
  >();

  // 크론 실행 중인지 확인하는 플래그
  private static isCronRunning = false;

  constructor(
    private readonly serviceRegionRepository: RnDefaultTenantRegionRepository,
  ) {}

  /**
   * 애플리케이션 시작 시 초기 데이터 로드
   */
  async onApplicationBootstrap() {
    ServiceRegionCacheService.logger.log(
      'ServiceRegionCacheService 초기화 시작',
    );
    await this.loadServiceRegionData();
    ServiceRegionCacheService.logger.log(
      'ServiceRegionCacheService 초기화 완료',
    );
  }

  /**
   * 1분마다 서비스 리전 정보 조회 및 캐시 업데이트
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleServiceRegionCacheCron() {
    // 이미 실행 중이면 스킵
    if (ServiceRegionCacheService.isCronRunning) {
      ServiceRegionCacheService.logger.warn(
        '서비스 리전 정보 캐시 크론이 이미 실행 중입니다.',
      );
      return;
    }

    ServiceRegionCacheService.isCronRunning = true;

    try {
      await this.loadServiceRegionData();
    } catch (error) {
      ServiceRegionCacheService.logger.error(
        '서비스 리전 정보 캐시 업데이트 실패:',
        error,
      );
    } finally {
      ServiceRegionCacheService.isCronRunning = false;
    }
  }

  /**
   * DB에서 서비스 리전 정보를 조회하여 Map에 저장
   */
  private async loadServiceRegionData(): Promise<void> {
    try {
      const serviceRegionList: RnDefaultTenantRegionEntity[] =
        await this.serviceRegionRepository.repository.find();

      // 기존 Map 클리어
      ServiceRegionCacheService.serviceRegionMap.clear();

      // 새로운 데이터로 Map 업데이트
      serviceRegionList.forEach((item) => {
        ServiceRegionCacheService.serviceRegionMap.set(item.id, item);
      });
    } catch (error) {
      ServiceRegionCacheService.logger.error(
        '서비스 리전 정보 조회 실패:',
        error,
      );
      throw error;
    }
  }

  /**
   * 캐시된 서비스 리전 정보 조회
   * @param id 서비스 리전 정보 ID
   * @returns 서비스 리전 정보 (없으면 undefined)
   */
  static getServiceRegionValue(
    id: string,
  ): RnDefaultTenantRegionEntity | undefined {
    return ServiceRegionCacheService.serviceRegionMap.get(id);
  }
}
