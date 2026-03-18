import {
  ApiDefaultHeaders,
  ApiResponse,
  CommonResponseUtil,
  IApiCommonResponse,
  LogMxProvider,
  Public,
} from '@capstone-project/glb-commons';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import {
  PcAnalysisDetailResponseDto,
  PcAnalyzeUploadResponseDto,
  PcLookDetailResponseDto,
  PcSaveLookRequestDto,
  PcSaveLookResponseDto,
  PcShareLookResponseDto,
  PcSharedLookResponseDto,
  PcTryOnRequestDto,
  PcTryOnResponseDto,
} from '../dto/personal-color.dto';
import { PERSONAL_COLOR_SESSION_HEADER } from '../types/personal-color.types';
import { PersonalColorAnalysisService } from '../service/personal-color-analysis.service';
import { PersonalColorLookService } from '../service/personal-color-look.service';

@Controller({
  path: 'personal-color/default',
  version: '1',
})
@ApiTags('Personal Color - Default Controller')
export class PersonalColorDefaultController {
  constructor(
    private readonly personalColorAnalysisService: PersonalColorAnalysisService,
    private readonly personalColorLookService: PersonalColorLookService,
    private readonly logger: LogMxProvider,
  ) {}

  @Post('analyze/upload')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({
    summary: '얼굴 사진 업로드 후 퍼스널 컬러 분석 시작',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: false,
    description: '게스트 세션 토큰',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['photo'],
    },
  })
  @ApiResponse(PcAnalyzeUploadResponseDto, '퍼스널 컬러 분석 요청 성공')
  async uploadFacePhoto(
    @UploadedFile() photo: Express.Multer.File,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @RealIP() ip: string,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcAnalyzeUploadResponseDto>> {
    const result = await this.personalColorAnalysisService.uploadForAnalysis({
      file: photo,
      sessionToken,
      uploaderIp: ip ?? 'UNKNOWN',
    });

    this.logSuccess(reqOrigin, '퍼스널 컬러 분석 요청');

    return CommonResponseUtil.successResponse(
      result.data,
      '퍼스널 컬러 분석 요청 성공',
    );
  }

  @Get('analyze/:analysisId')
  @ApiOperation({
    summary: '퍼스널 컬러 분석 결과 조회',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '게스트 세션 토큰',
  })
  @ApiResponse(PcAnalysisDetailResponseDto, '퍼스널 컬러 분석 결과 조회 성공')
  async getAnalysisDetail(
    @Param('analysisId', ParseIntPipe) analysisId: number,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcAnalysisDetailResponseDto>> {
    const result = await this.personalColorAnalysisService.getAnalysisDetail({
      sessionToken,
      analysisId,
    });

    this.logSuccess(reqOrigin, '퍼스널 컬러 분석 결과 조회');

    return CommonResponseUtil.successResponse(
      result.data,
      '퍼스널 컬러 분석 결과 조회 성공',
    );
  }

  @Post('looks/try-on')
  @ApiOperation({
    summary: '선택한 카탈로그 의상으로 가상 피팅 생성',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '게스트 세션 토큰',
  })
  @ApiBody({ type: PcTryOnRequestDto })
  @ApiResponse(PcTryOnResponseDto, '가상 피팅 생성 요청 성공')
  async createTryOn(
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Body() body: PcTryOnRequestDto,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcTryOnResponseDto>> {
    const result = await this.personalColorLookService.createTryOn({
      sessionToken,
      body,
    });

    this.logSuccess(reqOrigin, '가상 피팅 생성 요청');

    return CommonResponseUtil.successResponse(
      result.data,
      '가상 피팅 생성 요청 성공',
    );
  }

  @Get('looks/:lookId')
  @ApiOperation({
    summary: '가상 피팅 결과 조회',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '게스트 세션 토큰',
  })
  @ApiResponse(PcLookDetailResponseDto, '가상 피팅 결과 조회 성공')
  async getLookDetail(
    @Param('lookId', ParseIntPipe) lookId: number,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcLookDetailResponseDto>> {
    const result = await this.personalColorLookService.getLookDetail({
      sessionToken,
      lookId,
    });

    this.logSuccess(reqOrigin, '가상 피팅 결과 조회');

    return CommonResponseUtil.successResponse(
      result.data,
      '가상 피팅 결과 조회 성공',
    );
  }

  @Post('looks/:lookId/save')
  @ApiOperation({
    summary: '가상 피팅 룩 저장',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '게스트 세션 토큰',
  })
  @ApiBody({ type: PcSaveLookRequestDto })
  @ApiResponse(PcSaveLookResponseDto, '가상 피팅 룩 저장 성공')
  async saveLook(
    @Param('lookId', ParseIntPipe) lookId: number,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Body() body: PcSaveLookRequestDto,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcSaveLookResponseDto>> {
    const result = await this.personalColorLookService.saveLook({
      sessionToken,
      lookId,
      description: body.description,
    });

    this.logSuccess(reqOrigin, '가상 피팅 룩 저장');

    return CommonResponseUtil.successResponse(
      result.data,
      '가상 피팅 룩 저장 성공',
    );
  }

  @Post('looks/:lookId/share')
  @ApiOperation({
    summary: '가상 피팅 룩 공유 링크 생성',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiHeader({
    name: PERSONAL_COLOR_SESSION_HEADER,
    required: true,
    description: '게스트 세션 토큰',
  })
  @ApiResponse(PcShareLookResponseDto, '공유 링크 생성 성공')
  async shareLook(
    @Param('lookId', ParseIntPipe) lookId: number,
    @Headers(PERSONAL_COLOR_SESSION_HEADER) sessionToken: string | undefined,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcShareLookResponseDto>> {
    const result = await this.personalColorLookService.shareLook({
      sessionToken,
      lookId,
    });

    this.logSuccess(reqOrigin, '가상 피팅 룩 공유');

    return CommonResponseUtil.successResponse(
      result.data,
      '공유 링크 생성 성공',
    );
  }

  @Get('share/:shareToken')
  @Public()
  @ApiOperation({
    summary: '공유된 가상 피팅 룩 조회',
  })
  @ApiDefaultHeaders({ withTenantCode: false, withJwtToken: false })
  @ApiResponse(PcSharedLookResponseDto, '공유 룩 조회 성공')
  async getSharedLook(
    @Param('shareToken') shareToken: string,
    @Req() reqOrigin: Request,
  ): Promise<IApiCommonResponse<PcSharedLookResponseDto>> {
    const result = await this.personalColorLookService.getSharedLook({
      shareToken,
    });

    this.logSuccess(reqOrigin, '공유 룩 조회');

    return CommonResponseUtil.successResponse(
      result.data,
      '공유 룩 조회 성공',
    );
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
