import { Injectable, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServiceException } from '../../core-response/decorator/service-exception.decorator';
import { CommonError } from '../../core-response/utils/common-error.util';
import { RnTenantEmployeeAccountEntity } from '../../core-typeorm/entity/tenant/rn-tenant-employee-account.tenant-mysql-entity';
import {
  ITenantTransactionContext,
  removeTenantCodeRRNumber,
} from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';
import { GlbCoreAclError } from '../error/acl-error.error';
import { GlbCoreAclTenantEmployeeAccountRepository } from '../repository/acl-tenant-employee-account.repository';
import { JwtPayload } from '../strategy/jwt.strategy';
import { cipherIsHashValid } from '../utils/cipher.utils';

@Injectable({
  scope: Scope.REQUEST,
})
export class GlbCoreAclTenantEmployeeAccountService {
  constructor(
    public readonly logMxProvider: LogMxProvider,
    // ------------
    private readonly repository: GlbCoreAclTenantEmployeeAccountRepository,
    // ------------
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 비밀번호와 솔트를 합쳐서 해시 생성
   *
   * @param password 비밀번호
   * @param salt 솔트
   * @returns 해시
   */
  private getPasswordHash(password: string, salt: string): string {
    return `${password}-${salt}`;
  }

  /**
   * JWT 토큰 생성
   *
   * @param options 토큰 생성 인자
   * @returns 생성된 JWT 토큰
   */
  private async createJwtToken<T>(options: { payload: T }): Promise<string> {
    return await this.jwtService.signAsync(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(options?.payload as any),
      },
      { expiresIn: '24h' },
    );
  }

  /**
   * 직원 계정 고유 아이디로 테넌트 직원 계정 조회
   *
   * @param options 직원 계정 고유 아이디
   * @returns 직원 계정 조회 결과
   */
  @ServiceException({
    errorCode: GlbCoreAclError.FIND_USER_FAILED,
  })
  async getUserByUniqueId(
    ctx: ITenantTransactionContext,
    options: {
      uniqueId: string;
    },
  ): Promise<
    IDefaultOutputDto<{
      entity: RnTenantEmployeeAccountEntity;
    }>
  > {
    const employeeAccount = await this.repository.findOneByUniqueId({
      ctx,
      uniqueId: options.uniqueId,
    });

    if (employeeAccount.isEmpty()) {
      throw CommonError.createByErrorCode(GlbCoreAclError.FIND_USER_FAILED);
    }

    // 직원 계정 정보 조회 결과 추출, 비어있으면 예외 발생
    const employeeAccountValue = GlbOptionalValue.getValueAndEmptyThrowError(
      employeeAccount,
      GlbCoreAclError.FIND_USER_FAILED,
    );

    return IDefaultOutputDto.success({
      entity: employeeAccountValue,
    });
  }

  /**
   * 직원 계정 아이디와 비밀번호로 로그인
   *
   * @param options 로그인 인자
   * @returns 로그인 결과
   */
  @ServiceException({
    errorCode: GlbCoreAclError.LOGIN_FAILED_UNKNOWN_ERROR,
  })
  async loginByUserIdAndPassword(
    ctx: ITenantTransactionContext,
    options: {
      userId: string;
      password: string;
    },
  ): Promise<
    IDefaultOutputDto<{
      jwtToken: string;
    }>
  > {
    const employeeAccount = await this.repository.findOneByUserId({
      ctx,
      userId: options.userId,
    });

    if (employeeAccount.isEmpty()) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
      );
    }

    // 직원 계정 정보 조회 결과 추출, 비어있으면 예외 발생
    const employeeAccountValue = GlbOptionalValue.getValueAndEmptyThrowError(
      employeeAccount,
      GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
    );

    // 비밀번호 비교
    const isPasswordValid = await cipherIsHashValid(
      this.getPasswordHash(options.password, employeeAccountValue.passwordSalt),
      employeeAccountValue.passwordEncrypted,
    );

    if (!isPasswordValid) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
      );
    }

    // 로그인 성공, 로그인 시간 테이블 업데이트
    await this.repository.updateLastLoginAt(ctx, {
      id: employeeAccountValue.id,
    });

    // 토큰 생성
    const token = await this.createJwtToken<JwtPayload>({
      payload: {
        id: employeeAccountValue.id,
        userId: employeeAccountValue.userId,
        userName: employeeAccountValue.name,
        tenantId: removeTenantCodeRRNumber(ctx.tenantCode),
      },
    });

    // 성공 응답 생성
    return IDefaultOutputDto.success({
      jwtToken: token,
    });
  }
}
