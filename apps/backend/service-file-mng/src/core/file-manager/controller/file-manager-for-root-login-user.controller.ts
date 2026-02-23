/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonError,
  CommonResponseUtil,
  IApiCommonResponse,
  IsNotOnlyUserStatus,
  JwtGuard,
  JwtPayload,
  LogMxProvider,
  ObjectStorageUploadService,
  OnlyRootUserDb,
  RnDefaultUploadFileEntity,
  User,
  UserStatus,
} from '@drvalue-bmes-backend/glb-commons';
import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { GlbFileManagerError } from '../error/file-manager.error';

@Controller({
  path: 'root/file-manager/upload',
  version: '1',
})
@ApiTags(
  'File Manager For Root Login User - 루트 로그인 사용자 전용 파일 업로더',
)
export class FileManagerForRootLoginUserController {
  constructor(
    private readonly logMx: LogMxProvider,
    private readonly objectStorageUploadService: ObjectStorageUploadService,
  ) {}

  /**
   * 파일 업로드 [다중 파일 업로드]
   *
   * @param req 요청 객체
   * @param res 응답 객체
   */
  @Post('multiple')
  @UseGuards(JwtGuard)
  @IsNotOnlyUserStatus([UserStatus.INACTIVE, UserStatus.SUSPENDED])
  @OnlyRootUserDb()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth('jwt-token')
  @ApiOperation({ summary: '[루트 사용자] 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadFileMultiple(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @User() user: JwtPayload,
    @RealIP() ip: string,
  ): Promise<
    IApiCommonResponse<
      {
        originUploadResult: {
          eTag: string;
          versionId: string;
        };
        uploadEntityResult: RnDefaultUploadFileEntity;
      }[]
    >
  > {
    try {
      const indexAppendArray = files.map((file, index) => ({
        ...file,
        index: index,
      }));

      const result = await Promise.all(
        indexAppendArray.map(async (file) => {
          const uploadResult = await this.objectStorageUploadService.uploadFile(
            {
              file: file,
              fileName: this.objectStorageUploadService.randomFileKeyGenerate(),
              uploader: `${user?.id}`,
              uploaderDetail: `${user?.id}`,
              uploaderIp: ip ?? 'UNKNOWN',
              isTenantUser: false,
              description: '루트 사용자 전용 파일 업로더',
              index: file.index,
            },
          );

          return uploadResult;
        }),
      );

      return CommonResponseUtil.successResponse<
        {
          originUploadResult: {
            eTag: string;
            versionId: string;
          };
          uploadEntityResult: RnDefaultUploadFileEntity;
        }[]
      >(
        result
          .sort((a, b) => a.data.index - b.data.index)
          .map((item) => ({
            originUploadResult: item.data.originUploadResult,
            uploadEntityResult: item.data.uploadEntityResult,
          })),
        '파일 업로드 성공',
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMx.error(
        `File upload failed. / error: ${error?.message}`,
        this.logMx.makeMetadata({
          request: req,
          status: GlbFileManagerError.FILE_UPLOAD_ERROR.status,
          resultCode: GlbFileManagerError.FILE_UPLOAD_ERROR.code,
        }),
      );

      throw CommonError.createByErrorCode(
        GlbFileManagerError.FILE_UPLOAD_ERROR,
      );
    }
  }
}
