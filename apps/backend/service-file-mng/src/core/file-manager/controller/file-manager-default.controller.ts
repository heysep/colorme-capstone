import {
  CommonResponseUtil,
  IApiCommonResponse,
  ObjectStorageCheckService,
  RnDefaultUploadFileEntity,
  UploaderType,
  UploadFileStatus,
  UploadFileStorageType,
} from '@capstone-project/glb-commons';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const EXAMPLE_RESULT = {
  fileEntity: {
    id: '파일 아이디',
    originalName: '파일 원본 이름',
    storageName: '파일 스토리지 이름',
    uploaderType: UploaderType.ROOT_USER,
    uploaderDetail: '업로더 상세 정보',
    uploaderId: '업로더 아이디',
    size: 0,
    type: '파일 타입',
    uploadIp: '업로더 IP',
    description: '파일 설명',
    status: UploadFileStatus.ACTIVE,
    storageType: UploadFileStorageType.MINIO,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  },
};

@Controller({
  path: 'every/file-manager/default',
  version: '1',
})
@ApiTags('File Manager For Default - 파일 기본 기능')
export class FileManagerDefaultController {
  constructor(
    private readonly ojectStorageCheckService: ObjectStorageCheckService,
  ) {}

  /**
   * 파일 정보 조회
   *
   * @param storageId 파일 스토리지 ID
   */
  @Get('info/:storageId')
  @ApiResponse({
    type: IApiCommonResponse,
    examples: {
      '[전체] 사양 임시 저장 성공': {
        summary: '사양 임시 저장 성공',
        value: CommonResponseUtil.successResponseForSwagger<{
          fileEntity: RnDefaultUploadFileEntity;
        }>(
          {
            ...EXAMPLE_RESULT,
          },
          '파일 정보 조회 성공',
        ),
      },
    },
  })
  @ApiOperation({ summary: '파일 정보 조회' })
  async getFileInfo(@Param('storageId') storageId: string): Promise<
    IApiCommonResponse<{
      fileEntity: RnDefaultUploadFileEntity;
    }>
  > {
    const result = await this.ojectStorageCheckService.getFileEntity({
      storageName: storageId,
    });

    return CommonResponseUtil.successResponse(
      {
        fileEntity: result.data,
      },
      '파일 정보 조회 성공',
    );
  }

  /**
   * 파일 정보 조회 목록
   *
   * @param storageId 파일 스토리지 ID
   */
  @Get('info/array/:storageIds')
  @ApiResponse({
    type: IApiCommonResponse,
    examples: {
      '[전체] 파일 정보 조회 목록 성공': {
        summary: '파일 정보 조회 목록 성공',
        value: CommonResponseUtil.successResponseForSwagger<{
          fileEntity: RnDefaultUploadFileEntity[];
        }>(
          {
            fileEntity: [EXAMPLE_RESULT.fileEntity],
          },
          '파일 정보 조회 목록 성공',
        ),
      },
    },
  })
  @ApiOperation({
    summary:
      '파일 정보 조회 목록 (인자에 , 를 포함하면 쉼표로 구분하여 여러 개 조회)',
  })
  async getFileInfoArray(@Param('storageIds') storageIds: string): Promise<
    IApiCommonResponse<{
      fileEntity: RnDefaultUploadFileEntity[];
    }>
  > {
    const result = await this.ojectStorageCheckService.getFileEntityList({
      storageName: storageIds.includes(',')
        ? storageIds.split(',')
        : [storageIds],
    });

    return CommonResponseUtil.successResponse(
      {
        fileEntity: result.data,
      },
      '파일 정보 조회 목록 성공',
    );
  }
}
