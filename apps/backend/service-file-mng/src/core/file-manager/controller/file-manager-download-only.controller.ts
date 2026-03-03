/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonError,
  LogMxProvider,
  ObjectStorageDownloadService,
} from '@capstone-project/glb-commons';
import { Controller, Get, Param, Req, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GlbFileManagerError } from '../error/file-manager.error';

@Controller({
  path: 'every/file-manager/download',
  version: '1',
})
@ApiTags('File Manager For Download Only - 파일 다운로드')
export class FileManagerDownloadOnlyController {
  constructor(
    private readonly logMx: LogMxProvider,
    private readonly objectStorageDownloadService: ObjectStorageDownloadService,
  ) {}

  /**
   * 파일 다운로드
   *
   * @param storageId 파일 스토리지 ID
   * @param req 요청 객체
   * @param res 응답 객체
   */
  @Get(':storageId')
  @ApiResponse({
    type: StreamableFile,
  })
  @ApiOperation({ summary: '파일 다운로드' })
  async downloadFile(
    @Param('storageId') storageId: string,
    @Req() req: Request,
  ): Promise<StreamableFile> {
    try {
      const file = await this.objectStorageDownloadService.downloadFile({
        storageName: storageId,
      });

      const fileNameEncoding = encodeURIComponent(
        file.data.entity.originalName,
      );

      return new StreamableFile(file.data.fileStream, {
        disposition: `attachment; filename*=UTF-8''${fileNameEncoding}`,
        type: file.data.entity.type,
      });
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMx.error(
        `File download failed. storageId: ${storageId} / error: ${error?.message}`,
        this.logMx.makeMetadata({
          request: req,
          status: GlbFileManagerError.FILE_DOWNLOAD_ERROR.status,
          resultCode: GlbFileManagerError.FILE_DOWNLOAD_ERROR.code,
        }),
      );

      throw CommonError.createByErrorCode(
        GlbFileManagerError.FILE_DOWNLOAD_ERROR,
      );
    }
  }
}
