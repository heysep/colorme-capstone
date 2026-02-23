import { SetMetadata } from '@nestjs/common';

export const OnlyRootUserDb = () => SetMetadata('onlyRootDb', true);
export const OnlyTenantUserDb = () => SetMetadata('onlyTenantDb', true);
