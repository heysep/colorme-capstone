/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogMxProvider } from '../public-providers/log-mx.provider';
import { TENANT_CODE_HEADER } from '../../core-typeorm/core-typeorm.module';

@Injectable()
export class LogMxHttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LogMxProvider) {}

  /**
   * 클라이언트 IP 추출
   */
  private getClientIp(request: any): string {
    try {
      // X-Forwarded-For 헤더 확인 (프록시 체인에서 클라이언트 IP 목록)
      const xForwardedFor = request.headers['x-forwarded-for'];
      if (xForwardedFor) {
        // 첫 번째 IP가 원본 클라이언트 IP
        const ips = xForwardedFor.split(',');
        return ips[0].trim();
      }

      // X-Real-IP 헤더 확인 (Nginx에서 주로 사용)
      const xRealIp = request.headers['x-real-ip'];
      if (xRealIp) {
        return xRealIp;
      }

      // 직접 연결된 경우 원본 IP
      return request.ip || 'UNKNOWN';
    } catch (_: any) {
      return 'UNKNOWN';
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType<'http' | 'rpc' | 'ws'>();
    if (type !== 'http') {
      return next.handle();
    }

    // HTTP 요청 정보
    const request = context.switchToHttp().getRequest();
    const tenantCode = request.headers[TENANT_CODE_HEADER] || 'root';
    const { method, url } = request;
    const ip = this.getClientIp(request);
    const now = Date.now();
    return next.handle().pipe(
      tap((data: any) => {
        // 응답 완료 시점에 로그를 큐에 저장 (비동기, 논블로킹)
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const userAgent = request?.headers?.['user-agent'] ?? 'UNKNOWN';

        if (!!this.loggingService && this.loggingService.verbose) {
          try {
            this.loggingService.verbose(
              `##AccessLog## - Request took ${Date.now() - now}ms`,
              {
                method,
                url,
                statusCode,
                ip: ip,
                userAgent: userAgent,
                resultCode: data?.resultCode ?? 'UNKNOWN',
                userId: data?.requestUser?.userId ?? 'UNKNOWN',
                tenantCode: tenantCode ?? 'UNKNOWN',
              },
            );
          } catch (error) {
            console.error('로그 저장 중 오류 발생:', error);
          }
        }
      }),
    );
  }
}
