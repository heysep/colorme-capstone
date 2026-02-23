import { Injectable } from '@nestjs/common';
import { RnTenantEmployeeAccountEntity } from '../../core-typeorm/entity/tenant/rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantEmployeeAccountRepository } from '../../core-typeorm/repository/tenant/rn-tenant-employee-account.repository';
import { ITenantTransactionContext } from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';

@Injectable()
export class GlbCoreAclTenantEmployeeAccountRepository {
  constructor(private readonly repository: RnTenantEmployeeAccountRepository) {}

  /**
   * 직원 계정 ID로 테넌트 직원 계정 조회
   */
  async findOneByUserId(options: {
    ctx: ITenantTransactionContext;
    userId: string;
  }): Promise<GlbOptionalValue<RnTenantEmployeeAccountEntity | null>> {
    const { userId, ctx } = options;

    const repository = this.repository.repository(ctx);

    const employeeAccount = await repository.findOne({
      withDeleted: false,
      where: { userId },
    });

    return GlbOptionalValue.of(employeeAccount);
  }

  /**
   * 직원 계정 고유 아이디로 테넌트 직원 계정 조회
   */
  async findOneByUniqueId(options: {
    ctx: ITenantTransactionContext;
    uniqueId: string;
  }): Promise<GlbOptionalValue<RnTenantEmployeeAccountEntity | null>> {
    const { uniqueId, ctx } = options;

    const repository = this.repository.repository(ctx);

    const employeeAccount = await repository.findOne({
      withDeleted: false,
      where: {
        id: uniqueId,
      },
      // relations: {
      //   role: true,
      // },
    });

    return GlbOptionalValue.of(employeeAccount);
  }

  /**
   * 직원 계정 마지막 로그인 시간 업데이트
   *
   * @param options 직원 계정 아이디
   */
  async updateLastLoginAt(
    ctx: ITenantTransactionContext,
    options: { id: string },
  ): Promise<void> {
    const repository = this.repository.repository(ctx);

    await repository.update(
      {
        id: options.id,
      },
      { lastLoginAt: new Date() },
    );
  }

  /**
   * 직원 계정 삭제
   *
   * @param options 직원 계정 아이디
   */
  async delete(
    ctx: ITenantTransactionContext,
    options: { id: string },
  ): Promise<void> {
    const repository = this.repository.repository(ctx);

    await repository.softDelete({ id: options.id });
  }
}
