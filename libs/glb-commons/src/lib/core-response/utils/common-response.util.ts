import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { TENANT_CODE_HEADER } from '../../core-typeorm/core-typeorm.module';
import { IApiCommonResponse } from '../dto/api-common-response.dto';
import { CommonError } from './common-error.util';

// IP 추출 유틸리티
export class IpExtractor {
  static extract(request: Request): string {
    try {
      const xForwardedFor = request.headers['x-forwarded-for'];
      if (xForwardedFor) {
        const ips = Array.isArray(xForwardedFor)
          ? xForwardedFor[0].split(',')
          : xForwardedFor.split(',');
        return ips[0].trim();
      }

      const xRealIp = request.headers['x-real-ip'];
      if (xRealIp) {
        return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
      }

      return request.ip || 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }
}

// RequestDataExtractor 클래스 추가
export class RequestDataExtractor {
  static getTenantCode(request: Request): string {
    return (request.headers?.[TENANT_CODE_HEADER] as string) ?? 'UNKNOWN';
  }

  static getUserAgent(request: Request): string {
    return request.headers?.['user-agent'] ?? 'UNKNOWN';
  }

  static getUserId(request: Request): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (request as any)?.user?.userId ?? 'UNKNOWN';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getRequestUser(request: Request): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!request?.user && !!(request?.user as any)?.id
      ? {
          id: (request?.user as any)?.id,
          userId: (request?.user as any)?.userId,
          userName: (request?.user as any)?.userName,
        }
      : null;
  }
}

export class CommonResponseUtil {
  /**
   * 성공 응답 생성
   */
  static successResponse<T>(data: T, message?: string): IApiCommonResponse<T> {
    return {
      data,
      status: HttpStatus.OK,
      resultCode: 'OK_0000',
      message: message || '작업이 완료되었습니다.',
    };
  }

  /**
   * Swagger 용 성공 응답 생성
   */
  static successResponseForSwagger<T>(
    data: T,
    message?: string,
  ): IApiCommonResponse<T> {
    return {
      data: data,
      status: HttpStatus.OK,
      resultCode: 'OK_0000',
      message: message || '작업이 완료되었습니다.',
      path: '/',
      timestamp: new Date().toISOString(),
      requestUser: null,
    };
  }

  /**
   * 실패 응답 생성
   */
  static errorResponse(
    resultCode: string,
    message?: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): IApiCommonResponse<null> {
    return {
      data: null,
      status,
      resultCode,
      message: message || '작업을 실패하였습니다.',
    };
  }

  /**
   * Swagger 용 실패 응답 생성
   */
  static errorResponseForSwagger(error: CommonError): IApiCommonResponse<null> {
    return {
      data: null,
      status: error._status || HttpStatus.INTERNAL_SERVER_ERROR,
      resultCode: error._resultCode || 'UNK_9999',
      message: error._message || '알 수 없는 오류',
      path: '/',
      timestamp: new Date().toISOString(),
      requestUser: null,
    };
  }
}
