import { Repository } from 'typeorm';
import { RnBaseTenantRepository } from '../base/rn-base-tenant.base-repository';
import { Injectable } from '@nestjs/common';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';
import { RnTenantRoleEntity } from '../../entity/tenant/rn-tenant-role.tenant-mysql-entity';

/**
 * 테넌트 역할 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-05
 */
@Injectable()
export class RnTenantRoleRepository extends RnBaseTenantRepository<RnTenantRoleEntity> {
  constructor() {
    super();
  }

  /**
   * 테넌트 역할 리포지토리
   *
   * @param dataSource 데이터 소스
   * @returns 테넌트 역할 리포지토리
   */
  override repository(
    ctx: ITenantTransactionContext
  ): Repository<RnTenantRoleEntity> {
    return super.repository(ctx, RnTenantRoleEntity);
  }
}
