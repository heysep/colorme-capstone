/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonError,
  ITenantMiddleware,
  removeTenantCodeRRNumber,
  TENANT_CODE_HEADER,
  TENANT_CODE_ROOT,
  TENANT_CONNECTION_KEY,
} from '@drvalue-bmes-backend/glb-commons';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CbizTenantSlimiterService } from '../cbiz-tenant-slimiter.service';
import { CbizTenantSlimiterError } from '../error/cbiz-tenant-slimiter.error';

@Injectable()
export class TenantWriteRestrictionGuard implements CanActivate {
  /**
   * POST/PATCH 요청에 대해 테넌트 저장소 용량 제한을 확인합니다.
   * 용량 제한을 초과한 경우 요청을 거절합니다.
   *
   * @param context 실행 컨텍스트
   * @returns 요청 허용 여부
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method?.toUpperCase();

    // POST, PATCH 요청만 체크
    if (method !== 'POST' && method !== 'PATCH') {
      return true;
    }

    // 테넌트 코드 추출
    let tenantCode: string | undefined;

    // 1. TENANT_CONNECTION_KEY에서 추출 시도
    const tenantConnection = (request as any)[TENANT_CONNECTION_KEY] as
      | ITenantMiddleware
      | undefined;

    if (tenantConnection?.tenantCode) {
      tenantCode = tenantConnection.tenantCode;
    } else {
      // 2. TENANT_CODE_HEADER에서 직접 추출 (fallback)
      tenantCode = request.headers[TENANT_CODE_HEADER] as string | undefined;
    }

    // 테넌트 코드가 없거나 root인 경우 통과
    if (
      !tenantCode ||
      tenantCode.toLowerCase() === TENANT_CODE_ROOT.toLowerCase()
    ) {
      return true;
    }

    // 용량 제한 확인
    const restrictionResult =
      CbizTenantSlimiterService.isTenantSlimiterRestricted(
        removeTenantCodeRRNumber(tenantCode)
      );

    // 설정이 없거나 제한되지 않은 경우 통과
    if (!restrictionResult || !restrictionResult.isRestricted) {
      return true;
    }

    // 용량 제한 초과 시 요청 거절
    throw CommonError.createByErrorCode(
      CbizTenantSlimiterError.TENANT_STORAGE_LIMIT_EXCEEDED
    );
  }
}
