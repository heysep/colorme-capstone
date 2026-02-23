import { Injectable } from '@nestjs/common';
import { RnTenantPermissionEntity } from '../../core-typeorm/entity/tenant/rn-tenant-permission.tenant-mysql-entity';
import { RnTenantRoleAndPermissionEntity } from '../../core-typeorm/entity/tenant/rn-tenant-role-and-permission.tenant-mysql-entity';
import { RnTenantRoleAndPermissionRepository } from '../../core-typeorm/repository/tenant/rn-tenant-role-and-permission.repository';
import { ITenantTransactionContext } from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';

@Injectable()
export class GlbCoreAclRepository {
  constructor(
    private readonly roleAndPermissionRepository: RnTenantRoleAndPermissionRepository,
  ) {}

  /**
   * 역할 ID로 권한 목록을 조회합니다.
   *
   * @param options 역할 ID
   * @returns 권한 목록
   */
  async getPermissionManyByRoleId(options: {
    ctx: ITenantTransactionContext;
    roleId: string;
  }): Promise<GlbOptionalValue<RnTenantPermissionEntity[]>> {
    const repository = this.roleAndPermissionRepository.repository(options.ctx);

    const roleAndPermissions = await repository.find({
      withDeleted: false,
      where: {
        role: {
          id: options.roleId,
        },
      },
      relations: {
        permission: true,
      },
    });

    const permissions: RnTenantPermissionEntity[] = roleAndPermissions.map(
      (roleAndPermissions: RnTenantRoleAndPermissionEntity) =>
        roleAndPermissions.permission,
    );

    return GlbOptionalValue.of(permissions);
  }
}
