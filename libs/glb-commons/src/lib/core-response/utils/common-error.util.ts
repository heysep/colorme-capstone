import { HttpStatus } from '@nestjs/common';
import { IApiCommonResponse } from '../dto/api-common-response.dto';
import { ICommonErrorCode } from './common-error-code.util';

export class CommonError {
  public readonly _status: HttpStatus;
  public readonly _resultCode: string;
  public readonly _message: string;

  constructor(status: HttpStatus, resultCode: string, message: string) {
    this._status = status;
    this._resultCode = resultCode;
    this._message = message;
  }

  getApiResponseNoData(): IApiCommonResponse<null | undefined> {
    return {
      data: null,
      status: this._status,
      resultCode: this._resultCode,
      message: this._message,
    };
  }

  getStatus(): HttpStatus {
    return this._status;
  }

  getResultCode(): string {
    return this._resultCode;
  }

  getMessage(): string {
    return this._message;
  }

  static create(
    status: HttpStatus,
    resultCode: string,
    message: string
  ): CommonError {
    return new CommonError(status, resultCode, message);
  }

  static createByErrorCode(
    errorCode: ICommonErrorCode,
    customMessage?: string
  ): CommonError {
    return new CommonError(
      errorCode.status || HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode.code,
      customMessage || errorCode.message
    );
  }
}
