/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { IApiCommonResponse } from '../dto/api-common-response.dto';
import { RequestDataExtractor } from '../utils/common-response.util';
import { RATE_LIMIT_RESULT_CODE } from '../../utils-rate-limit/rate-limit.guard';

// 에러 응답 인터페이스 정의
interface ErrorResponse {
  message?: string | string[];
  error?: string;
  resultCode?: string;
}

// 커스텀 예외 인터페이스
interface CustomException {
  getApiResponseNoData(): {
    message: string;
    resultCode: string;
  };
}

// API 응답 빌더
export class ApiResponseBuilder {
  static build(
    request: Request,
    status: number,
    message: string,
    resultCode: string,
  ): IApiCommonResponse<null> {
    // 만약 API 응답 코드가 RATE_LIMIT_EXCEEDED 이면, 따로 처리
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      resultCode = RATE_LIMIT_RESULT_CODE;
      message =
        '서버가 일시적으로 해당 요청을 거부하였습니다. 잠시 후 다시 시도해주세요.';
    }

    return {
      data: null,
      status,
      resultCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestUser: RequestDataExtractor.getRequestUser(request),
    };
  }
}

// 에러 로거
class ErrorLogger {
  static async log(
    logProvider: LogMxProvider,
    request: Request,
    status: number,
    message: string,
    resultCode: string,
    error?: any,
  ): Promise<void> {
    const metadata = logProvider.makeMetadata({ request, status, resultCode });
    await logProvider.error(
      `Error: {${request.method}}${request.url} / ${status} / ${resultCode} / ${message}`,
      metadata,
    );

    if (error) {
      await logProvider.error(
        `Exception Detail: ${error?.message ?? JSON.stringify(error)}`,
        metadata,
      );
    }
  }
}

// --------------------------------------------
// --------------------------------------------
// --------------------------------------------

@Catch()
export class CommonExceptionFilter implements ExceptionFilter {
  constructor(private readonly logMxProvider: LogMxProvider) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    try {
      this.handleException(exception, request, response);
    } catch (error) {
      this.handleFallbackError(exception, error, request, response);
    }
  }

  private handleException(
    exception: unknown,
    request: Request,
    response: Response,
  ): void {
    const status = this.getExceptionStatus(exception);

    if (this.isCustomException(exception)) {
      this.handleCustomException(exception, request, response, status);
      return;
    }

    this.handleStandardException(exception, request, response, status);
  }

  private getExceptionStatus(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private isCustomException(exception: unknown): exception is CustomException {
    return typeof (exception as any)?.getApiResponseNoData === 'function';
  }

  private handleCustomException(
    exception: CustomException,
    request: Request,
    response: Response,
    status: number,
  ): void {
    const apiResponse = {
      ...exception.getApiResponseNoData(),
      path: request.url,
      timestamp: new Date().toISOString(),
      requestUser: RequestDataExtractor.getRequestUser(request),
    };

    ErrorLogger.log(
      this.logMxProvider,
      request,
      status,
      apiResponse.message,
      apiResponse.resultCode,
    );

    response.status(HttpStatus.OK).json(apiResponse);
  }

  private handleStandardException(
    exception: unknown,
    request: Request,
    response: Response,
    status: number,
  ): void {
    const apiResponse = ApiResponseBuilder.build(
      request,
      status,
      'Internal Server Error',
      'UNK_9999',
    );

    ErrorLogger.log(
      this.logMxProvider,
      request,
      status,
      apiResponse.message,
      apiResponse.resultCode,
      exception,
    );

    response.status(HttpStatus.OK).json(apiResponse);
  }

  private handleFallbackError(
    originalException: unknown,
    error: unknown,
    request: Request,
    response: Response,
  ): void {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const apiResponse = ApiResponseBuilder.build(
      request,
      status,
      'Internal Server Error',
      'UNK_9999',
    );

    ErrorLogger.log(
      this.logMxProvider,
      request,
      status,
      apiResponse.message,
      apiResponse.resultCode,
      { originalException, handlingError: error },
    );

    response.status(HttpStatus.OK).json(apiResponse);
  }
}

// --------------------------------------------
// --------------------------------------------
// --------------------------------------------

@Catch(HttpException)
export class CommonHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logMxProvider: LogMxProvider) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { message, resultCode } = this.extractErrorInfo(exception);
    const apiResponse = ApiResponseBuilder.build(
      request,
      status,
      message,
      resultCode,
    );

    ErrorLogger.log(
      this.logMxProvider,
      request,
      status,
      apiResponse.message,
      apiResponse.resultCode,
      exception,
    );

    response.status(HttpStatus.OK).json(apiResponse);
  }

  private extractErrorInfo(exception: HttpException): {
    message: string;
    resultCode: string;
  } {
    const errorResponse = exception.getResponse();
    let message: string;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (typeof errorResponse === 'object' && errorResponse !== null) {
      const typedError = errorResponse as ErrorResponse;
      message =
        typedError.message?.toString() ??
        typedError.error ??
        'Http Exception Occurred';
    } else {
      message = 'Http Exception Occurred';
    }

    return {
      message,
      resultCode: (errorResponse as ErrorResponse)?.resultCode ?? 'UNK_9999',
    };
  }
}
