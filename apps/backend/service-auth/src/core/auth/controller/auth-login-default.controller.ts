import {
  ApiDefaultHeaders,
  ApiResponse,
  CommonResponseUtil,
  ITenantTransactionContext,
  LogMxProvider,
  TenantTransactionContext,
} from '@capstone-project/glb-commons';
import { Body, Controller, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerAuthLoginDefaultDto } from '../dto/controller.auth-login-default.dto';
import { AuthLoginDefaultService } from '../service/auth-login-default.service';

@Controller({
  path: 'login/default',
  version: '1',
})
@ApiTags('Auth Login - Default Controller')
export class AuthLoginDefaultController {
  constructor(
    private readonly authLoginDefaultService: AuthLoginDefaultService,
    private readonly logger: LogMxProvider,
  ) {}

  @Post('root')
  @ApiOperation({
    operationId: 'authLoginDefaultLoginRoot',
    summary: '루트 사용자 로그인',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiBody({ type: ControllerAuthLoginDefaultDto })
  @ApiResponse(
    [
      {
        type: { jwtToken: String },
        exampleName: '[루트 사용자 로그인] 루트 사용자 로그인 성공',
      },
    ],
    '루트 사용자 로그인 성공',
  )
  async loginRoot(
    @Body() body: ControllerAuthLoginDefaultDto,
    @Req() reqOrigin,
  ) {
    const result =
      await this.authLoginDefaultService.loginByUserIdAndPasswordForRoot({
        userId: body.userId,
        password: body.password,
      });

    this.logger.log(
      '루트 사용자 로그인 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );

    return CommonResponseUtil.successResponse(
      result.data,
      '루트 사용자 로그인 성공',
    );
  }

  @Post('tenant')
  @ApiOperation({
    operationId: 'authLoginDefaultLoginTenant',
    summary: '테넌트 사용자 로그인',
  })
  @ApiDefaultHeaders({ withJwtToken: false })
  @ApiBody({ type: ControllerAuthLoginDefaultDto })
  @ApiResponse(
    [
      {
        type: { jwtToken: String },
        exampleName: '[테넌트 사용자 로그인] 테넌트 사용자 로그인 성공',
      },
    ],
    '테넌트 사용자 로그인 성공',
  )
  async loginTenant(
    @TenantTransactionContext() ctx: ITenantTransactionContext,
    @Req() reqOrigin,
    @Body() body: ControllerAuthLoginDefaultDto,
  ) {
    const result =
      await this.authLoginDefaultService.loginByUserIdAndPasswordForTenant(
        ctx,
        {
          userId: body.userId,
          password: body.password,
        },
      );

    this.logger.log(
      '테넌트 사용자 로그인 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );
    return CommonResponseUtil.successResponse<{ jwtToken: string }>(
      result.data,
      '테넌트 사용자 로그인 성공',
    );
  }
}
