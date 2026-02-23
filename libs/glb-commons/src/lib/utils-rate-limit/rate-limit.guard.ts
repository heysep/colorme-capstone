import {
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ThrottlerLimitDetail,
  ThrottlerRequest,
} from '@nestjs/throttler/dist/throttler.guard.interface';
import { ThrottlerModuleOptions } from './rate-limit.module';
import { LogMxProvider } from '../utils-log-mx/public-providers/log-mx.provider';

export const RATE_LIMIT_RESULT_CODE = 'RATE_LIMIT_EXCEEDED';

@Injectable()
export class ThrottlerBehindProxyGuard
  extends ThrottlerGuard
  implements OnModuleInit
{
  @Inject('ThrottlerModuleOptions.RootOptions')
  private readonly myOptions!: ThrottlerModuleOptions;
  @Inject()
  private readonly loggerContext!: LogMxProvider;

  override onModuleInit(): Promise<void> {
    return super.onModuleInit();
  }

  protected override async handleRequest(
    requestProps: ThrottlerRequest
  ): Promise<boolean> {
    // Rate Limiting 을 적용하지 않을 API 는 아래와 같이 처라
    // ====================================================================
    // Header 값 추출
    let ip = undefined;

    try {
      const request = requestProps?.context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const header: Record<string, any> = request?.headers;

      const headerUpperCaseKeys: string[] = Object.keys(header).map(
        (x: string) => {
          return x.toLocaleUpperCase();
        }
      );
      const headerUpperCaseValues: string[] = Object.values(header);
      const headerUpperCaseDict = Object.assign(
        {},
        ...headerUpperCaseKeys.map((k, i) => ({
          [k]: headerUpperCaseValues[i],
        }))
      );

      // IP 추출
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ip = request?.ip;

      // RATE_LIMIT_NO_CHECK_HEADER_NAME 헤더가 존재하면
      if (
        !!this.myOptions?.rateLimitNoCheckHeaderName &&
        !!this.myOptions?.rateLimitNoCheckMasterKey
      ) {
        const headerName: string = this.myOptions?.rateLimitNoCheckHeaderName;
        if (headerUpperCaseDict[headerName]) {
          // 값을 추출하여 string 으로 변환
          const headerValue = headerUpperCaseDict[headerName] as string;
          // RATE_LIMIT_NO_CHECK_MASTER_KEY 값과 같으면
          if (headerValue === this.myOptions?.rateLimitNoCheckMasterKey) {
            // true 반환
            return true;
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* empty */
    }
    // ====================================================================

    return super.handleRequest(requestProps);
  }

  protected override async getTracker(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: Record<string, any>
  ): Promise<string> {
    return req['ips']?.length ? req['ips'][0] : req['ip']; // individualize IP extraction to meet your own needs
  }

  /**
   * Throttling Exception 발생 시 처리
   */
  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    if (this.loggerContext.verbose) {
      try {
        const request = context.switchToHttp().getRequest();
        const status = HttpStatus.TOO_MANY_REQUESTS;
        const resultCode = RATE_LIMIT_RESULT_CODE;
        await this.loggerContext.verbose(
          `ThrottlerGuard Throttling Exception: ${JSON.stringify(
            throttlerLimitDetail
          )}`,
          await this.loggerContext.makeMetadata({ request, status, resultCode })
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        /* empty */
      }
    }

    return super.throwThrottlingException(context, throttlerLimitDetail);
  }
}
