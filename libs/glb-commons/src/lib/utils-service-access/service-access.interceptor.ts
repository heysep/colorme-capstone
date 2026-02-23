/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ServiceAccessCacheService } from './service-access-cache.service';
import { CommonError } from '../core-response/utils/common-error.util';
import { UtilsServiceAccessError } from './error/utils-service-access.error';
import { LogMxProvider } from '../utils-log-mx/public-providers/log-mx.provider';

/**
 * 서비스 접근 제한 인터셉터
 * 요청 시 서비스 접근 제한 여부를 확인하여 접근을 제어
 *
 * @author 최시훈
 * @since 2025-10-01
 */
@Injectable()
export class ServiceAccessInterceptor implements NestInterceptor {
  constructor(
    @Inject('SERVICE_ACCESS_NAME') private readonly serviceName: string,
    public readonly logMxProvider: LogMxProvider,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const type = context.getType<'http' | 'rpc' | 'ws'>();
    if (type !== 'http') {
      return next.handle();
    }

    // 서비스명이 추출되지 않으면 그대로 진행
    if (!this.serviceName) {
      return next.handle();
    }

    if (!this.logMxProvider.verbose) {
      return next.handle();
    }

    // 가장 뒤에 /hello 가 있는 경우는 그대로 진행
    if (request.url.endsWith('/hello')) {
      return next.handle();
    }

    // 서비스 접근 제한 여부 확인
    const isRestricted = ServiceAccessCacheService.isServiceRestricted(
      this.serviceName,
    );

    // 설정이 없으면 그대로 진행 (기본적으로 허용)
    if (isRestricted === undefined) {
      return next.handle();
    }

    // 접근이 제한되어 있으면 403 에러
    if (isRestricted === true) {
      throw CommonError.createByErrorCode(
        UtilsServiceAccessError.PERMISSION_DENIED_ERROR,
      );
    }

    return next.handle();
  }
}
