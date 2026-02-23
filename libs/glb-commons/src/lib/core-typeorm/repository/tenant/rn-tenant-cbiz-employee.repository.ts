import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RnTenantCbizEmployeeEntity } from '../../entity/tenant/core-biz-entity/entity/rn-tenant-cbiz-employee.tenant-mysql-entity';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';
import { RnBaseTenantRepository } from '../base/rn-base-tenant.base-repository';

/**
 * 테넌트 직원 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Injectable()
export class RnTenantCbizEmployeeRepository extends RnBaseTenantRepository<RnTenantCbizEmployeeEntity> {
  constructor() {
    super();
  }

  /**
   * 테넌트 직원 리포지토리
   *
   * @param ctx 테넌트 트랜잭션 컨텍스트
   * @returns 테넌트 직원 리포지토리
   */
  override repository(
    ctx: ITenantTransactionContext,
  ): Repository<RnTenantCbizEmployeeEntity> {
    return super.repository(ctx, RnTenantCbizEmployeeEntity);
  }
}
