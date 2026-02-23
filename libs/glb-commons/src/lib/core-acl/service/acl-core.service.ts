import { Injectable, Scope } from '@nestjs/common';
import { ServiceException } from '../../core-response/decorator/service-exception.decorator';
import { CommonError } from '../../core-response/utils/common-error.util';
import { RnTenantPermissionEntity } from '../../core-typeorm/entity/tenant/rn-tenant-permission.tenant-mysql-entity';
import { ITenantTransactionContext } from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';
import { GlbCoreAclError } from '../error/acl-error.error';
import { GlbCoreAclRepository } from '../repository/acl-core.repository';

@Injectable({
  scope: Scope.REQUEST,
})
export class GlbCoreAclService {
  constructor(
    private readonly aclRepository: GlbCoreAclRepository,
    public readonly logMxProvider: LogMxProvider,
  ) {}

  /**
   * 역할 아이디로 권한 조회
   *
   * @param options 역할 아이디
   * @returns 권한 조회 결과
   */
  @ServiceException({
    errorCode: GlbCoreAclError.GET_PERMISSION_FAILED,
  })
  async getPermissionsByRoleId(
    ctx: ITenantTransactionContext,
    options: {
      role: string;
    },
  ): Promise<
    IDefaultOutputDto<{
      permissions: RnTenantPermissionEntity[];
    }>
  > {
    const permissions = await this.aclRepository.getPermissionManyByRoleId({
      ctx,
      roleId: options.role,
    });

    if (permissions.isEmpty()) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.NO_PERMISSION_FOR_ROLE,
      );
    }

    // 권한 조회 결과 추출, 비어있으면 예외 발생
    const permissionsValue = GlbOptionalValue.getValueAndEmptyThrowError(
      permissions,
      GlbCoreAclError.NO_PERMISSION_FOR_ROLE,
    );

    return IDefaultOutputDto.success({
      permissions: permissionsValue,
    });
  }
}
