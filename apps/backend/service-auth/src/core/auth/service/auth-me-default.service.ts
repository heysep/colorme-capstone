import {
  IDefaultOutputDto,
  ITenantTransactionContext,
  RnDefaultRootUserEntity,
  RnDefaultRootUserRepository,
  RnTenantCbizEmployeeMappingAccountEntity,
} from '@drvalue-bmes-backend/glb-commons';
import { Injectable } from '@nestjs/common';
import { EmployeeMappingAccountDefaultRepository } from '../repository/employee-mapping-account-default.repository';

@Injectable()
export class AuthMeDefaultService {
  constructor(
    private readonly rnDefaultRootUserRepository: RnDefaultRootUserRepository,
    private readonly employeeMappingAccountDefaultRepository: EmployeeMappingAccountDefaultRepository,
  ) {}

  /**
   * 루트 사용자 상세 조회
   *
   * @param options 루트 사용자 상세 조회 인자
   * @returns 루트 사용자 상세 조회 결과
   */
  async findDefaultRootUserDetail(options: {
    id: string;
  }): Promise<IDefaultOutputDto<RnDefaultRootUserEntity>> {
    const id = options.id;

    const rootUser = await this.rnDefaultRootUserRepository.repository.findOne({
      where: {
        id: id,
      },
    });

    return IDefaultOutputDto.success(rootUser);
  }

  /**
   * 테넌트 사용자 상세 조회
   *
   * @param options 테넌트 사용자 상세 조회 인자
   * @returns 테넌트 사용자 상세 조회 결과
   */
  async findTenantEmployee(
    ctx: ITenantTransactionContext,
    options: {
      id: string;
    },
  ): Promise<IDefaultOutputDto<RnTenantCbizEmployeeMappingAccountEntity>> {
    const id = options.id;

    const tenantEmployee = await this.employeeMappingAccountDefaultRepository
      .repository(ctx)
      .findOne({
        where: { employeeAccount: { id: id } },
        relations: {
          employeeAccount: true,
          employee: {
            dept: true,
            team: true,
          },
        },
      });

    return IDefaultOutputDto.success(tenantEmployee);
  }
}
