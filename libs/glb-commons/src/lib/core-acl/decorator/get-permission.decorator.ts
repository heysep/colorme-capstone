import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantPermission } from '../guard/jwt.guard';

export const GetPermission = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantPermission[] => {
    const request = ctx.switchToHttp().getRequest();
    return request?.permissions as TenantPermission[];
  }
);
