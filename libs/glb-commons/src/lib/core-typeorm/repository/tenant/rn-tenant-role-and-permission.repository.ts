import { Repository } from 'typeorm';
import { RnBaseTenantRepository } from '../base/rn-base-tenant.base-repository';
import { Injectable } from '@nestjs/common';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';
import { RnTenantRoleAndPermissionEntity } from '../../entity/tenant/rn-tenant-role-and-permission.tenant-mysql-entity';

/**
 * 테넌트 역할 및 권한 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-05
 */
@Injectable()
export class RnTenantRoleAndPermissionRepository extends RnBaseTenantRepository<RnTenantRoleAndPermissionEntity> {
  constructor() {
    super();
  }

  /**
   * 테넌트 권한 리포지토리
   *
   * @param dataSource 데이터 소스
   * @returns 테넌트 권한 리포지토리
   */
  override repository(
    ctx: ITenantTransactionContext
  ): Repository<RnTenantRoleAndPermissionEntity> {
    return super.repository(ctx, RnTenantRoleAndPermissionEntity);
  }
}
