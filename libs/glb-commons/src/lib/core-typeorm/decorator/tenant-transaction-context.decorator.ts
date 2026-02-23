import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TENANT_CONNECTION_KEY } from '../core-typeorm.module';
import { ITenantMiddleware } from '../middleware/tenant.middleware';
import { ITenantTransactionContext } from '../utils/tenant-transaction-context.utils';
import { ModuleRef } from '@nestjs/core';
import { TenantConnectionService } from '../service/tenant/tenant-connection.service';
import { ensureTenantConnection } from '../utils/ensure-tenant-connection.utils';
import { CommonError } from '../../core-response/utils/common-error.util';
import { GlbCoreTypeOrmError } from '../error/tenant/tenant-error.error';

export const TenantTransactionContext = createParamDecorator(
  async (
    _data: unknown,
    ctx: ExecutionContext
  ): Promise<ITenantTransactionContext> => {
    const req = ctx.switchToHttp().getRequest();

    // ── 1. 미들웨어가 세팅했는지 먼저 확인 ─────────────────
    const cached: ITenantMiddleware | undefined = req[TENANT_CONNECTION_KEY];
    if (cached?.connection) {
      return {
        tenantCode: cached.tenantCode,
        dataSource: cached.connection,
      };
    }

    // ModuleRef & ContextId 는 전역 인터셉터가 실어둠
    const moduleRef = req.__moduleRef as ModuleRef;
    const contextId = req.__contextId;

    // 동일한 요청 컨텍스트로 TenantConnectionService 해결
    const tenantConnSvc = await moduleRef.resolve<TenantConnectionService>(
      TenantConnectionService,
      contextId,
      { strict: false } // 전역 프로바이더여도 OK
    );

    const tenantConnection = await ensureTenantConnection({
      request: req,
      tenantConnectionService: tenantConnSvc,
    });

    if (!tenantConnection.connection) {
      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.TENANT_CONNECTION_FAILED
      );
    }

    return {
      tenantCode: tenantConnection.tenantCode,
      dataSource: tenantConnection.connection,
    };
  }
);
