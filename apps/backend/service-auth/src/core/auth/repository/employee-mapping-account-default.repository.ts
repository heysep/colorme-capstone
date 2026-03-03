import {
  ITenantTransactionContext,
  RnBaseTenantRepository,
  RnTenantCbizEmployeeMappingAccountEntity,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeMappingAccountDefaultRepository extends RnBaseTenantRepository<RnTenantCbizEmployeeMappingAccountEntity> {
  constructor() {
    super();
  }

  /**
   * 테넌트 기본 직원 매핑 계정 리포지토리
   *
   * @param ctx 트랜잭션 컨텍스트
   * @returns 테넌트 기본 직원 매핑 계정 리포지토리
   */
  override repository(
    ctx: ITenantTransactionContext,
  ): Repository<RnTenantCbizEmployeeMappingAccountEntity> {
    return super.repository(ctx, RnTenantCbizEmployeeMappingAccountEntity);
  }
}
