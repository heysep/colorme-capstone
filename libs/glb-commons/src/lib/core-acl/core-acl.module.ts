import { DynamicModule, Module } from '@nestjs/common';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';
import { JwtModule } from '@nestjs/jwt';
import { GlbCoreAclRootUserRepository } from './repository/acl-root-user.repository';
import { GlbCoreAclRootUserService } from './service/acl-root-user.service';
import { GlbCoreAclTenantEmployeeAccountRepository } from './repository/acl-tenant-employee-account.repository';
import { GlbCoreAclTenantEmployeeAccountService } from './service/acl-tenant-employee-account.service';
import { GlbCoreAclRepository } from './repository/acl-core.repository';
import { GlbCoreAclService } from './service/acl-core.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GlbCoreAclRootAdminUserRepository } from './repository/acl-root-admin-user.repository';

/**
 * 권한 관리 모듈
 *
 * @author 최시훈
 * @since 2025-01-01
 */
@Module({})
export class GlbCoreAclModule {
  static forRoot(options?: GlbCoreAclModuleOptions): DynamicModule {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtSecret = process?.env?.['JWT_SECRET'] as any;
    if (!jwtSecret) {
      throw new Error('GlbCoreAclModule - JWT_SECRET is not set');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtExpiresIn = process?.env?.['JWT_EXPIRES_IN'] as any;
    if (!jwtExpiresIn) {
      throw new Error('GlbCoreAclModule - JWT_EXPIRES_IN is not set');
    }

    return {
      global: options?.isGlobal ?? false,
      module: GlbCoreAclModule,
      imports: [
        GlbLogMxModule.forRoot({
          contextName: 'GlbCoreAclModule',
          useInterceptor: false,
        }),
        /**
         * JWT 설정 모듈
         */
        JwtModule.register({
          global: true,
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn,
          },
        }),
      ],
      providers: [
        JwtStrategy,
        // -------------
        GlbCoreAclRootUserRepository,
        GlbCoreAclRootAdminUserRepository,
        GlbCoreAclTenantEmployeeAccountRepository,
        GlbCoreAclRepository,
        // -------------
        GlbCoreAclRootUserService,
        GlbCoreAclTenantEmployeeAccountService,
        GlbCoreAclService,
      ],
      exports: [
        GlbCoreAclRootUserService,
        GlbCoreAclTenantEmployeeAccountService,
        GlbCoreAclService,
      ],
    };
  }
}

export interface GlbCoreAclModuleOptions {
  isGlobal?: boolean;
}
