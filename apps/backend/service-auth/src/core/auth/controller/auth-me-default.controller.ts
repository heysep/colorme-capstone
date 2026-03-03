import {
  ApiDefaultHeaders,
  ApiGuard,
  ApiResponse,
  CommonResponseUtil,
  IJsxCrudGetOneDtoFactory,
  ITenantTransactionContext,
  JwtPayload,
  LogMxProvider,
  RnDefaultRootUserEntity,
  RnTenantCbizEmployeeMappingAccountEntity,
  TenantTransactionContext,
  User,
} from '@capstone-project/glb-commons';
import { Controller, Get, HttpStatus, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthMeDefaultService } from '../service/auth-me-default.service';

@Controller({
  path: 'me/default',
  version: '1',
})
@ApiTags('Auth Me Default - Default Controller')
export class AuthMeDefaultController {
  constructor(
    private readonly authMeDefaultService: AuthMeDefaultService,
    private readonly logger: LogMxProvider,
  ) {}

  @Get('root')
  @ApiGuard({ onlyRootDb: true })
  @ApiOperation({
    operationId: 'authMeDefaultGetRootUserDetail',
    summary: '루트 사용자 자신 조회',
  })
  @ApiDefaultHeaders({ withTenantCode: false })
  @ApiResponse(
    [
      {
        type: IJsxCrudGetOneDtoFactory(RnDefaultRootUserEntity),
        exampleName: '루트 사용자 자신 조회 성공',
      },
    ],
    '루트 사용자 자신 조회 성공',
  )
  async getRootUserDetail(@User() user: JwtPayload, @Req() reqOrigin) {
    const result = await this.authMeDefaultService.findDefaultRootUserDetail({
      id: user.id,
    });

    this.logger.log(
      '루트 사용자 자신 조회 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );

    return CommonResponseUtil.successResponse(
      result.data,
      '루트 사용자 자신 조회 성공',
    );
  }

  @Get('tenant')
  @ApiGuard({})
  @ApiOperation({
    operationId: 'authMeDefaultGetTenantEmployee',
    summary: '테넌트 사용자 상세 조회',
  })
  @ApiDefaultHeaders({})
  @ApiResponse(
    [
      {
        type: IJsxCrudGetOneDtoFactory(
          RnTenantCbizEmployeeMappingAccountEntity,
        ),
        exampleName: '테넌트 사용자 자신 조회 성공',
      },
    ],
    '테넌트 사용자 자신 조회 성공',
  )
  async getTenantEmployee(
    @TenantTransactionContext() ctx: ITenantTransactionContext,
    @Req() reqOrigin,
    @User() user: JwtPayload,
  ) {
    const result = await this.authMeDefaultService.findTenantEmployee(ctx, {
      id: user.id,
    });

    this.logger.log(
      '테넌트 사용자 자신 조회 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );

    return CommonResponseUtil.successResponse(
      result.data,
      '테넌트 사용자 자신 조회 성공',
    );
  }
}
