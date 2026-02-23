/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import {
  TENANT_CODE_HEADER,
  TENANT_CONNECTION_KEY,
} from '../core-typeorm.module';

export interface ITenantMiddleware {
  // 컨트롤러 등에서 사용할 때, 순번이 붙은 고유 테넌트 코드
  tenantCode: string;
  connection: DataSource | null;
  isRoot: boolean;
  isError: boolean;
  errorMessage: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      // 입력 헤더의 테넌트 코드 (순번 없음)
      const inputTenantCode = req.headers[TENANT_CODE_HEADER] as string;
      const connectionValue: ITenantMiddleware = {
        tenantCode: inputTenantCode,
        connection: null,
        isRoot: false,
        isError: false,
        errorMessage: 'Not initialized!!',
      };
      (req as any)[TENANT_CONNECTION_KEY] = connectionValue;
      return next();
    } catch (error) {
      return next(error);
    }
  }
}
