import {
  GlbCoreAclRootUserService,
  GlbCoreAclTenantEmployeeAccountService,
  ITenantTransactionContext,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { IDefaultOutputDto } from 'libs/glb-commons/src/lib/utils-dto/default-output.dto';

@Injectable()
export class AuthLoginDefaultService {
  constructor(
    private readonly aclRootUserService: GlbCoreAclRootUserService,
    private readonly aclTenantUserService: GlbCoreAclTenantEmployeeAccountService,
  ) {}

  /**
   * 루트 사용자 아이디와 비밀번호로 로그인
   *
   * @param options 로그인 인자
   * @returns 로그인 결과
   */
  async loginByUserIdAndPasswordForRoot(options: {
    userId: string;
    password: string;
  }): Promise<
    IDefaultOutputDto<{
      jwtToken: string;
    }>
  > {
    const userId = options.userId;
    const password = options.password;

    return await this.aclRootUserService.loginByUserIdAndPassword({
      userId: userId,
      password: password,
    });
  }

  /**
   * 테넌트 사용자 아이디와 비밀번호로 로그인
   *
   * @param options 로그인 인자
   * @returns 로그인 결과
   */
  async loginByUserIdAndPasswordForTenant(
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
    const userId = options.userId;
    const password = options.password;

    return await this.aclTenantUserService.loginByUserIdAndPassword(ctx, {
      userId: userId,
      password: password,
    });
  }
}
