/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { getDataSourceByName } from 'typeorm-transactional';
import { CommonError } from '../../core-response/utils/common-error.util';
import {
  RN_MAIN_DATABASE_CONNECTION_NAME,
  TENANT_CODE_HEADER,
  TENANT_CODE_ROOT,
  TENANT_CONNECTION_KEY,
} from '../core-typeorm.module';
import { GlbCoreTypeOrmError } from '../error/tenant/tenant-error.error';
import { ITenantMiddleware } from '../middleware/tenant.middleware';
import { TenantConnectionService } from '../service/tenant/tenant-connection.service';

export const ensureTenantConnection = async (options: {
  request: Request;
  tenantConnectionService: TenantConnectionService;
}): Promise<ITenantMiddleware> => {
  const inputTenantCode = options?.request?.headers[
    TENANT_CODE_HEADER
  ] as string;

  // 이미 정상적으로 TENANT_CONNECTION_KEY 데이터에 ITenantMiddleware 타입이 있으면 그걸 반환
  const tenantConnection: ITenantMiddleware | undefined = (
    options?.request as any
  )[TENANT_CONNECTION_KEY];
  if (tenantConnection && tenantConnection?.errorMessage === 'No error') {
    return tenantConnection;
  }
  if (
    !inputTenantCode ||
    inputTenantCode.toLocaleLowerCase() === TENANT_CODE_ROOT
  ) {
    const connectionValue: ITenantMiddleware = {
      tenantCode: TENANT_CODE_ROOT,
      connection: getDataSourceByName(RN_MAIN_DATABASE_CONNECTION_NAME) || null,
      isRoot: true,
      isError: false,
      errorMessage: 'No error',
    };
    (options?.request as any)[TENANT_CONNECTION_KEY] = connectionValue;
    return connectionValue;
  }

  let connection: DataSource | null = null;
  try {
    connection = await options?.tenantConnectionService.getConnection({
      tenantCode: inputTenantCode,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    connection = null;
  }

  if (!connection) {
    throw CommonError.createByErrorCode(
      GlbCoreTypeOrmError.TENANT_CONNECTION_FAILED,
    );
  }

  // DataSource 생성 시 저장된 고유 테넌트 코드(순번 포함)를 사용
  const uniqueTenantCode =
    (connection as any).__uniqueTenantName || inputTenantCode;
  const connectionValue: ITenantMiddleware = {
    tenantCode: uniqueTenantCode,
    connection: connection,
    isRoot: false,
    isError: false,
    errorMessage: 'No error',
  };
  (options?.request as any)[TENANT_CONNECTION_KEY] = connectionValue;

  return connectionValue;
};
