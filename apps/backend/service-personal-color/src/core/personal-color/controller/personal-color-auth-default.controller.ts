import {
  ApiDefaultHeaders,
  ApiResponse,
  CommonResponseUtil,
  IApiCommonResponse,
  LogMxProvider,
} from '@capstone-project/glb-commons';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  PcAuthProfileResponseDto,
  PcLoginRequestDto,
  PcSignupRequestDto,
} from '../dto/personal-color.dto';
import { PERSONAL_COLOR_SESSION_HEADER } from '../types/personal-color.types';
import { PersonalColorAuthService } from '../service/personal-color-auth.service';

@Controller({
  path: 'personal-color/default/auth',
  version: '1',
})
@ApiTags('Personal Color - Auth Controller')
export class PersonalColorAuthDefaultController {
  constructor(
    private readonly personalColorAuthService: PersonalColorAuthService,
    private readonly logger: LogMxProvider,
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: '회원가입 (게스트 세션 토큰 제공 시 기존 분석 이력을 계정으로 승계)',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: false,
    description: '게스트 세션 토큰 (있으면 회원으로 승격)',
  })
  @ApiBody({ type: PcSignupRequestDto })
  @ApiResponse(PcAuthProfileResponseDto, '회원가입 성공')
  async signup(
    @Body() body: PcSignupRequestDto,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcAuthProfileResponseDto>> {
    const result = await this.personalColorAuthService.signup({
      userId: body.userId,
      password: body.password,
      userName: body.userName,
      userCountry: body.userCountry,
      sessionToken,
    });

    this.logSuccess(reqOrigin, '퍼스널 컬러 회원가입');

    return CommonResponseUtil.successResponse(result.data, '회원가입 성공');
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인 (성공 시 세션 토큰 재발급)',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiBody({ type: PcLoginRequestDto })
  @ApiResponse(PcAuthProfileResponseDto, '로그인 성공')
  async login(
    @Body() body: PcLoginRequestDto,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcAuthProfileResponseDto>> {
    const result = await this.personalColorAuthService.login({
      userId: body.userId,
      password: body.password,
    });

    this.logSuccess(reqOrigin, '퍼스널 컬러 로그인');

    return CommonResponseUtil.successResponse(result.data, '로그인 성공');
  }

  @Get('me')
  @ApiOperation({
    summary: '내 프로필 조회',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '회원 세션 토큰',
  })
  @ApiResponse(PcAuthProfileResponseDto, '프로필 조회 성공')
  async me(
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcAuthProfileResponseDto>> {
    const result = await this.personalColorAuthService.me(sessionToken);

    this.logSuccess(reqOrigin, '퍼스널 컬러 프로필 조회');

    return CommonResponseUtil.successResponse(result.data, '프로필 조회 성공');
  }

  private logSuccess(reqOrigin: Request, message: string) {
    this.logger.log(
      message,
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );
  }
}
