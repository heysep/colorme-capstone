/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ContextIdFactory, ModuleRef, Reflector } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CommonError } from '../../core-response/utils/common-error.util';
import { RnDefaultUserStatus } from '../../core-typeorm/entity/default/rn-default-user.mysql-entity';
import { RnTenantEmployeeAccountStatus } from '../../core-typeorm/entity/tenant/rn-tenant-employee-account.tenant-mysql-entity';
import { GlbCoreTypeOrmError } from '../../core-typeorm/error/tenant/tenant-error.error';
import { TenantConnectionService } from '../../core-typeorm/service/tenant/tenant-connection.service';
import { ensureTenantConnection } from '../../core-typeorm/utils/ensure-tenant-connection.utils';
import { removeTenantCodeRRNumber } from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { GlbCoreAclError } from '../error/acl-error.error';
import { GlbCoreAclService } from '../service/acl-core.service';
import { GlbCoreAclRootUserService } from '../service/acl-root-user.service';
import { GlbCoreAclTenantEmployeeAccountService } from '../service/acl-tenant-employee-account.service';
import { JwtPayload } from '../strategy/jwt.strategy';
import { UserStatus } from './../decorator/user-status.decorator';

export interface TenantPermission {
  id: string;
  name: string;
  description: string;
}

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    // ------------
    private readonly glbCoreAclRootUserService: GlbCoreAclRootUserService,
    private readonly glbCoreAclTenantEmployeeAccountService: GlbCoreAclTenantEmployeeAccountService,
    private readonly glbCoreAclService: GlbCoreAclService,
  ) {
    super();
  }

  /**
   * JWT 토큰 검증
   *
   * @param context 실행 컨텍스트
   * @returns 검증 결과
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 공개 엔드포인트인지 판단한다.
      const isPublic = this.reflector.getAllAndOverride('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      // 외주처 판단 제외 엔드포인트인지 판단한다.
      const allowBizPartner = this.reflector.getAllAndOverride(
        'allowBizPartner',
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;

      try {
        await super.canActivate(context);
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw CommonError.createByErrorCode(GlbCoreAclError.INVALID_TOKEN);
        }
        if (e instanceof SyntaxError) {
          throw CommonError.createByErrorCode(GlbCoreAclError.INVALID_TOKEN);
        }
        if (e instanceof TokenExpiredError) {
          throw CommonError.createByErrorCode(GlbCoreAclError.TOKEN_EXPIRED);
        }
        if (e instanceof JsonWebTokenError) {
          throw CommonError.createByErrorCode(GlbCoreAclError.INVALID_TOKEN);
        } else {
          throw CommonError.createByErrorCode(GlbCoreAclError.INVALID_TOKEN);
        }
      }

      // 실행 컨텍스트의 요청객체에 접근한다.
      const request = context.switchToHttp().getRequest();
      const contextId = ContextIdFactory.getByRequest(request);
      // 동일한 요청 컨텍스트로 TenantConnectionService 해결
      const tenantConnSvc =
        await this.moduleRef.resolve<TenantConnectionService>(
          TenantConnectionService,
          contextId,
          { strict: false }, // 전역 프로바이더여도 OK
        );

      const tenantConnection = await ensureTenantConnection({
        request: request,
        tenantConnectionService: tenantConnSvc,
      });

      if (!tenantConnection.connection) {
        throw CommonError.createByErrorCode(
          GlbCoreTypeOrmError.TENANT_CONNECTION_FAILED,
        );
      }

      // 사용자 인증 정보를 추출한다.
      const userJwtResponse: JwtPayload = request?.['user'] as JwtPayload;
      // 사용자 인증 정보가 없으면 예외 발생
      if (!userJwtResponse) {
        throw CommonError.createByErrorCode(
          GlbCoreAclError.FIND_USER_JWT_RESPONSE_FAILED,
        );
      }

      // -----------------------------------------
      const onlyRootDb = this.reflector.getAllAndOverride('onlyRootDb', [
        context.getHandler(),
        context.getClass(),
      ]);
      const onlyTenantDb = this.reflector.getAllAndOverride('onlyTenantDb', [
        context.getHandler(),
        context.getClass(),
      ]);
      // 루트 테넌트가 아니면 예외 발생
      if (onlyRootDb && tenantConnection.isRoot == false) {
        throw CommonError.createByErrorCode(
          GlbCoreAclError.ONLY_ROOT_REQUEST_ERROR,
        );
      }
      // 테넌트 테넌트가 아니면 예외 발생
      if (onlyTenantDb && tenantConnection.isRoot == true) {
        throw CommonError.createByErrorCode(
          GlbCoreAclError.ONLY_TENANT_REQUEST_ERROR,
        );
      }
      // -----------------------------------------

      // 사용자 정보를 조회한다.
      const isTenantUser =
        tenantConnection &&
        tenantConnection.connection &&
        tenantConnection.isRoot == false;
      const userEntity = isTenantUser
        ? await this.glbCoreAclTenantEmployeeAccountService.getUserByUniqueId(
            {
              dataSource: tenantConnection.connection!,
              tenantCode: tenantConnection.tenantCode,
            },
            {
              uniqueId: userJwtResponse?.id,
            },
          )
        : await this.glbCoreAclRootUserService.getUserByUniqueId({
            uniqueId: userJwtResponse?.id,
          });

      const userStatusMustNot = this.reflector.getAllAndOverride<
        (typeof UserStatus)[keyof typeof UserStatus][]
      >('userStatus', [context.getHandler(), context.getClass()]);
      // 사용자 정보가 없으면 예외 발생
      if (!userEntity || !userEntity?.data || !userEntity?.data?.entity) {
        throw CommonError.createByErrorCode(GlbCoreAclError.FIND_USER_FAILED);
      }
      // 로그인 한 사용자의 테넌트 코드와 헤더에 있는 테넌트 코드가 다르면 예외 발생
      if (
        removeTenantCodeRRNumber(tenantConnection.tenantCode) !==
          userJwtResponse.tenantId &&
        tenantConnection.isRoot == false
      ) {
        throw CommonError.createByErrorCode(
          GlbCoreAclError.INVALID_TOKEN_TENANT_CODE,
        );
      }

      const requirePermission = this.reflector.getAllAndOverride(
        'requirePermission',
        [context.getHandler(), context.getClass()],
      );
      // 테넌트 사용자인 경우 사용자 권한을 조회한다. 단, 권한이 필요한 경우에만 조회한다.
      // if (
      //   requirePermission &&
      //   isTenantUser &&
      //   userEntity.data.entity instanceof RnTenantEmployeeAccountEntity
      // ) {
      //   const permissions = await this.glbCoreAclService.getPermissionsByRoleId(
      //     {
      //       dataSource: tenantConnection.connection!,
      //       tenantCode: tenantConnection.tenantCode,
      //     },
      //     {
      //       role: userEntity.data?.entity?.role?.id,
      //     }
      //   );

      //   context.switchToHttp().getRequest()['permissions'] = permissions?.data
      //     ?.permissions
      //     ? permissions.data?.permissions.map(
      //         (permission: RnTenantPermissionEntity) => {
      //           return {
      //             id: permission?.id,
      //             name: permission?.name,
      //             description: permission?.description ?? '설명',
      //           };
      //         }
      //       )
      //     : [];
      // }

      // 사용자 상태 확인 [SUSPENDED] - UserStatus.SUSPENDED 가 없으면 확인하지 않는다.
      if (
        (userStatusMustNot &&
          userStatusMustNot.includes(UserStatus.SUSPENDED) &&
          userEntity.data.entity.status ===
            RnTenantEmployeeAccountStatus.SUSPENDED) ||
        userEntity.data.entity.status === RnDefaultUserStatus.SUSPENDED
      ) {
        throw CommonError.createByErrorCode(GlbCoreAclError.USER_SUSPENDED);
      }
      // 사용자 상태 확인 [INACTIVE] - UserStatus.INACTIVE 가 없으면 확인하지 않는다.
      if (
        userStatusMustNot &&
        userStatusMustNot.includes(UserStatus.INACTIVE) &&
        (userEntity.data.entity.status ===
          RnTenantEmployeeAccountStatus.INACTIVE ||
          userEntity.data.entity.status === RnDefaultUserStatus.INACTIVE)
      ) {
        throw CommonError.createByErrorCode(GlbCoreAclError.USER_INACTIVE);
      }
      // 사용자 상태 확인 [DELETED]
      if (
        userEntity.data.entity.status ===
          RnTenantEmployeeAccountStatus.DELETED ||
        userEntity.data.entity.status === RnDefaultUserStatus.DELETED
      ) {
        throw CommonError.createByErrorCode(GlbCoreAclError.USER_DELETED);
      }

      return true;
    } catch (e) {
      // request - user 속성 삭제
      context.switchToHttp().getRequest()['user'] = null;

      if (e instanceof CommonError) {
        throw e;
      }
      console.log('e', e);
      throw CommonError.createByErrorCode(GlbCoreAclError.AUTH_FAILED);
    }
  }
}
