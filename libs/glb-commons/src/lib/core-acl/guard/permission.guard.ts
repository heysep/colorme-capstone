import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantPermission } from './jwt.guard';
import { Reflector } from '@nestjs/core';
import { CommonError } from '../../core-response/utils/common-error.util';
import { GlbCoreAclError } from '../error/acl-error.error';
import { RnTenantPermissionAccess } from '../decorator/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    return true;
    const requirePermission = this.reflector.getAllAndOverride(
      'requirePermission',
      [context.getHandler(), context.getClass()]
    );

    if (requirePermission === RnTenantPermissionAccess.None) {
      return true;
    }

    const permissions: TenantPermission[] = request?.permissions;

    let isAccess: boolean;
    let requirePermissionName: string;

    switch (request.method) {
      case 'GET':
        requirePermissionName = `view::${requirePermission}`;
        isAccess = permissions.some((p) => p.name === requirePermissionName);
        break;
      case 'POST':
        requirePermissionName = `create::${requirePermission}`;
        isAccess = permissions.some((p) => p.name === requirePermissionName);
        break;
      case 'PATCH':
        requirePermissionName = `update::${requirePermission}`;
        isAccess = permissions.some((p) => p.name === requirePermissionName);
        break;
      case 'PUT':
        requirePermissionName = `update::${requirePermission}`;
        isAccess = permissions.some((p) => p.name === requirePermissionName);
        break;
      case 'DELETE':
        requirePermissionName = `delete::${requirePermission}`;
        isAccess = permissions.some((p) => p.name === requirePermissionName);
        break;
      default:
        requirePermissionName = `unknown::${requirePermission}`;
        isAccess = false;
        break;
    }

    if (!isAccess) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.PERMISSION_DENIED_ERROR,
        `다음에 해당하는 권한이 없습니다. [ ${request.method} --> ${requirePermissionName} ]`
      );
    }

    return true;
  }
}
