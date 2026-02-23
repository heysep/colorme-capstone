import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommonResponseModuleOptions } from '../common-response.module';
import { TenantConnectionService } from '../../core-typeorm/service/tenant/tenant-connection.service';
import { TENANT_CONNECTION_TEST_TENANT_CODE } from '../../core-typeorm/utils/typeorm.utils';

@Injectable()
export class CommonHelloServerService {
  // 서버 시작 시간
  public static readonly appStartTime = Date.now();
  // 마지막 Heartbeat 시간
  protected static HeartbeatTime = Date.now();

  constructor(
    @Inject('CommonResponseModule.RootOptions')
    private readonly options: CommonResponseModuleOptions,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  private _calculateAppUptime(): number {
    CommonHelloServerService.HeartbeatTime = Date.now();
    return Date.now() - CommonHelloServerService.appStartTime;
  }

  private _getServerName(): string {
    return this.options.serverName;
  }

  private _getLastHeartbeatTime(): number {
    return CommonHelloServerService.HeartbeatTime;
  }

  /**
   * 서버 상태 확인용
   */
  async helloServer(): Promise<{
    /**
     * 서버 이름
     */
    serverName: string;

    /**
     * 서버 시작 시간
     */
    appStartTime: number;

    /**
     * 마지막 Heartbeat 시간
     */
    lastHeartbeatTime: number;

    /**
     * 서버 메시지
     */
    message: string;
  }> {
    try {
      const connection = await this.tenantConnectionService.getConnection({
        tenantCode: TENANT_CONNECTION_TEST_TENANT_CODE,
      });

      if (!connection) {
        throw new HttpException(
          '테넌트 연결 상태 확인 실패!',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // 정상인지 확인
      await connection.query('SELECT 1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new HttpException(
        `테넌트 연결 상태 확인 실패! ( ${error?.message ?? '알 수 없는 오류'} )`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      serverName: this._getServerName(),
      appStartTime: this._calculateAppUptime(),
      lastHeartbeatTime: this._getLastHeartbeatTime(),
      message: 'Hello, Server!',
    };
  }
}
