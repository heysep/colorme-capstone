import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Request } from 'express';
import {
  IpExtractor,
  RequestDataExtractor,
} from '../../core-response/utils/common-response.util';
import { LogMxModuleInitInterface } from '../interface/log-mx-module-init.interface';
import { LogMxLoggerProvider } from '../private-providers/log-mx-logger.provider';
import { LogMxLevel } from '../utils/log-mx-level.util';
import { LogMxMetadata } from '../utils/log-mx-metadata.util';

@Injectable()
export class LogMxProvider implements LoggerService {
  private readonly defaultLogger: Logger;

  constructor(
    @Inject('LogMxModule.RootOptions')
    readonly options: LogMxModuleInitInterface,
    // ------------------------
    private readonly logMxLoggerProvider: LogMxLoggerProvider,
  ) {
    this.defaultLogger = new Logger(options.contextName);
  }

  /**
   * 로그 메타데이터 생성
   */
  makeMetadata(options: {
    request: Request;
    status: HttpStatus;
    resultCode: string;
  }): LogMxMetadata {
    const { request, status, resultCode } = options;

    try {
      const ip = IpExtractor.extract(request);
      const userAgent = RequestDataExtractor.getUserAgent(request);
      const userId = RequestDataExtractor.getUserId(request);

      return {
        method: request.method,
        url: request.url,
        statusCode: status,
        ip,
        userAgent,
        resultCode,
        userId,
        tenantCode: RequestDataExtractor.getTenantCode(request),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return {
        method: request?.method ?? 'UNKNOWN',
        url: request?.url ?? 'UNKNOWN',
        statusCode: status,
        ip: 'UNKNOWN',
        userAgent: 'UNKNOWN',
        resultCode: resultCode,
        userId: 'UNKNOWN',
      };
    }
  }

  log(message: string, metadata: LogMxMetadata): void {
    this.defaultLogger.log(
      `${message} - Metadata: ${JSON.stringify(metadata)}`,
    );

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.INFO,
      message,
      ...metadata,
    });
  }
  logNoMetadata(message: string): void {
    this.defaultLogger.log(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.INFO,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      tenantCode: 'UNKNOWN',
    });
  }

  error(message: string, metadata: LogMxMetadata): void {
    this.defaultLogger.error(
      `${message} - Metadata: ${JSON.stringify(metadata)}`,
    );

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.ERROR,
      message,
      ...metadata,
    });
  }
  errorNoMetadata(message: string): void {
    this.defaultLogger.error(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.ERROR,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
    });
  }

  warn(message: string, metadata: LogMxMetadata): void {
    this.defaultLogger.warn(
      `${message} - Metadata: ${JSON.stringify(metadata)}`,
    );

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.WARN,
      message,
      ...metadata,
    });
  }
  warnNoMetadata(message: string): void {
    this.defaultLogger.warn(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.WARN,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      tenantCode: 'UNKNOWN',
    });
  }

  debug?(message: string, metadata: LogMxMetadata): void {
    if (!!this?.defaultLogger && !!this?.defaultLogger?.debug) {
      this.defaultLogger.debug(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    } else {
      this.defaultLogger.log(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    }

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.DEBUG,
      message,
      ...metadata,
    });
  }
  debugNoMetadata(message: string): void {
    this.defaultLogger.debug(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.DEBUG,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      tenantCode: 'UNKNOWN',
    });
  }

  verbose?(message: string, metadata: LogMxMetadata): void {
    if (!!this?.defaultLogger && !!this?.defaultLogger?.verbose) {
      this.defaultLogger.verbose(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    } else {
      this.defaultLogger.log(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    }

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.VERBOSE,
      message,
      ...metadata,
    });
  }
  verboseNoMetadata(message: string): void {
    this.defaultLogger.verbose(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.VERBOSE,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      tenantCode: 'UNKNOWN',
    });
  }

  fatal?(message: string, metadata: LogMxMetadata): void {
    if (!!this?.defaultLogger && !!this?.defaultLogger?.fatal) {
      this.defaultLogger.error(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    } else {
      this.defaultLogger.error(
        `${message} - Metadata: ${JSON.stringify(metadata)}`,
      );
    }

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.FATAL,
      message,
      ...metadata,
    });
  }
  fatalNoMetadata(message: string): void {
    this.defaultLogger.error(message);

    this.logMxLoggerProvider.saveLog({
      level: LogMxLevel.FATAL,
      message,
      ip: 'UNKNOWN',
      userAgent: 'UNKNOWN',
      userId: 'UNKNOWN',
      resultCode: 'UNKNOWN',
      statusCode: HttpStatus.OK,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      tenantCode: 'UNKNOWN',
    });
  }
}
