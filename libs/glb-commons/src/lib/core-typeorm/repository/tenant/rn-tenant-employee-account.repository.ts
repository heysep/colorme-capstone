import { Repository } from 'typeorm';
import { RnTenantEmployeeAccountEntity } from '../../entity/tenant/rn-tenant-employee-account.tenant-mysql-entity';
import { RnBaseTenantRepository } from '../base/rn-base-tenant.base-repository';
import { Injectable } from '@nestjs/common';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';

/**
 * 테넌트 직원 계정 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Injectable()
export class RnTenantEmployeeAccountRepository extends RnBaseTenantRepository<RnTenantEmployeeAccountEntity> {
  constructor() {
    super();
  }

  /**
   * 테넌트 직원 계정 리포지토리
   *
   * @param ctx 테넌트 트랜잭션 컨텍스트
   * @returns 테넌트 직원 계정 리포지토리
   */
  override repository(
    ctx: ITenantTransactionContext
  ): Repository<RnTenantEmployeeAccountEntity> {
    return super.repository(ctx, RnTenantEmployeeAccountEntity);
  }
}

