import {
  LogMxProvider,
  RnDefaultTenantRepository,
} from '@capstone-project/glb-commons';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CbizTenantConfigKey } from '../cbiz-tenant-config/cbiz-tenant-config.utils';

export interface TenantSlimiterData {
  currentDBUsage: number;
  currentFileUsage: number;
  currentDBUsageLimit: number;
  currentFileUsageLimit: number;
}

@Injectable()
export class CbizTenantSlimiterService {
  private static logger = new Logger(CbizTenantSlimiterService.name);
  constructor(
    private readonly tenantRepository: RnDefaultTenantRepository,
    public readonly logMxProvider: LogMxProvider
  ) {}

  // 서비스 접근 제한 정보를 저장하는 Map
  // key: tenantCode, value: { currentDBUsage: number, currentFileUsage: number, currentDBUsageLimit: number, currentFileUsageLimit: number }
  private static tenantSlimiterMap = new Map<string, TenantSlimiterData>();

  // 크론 실행 중인지 확인하는 플래그
  private static isCronRunning = false;

  /**
   * 애플리케이션 시작 시 초기 데이터 로드
   */
  async onApplicationBootstrap() {
    CbizTenantSlimiterService.logger.log(
      'CbizTenantSlimiterService 초기화 시작'
    );
    await this.loadTenantSlimiterData();
    CbizTenantSlimiterService.logger.log(
      'CbizTenantSlimiterService 초기화 완료'
    );
  }

  /**
   * 1분마다 서비스 접근 제한 정보 조회 및 캐시 업데이트
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTenantSlimiterCacheCron() {
    // 이미 실행 중이면 스킵
    if (CbizTenantSlimiterService.isCronRunning) {
      CbizTenantSlimiterService.logger.warn(
        '서비스 접근 제한 정보 캐시 크론이 이미 실행 중입니다.'
      );
      return;
    }

    CbizTenantSlimiterService.isCronRunning = true;

    try {
      await this.loadTenantSlimiterData();
    } catch (error) {
      CbizTenantSlimiterService.logger.error(
        '서비스 접근 제한 정보 캐시 업데이트 실패:',
        error
      );
    } finally {
      CbizTenantSlimiterService.isCronRunning = false;
    }
  }

  /**
   * DB에서 서비스 접근 제한 정보를 조회하여 Map에 저장
   */
  private async loadTenantSlimiterData(): Promise<void> {
    try {
      const allTenantCodes = await this.tenantRepository.repository.find({
        select: {
          code: true,
        },
        relations: {
          configs: true,
        },
      });

      // 기존 Map 클리어
      CbizTenantSlimiterService.tenantSlimiterMap.clear();

      const checkIsNumberVaild = (value: string): boolean => {
        return !Number.isNaN(Number(value)) && Number(value) >= 0;
      };

      // 같은 테넌트 코드를 가진 데이터를 하나로 합치기
      // 데이터들은 각각 GXD_TENANT_DB_STORAGE_USAGE_BYTES 이러한 키를 가지고 있다.
      // 이를 기반으로 테넌트 코드를 찾아서 데이터를 합친다.
      for (const tenant of allTenantCodes) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const tenantCode = tenant.code!;
        const tenantConfigs = tenant.configs;
        const tenantSlimiterData: TenantSlimiterData = {
          currentDBUsage: 0,
          currentFileUsage: 0,
          currentDBUsageLimit: 0,
          currentFileUsageLimit: 0,
        };

        for (const config of tenantConfigs) {
          switch (config.key) {
            case CbizTenantConfigKey.GXD_TENANT_DB_STORAGE_USAGE_BYTES:
              if (checkIsNumberVaild(config.value)) {
                tenantSlimiterData.currentDBUsage = Number(config.value);
              }
              break;
            case CbizTenantConfigKey.GXD_TENANT_FILE_STORAGE_USAGE_BYTES:
              if (checkIsNumberVaild(config.value)) {
                tenantSlimiterData.currentFileUsage = Number(config.value);
              }
              break;
            case CbizTenantConfigKey.GXD_TENANT_DB_STORAGE_USAGE_BYTES_LIMIT:
              if (checkIsNumberVaild(config.value)) {
                tenantSlimiterData.currentDBUsageLimit = Number(config.value);
              }
              break;
            case CbizTenantConfigKey.GXD_TENANT_FILE_STORAGE_USAGE_BYTES_LIMIT:
              if (checkIsNumberVaild(config.value)) {
                tenantSlimiterData.currentFileUsageLimit = Number(config.value);
              }
              break;
          }
        }

        CbizTenantSlimiterService.tenantSlimiterMap.set(
          tenantCode,
          tenantSlimiterData
        );
      }
    } catch (error) {
      CbizTenantSlimiterService.logger.error(
        '테넌트 접근 제한 정보 조회 실패:',
        error
      );
      throw error;
    }
  }

  /**
   * 캐시된 테넌트 접근 제한 정보 조회
   * @param key 테넌트 접근 제한 정보 키
   * @returns 테넌트 접근 제한 정보 값 (없으면 undefined)
   */
  static getTenantSlimiterValue(key: string): TenantSlimiterData | undefined {
    return CbizTenantSlimiterService.tenantSlimiterMap.get(key);
  }

  /**
   * 특정 서비스의 접근 제한 여부 확인
   * @param tenantCode 테넌트 코드
   * @returns 접근 제한 여부 (true: 제한됨, false: 허용됨, undefined: 설정 없음)
   */
  static isTenantSlimiterRestricted(tenantCode: string):
    | ({
        isRestricted: boolean;
      } & TenantSlimiterData)
    | undefined {
    const value = CbizTenantSlimiterService.tenantSlimiterMap.get(tenantCode);
    if (value === undefined) {
      return undefined;
    }

    return {
      isRestricted:
        value.currentDBUsage >= value.currentDBUsageLimit ||
        value.currentFileUsage >= value.currentFileUsageLimit,
      ...value,
    };
  }

  /**
   * 캐시된 데이터 개수 조회
   * @returns 캐시된 데이터 개수
   */
  static getCacheSize(): number {
    return CbizTenantSlimiterService.tenantSlimiterMap.size;
  }
}
