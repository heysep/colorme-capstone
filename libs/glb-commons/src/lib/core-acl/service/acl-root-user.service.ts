import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServiceException } from '../../core-response/decorator/service-exception.decorator';
import { CommonError } from '../../core-response/utils/common-error.util';
import { RnDefaultRootUserEntity } from '../../core-typeorm/entity/default/rn-default-user.mysql-entity';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbOptionalValue } from '../../utils-optional/utils-optional.util';
import { GlbCoreAclError } from '../error/acl-error.error';
import { GlbCoreAclRootAdminUserRepository } from '../repository/acl-root-admin-user.repository';
import { GlbCoreAclRootUserRepository } from '../repository/acl-root-user.repository';
import { JwtPayload } from '../strategy/jwt.strategy';
import { cipherIsHashValid } from '../utils/cipher.utils';

@Injectable()
export class GlbCoreAclRootUserService {
  constructor(
    public readonly logMxProvider: LogMxProvider,
    // ------------
    private readonly repository: GlbCoreAclRootUserRepository,
    private readonly repositoryAdmin: GlbCoreAclRootAdminUserRepository,
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
    return await this.jwtService.signAsync({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options?.payload as any),
    });
  }

  /**
   * 사용자 고유 아이디로 루트 사용자 조회
   *
   * @param options 사용자 고유 아이디
   * @returns 사용자 조회 결과
   */
  @ServiceException({
    errorCode: GlbCoreAclError.FIND_USER_FAILED,
  })
  async getUserByUniqueId(
    options: { uniqueId: string },
    isAdmin?: boolean,
  ): Promise<
    IDefaultOutputDto<{
      entity: RnDefaultRootUserEntity;
    }>
  > {
    const user = await (
      isAdmin === true ? this.repositoryAdmin : this.repository
    ).findOneByUniqueId({
      uniqueId: options.uniqueId,
    });

    if (user.isEmpty()) {
      throw CommonError.createByErrorCode(GlbCoreAclError.FIND_USER_FAILED);
    }

    // 사용자 정보 조회 결과 추출, 비어있으면 예외 발생
    const userValue = GlbOptionalValue.getValueAndEmptyThrowError(
      user,
      GlbCoreAclError.FIND_USER_FAILED,
    );

    return IDefaultOutputDto.success({
      entity: userValue,
    });
  }

  /**
   * 사용자 아이디와 비밀번호로 로그인
   *
   * @param options 로그인 인자
   * @returns 로그인 결과
   */
  @ServiceException({
    errorCode: GlbCoreAclError.LOGIN_FAILED_UNKNOWN_ERROR,
  })
  async loginByUserIdAndPassword(options: {
    userId: string;
    password: string;
    isAdmin?: boolean;
  }): Promise<
    IDefaultOutputDto<{
      jwtToken: string;
      uniqueId: string;
    }>
  > {
    const user = await (
      options.isAdmin === true ? this.repositoryAdmin : this.repository
    ).findOneByUserId({
      userId: options.userId,
    });

    if (user.isEmpty()) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
      );
    }

    // 사용자 정보 조회 결과 추출, 비어있으면 예외 발생
    const userValue = GlbOptionalValue.getValueAndEmptyThrowError(
      user,
      GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
    );

    // 비밀번호 비교
    const isPasswordValid = await cipherIsHashValid(
      this.getPasswordHash(options.password, userValue.passwordSalt),
      userValue.passwordEncrypted,
    );

    if (!isPasswordValid) {
      throw CommonError.createByErrorCode(
        GlbCoreAclError.LOGIN_FAILED_ID_OR_PASSWORD_INVALID,
      );
    }

    // 로그인 성공, 로그인 시간 테이블 업데이트
    await (
      options.isAdmin === true ? this.repositoryAdmin : this.repository
    ).updateLastLoginAt({
      id: userValue.id,
    });

    // 토큰 생성
    const token = await this.createJwtToken<JwtPayload>({
      payload: {
        id: userValue.id,
        userId: userValue.userId,
        userName: userValue.name,
        tenantId: 'ROOT',
      },
    });

    // 성공 응답 생성
    return IDefaultOutputDto.success({
      jwtToken: token,
      uniqueId: userValue.id,
    });
  }
}
