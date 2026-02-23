/* eslint-disable @typescript-eslint/no-explicit-any */
import { CbizTenantConfigKey } from '@drvalue-bmes-backend/cbiz-commons';
import {
  CommonError,
  CommonResponseUtil,
  GlbRedisDistributedLockNamespace,
  GlbRedisDistributedLockService,
  IApiCommonResponse,
  ITenantTransactionContext,
  IsNotOnlyUserStatus,
  JwtGuard,
  JwtPayload,
  LogMxProvider,
  ObjectStorageUploadService,
  OnlyTenantUserDb,
  RnDefaultTenantConfigEntity,
  RnDefaultTenantRepository,
  RnDefaultUploadFileEntity,
  TenantTransactionContext,
  User,
  UserStatus,
  removeTenantCodeRRNumber,
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
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { Repository } from 'typeorm';
import { GlbFileManagerError } from '../error/file-manager.error';

@Controller({
  path: 'tenant/file-manager/upload',
  version: '1',
})
@ApiTags(
  'File Manager For Tenant Login User - 테넌트 로그인 사용자 전용 파일 업로더',
)
export class FileManagerForTenantLoginUserController {
  constructor(
    private readonly logMx: LogMxProvider,
    private readonly objectStorageUploadService: ObjectStorageUploadService,
    private readonly glbRedisDistributedLockService: GlbRedisDistributedLockService,
    private readonly tenantRepository: RnDefaultTenantRepository,
    @InjectRepository(RnDefaultTenantConfigEntity)
    private readonly tenantConfigRepository: Repository<RnDefaultTenantConfigEntity>,
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
  @OnlyTenantUserDb()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth('jwt-token')
  @ApiOperation({ summary: '[테넌트 사용자] 파일 업로드' })
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
  @ApiHeader({
    name: 'x-tenant-code',
    description: '테넌트 코드',
    required: true,
  })
  async uploadFileMultiple(
    @TenantTransactionContext() ctx: ITenantTransactionContext,
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
    let totalSize = 0;
    let uploadedFilesCount = 0;

    try {
      const indexAppendArray = files.map((file, index) => ({
        ...file,
        index: index,
      }));

      // 파일 업로드 사이즈 총합
      totalSize = indexAppendArray.reduce((acc, file) => acc + file.size, 0);

      const result = await Promise.all(
        indexAppendArray.map(async (file) => {
          const uploadResult = await this.objectStorageUploadService.uploadFile(
            {
              file: file,
              fileName: this.objectStorageUploadService.randomFileKeyGenerate(),
              uploader: `${user?.id}`,
              uploaderDetail: `${ctx.tenantCode}`,
              uploaderIp: ip || 'UNKNOWN',
              isTenantUser: true,
              description: '테넌트 사용자 전용 파일 업로더',
              index: file.index,
            },
          );

          uploadedFilesCount++;
          return uploadResult;
        }),
      );

      // 파일 용량 업데이트 (Redis 분산락 사용)
      await this.updateTenantStorageUsage(ctx, totalSize);

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
      // 파일 업로드 실패 시 이미 추가된 용량 롤백
      if (uploadedFilesCount > 0 && totalSize > 0) {
        try {
          await this.updateTenantStorageUsage(ctx, -totalSize);
          this.logMx.logNoMetadata(
            `파일 업로드 실패로 인한 용량 롤백 완료: ${ctx.tenantCode} - ${totalSize} bytes`,
          );
        } catch (rollbackError: any) {
          this.logMx.warnNoMetadata(
            `파일 업로드 실패 시 용량 롤백 실패: ${ctx.tenantCode} - ${rollbackError?.message}`,
          );
        }
      }

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

  /**
   * 테넌트별 파일 용량 업데이트 (Redis 분산락 사용)
   * 양수/음수 모두 처리 가능 (양수: 추가, 음수: 차감)
   *
   * @param ctx 테넌트 트랜잭션 컨텍스트
   * @param sizeChange 변경할 파일 용량 (bytes, 양수: 추가, 음수: 차감)
   */
  private async updateTenantStorageUsage(
    ctx: ITenantTransactionContext,
    sizeChange: number,
  ): Promise<void> {
    try {
      // 테넌트 코드로 테넌트 ID 조회
      const tenantOptional = await this.tenantRepository.findByCode({
        code: removeTenantCodeRRNumber(ctx?.tenantCode),
      });

      if (tenantOptional.isEmpty() || !tenantOptional.value?.id) {
        this.logMx.warnNoMetadata(
          `테넌트를 찾을 수 없습니다: ${removeTenantCodeRRNumber(ctx.tenantCode)}`,
        );
        return;
      }

      const tenantId = tenantOptional.value.id;

      // Redis 분산락 키 생성
      const lockKey = GlbRedisDistributedLockService.createLockKeyNoCtx(
        GlbRedisDistributedLockNamespace.STORAGE_LIMITER_WORKER,
        `tenant-storage-update-${tenantId}`,
      );

      // 분산락을 사용하여 동시성 제어
      await this.glbRedisDistributedLockService.withLockForTransaction(
        ctx,
        lockKey,
        async () => {
          // 기존 설정 조회
          const existingConfig = await this.tenantConfigRepository.findOne({
            where: {
              tenant: { id: tenantId },
              key: CbizTenantConfigKey.GXD_TENANT_FILE_STORAGE_USAGE_BYTES,
            },
            withDeleted: false,
          });

          // 기존 용량 가져오기 (없으면 0)
          const currentSize = existingConfig
            ? Number(existingConfig.value) || 0
            : 0;

          // 새 용량 계산 (음수도 처리 가능)
          const newSize = Math.max(0, currentSize + sizeChange);

          // 설정 업데이트 또는 생성
          if (existingConfig) {
            await this.tenantConfigRepository.update(existingConfig.id, {
              value: newSize.toString(),
            });
          } else {
            const newConfig = this.tenantConfigRepository.create({
              tenant: { id: tenantId } as any,
              key: CbizTenantConfigKey.GXD_TENANT_FILE_STORAGE_USAGE_BYTES,
              value: newSize.toString(),
            });
            await this.tenantConfigRepository.save(newConfig);
          }

          const action = sizeChange >= 0 ? '추가' : '차감';
          const sizeChangeAbs = Math.abs(sizeChange);
          this.logMx.logNoMetadata(
            `테넌트 파일 용량 업데이트 완료: ${ctx.tenantCode} - 기존: ${currentSize} bytes, ${action}: ${sizeChangeAbs} bytes, 총: ${newSize} bytes`,
          );
        },
        {
          ttl: 30, // 30초 TTL
          timeout: 10000, // 10초 타임아웃
        },
      );
    } catch (error: any) {
      // 파일 용량 업데이트 실패는 로그만 남기고 업로드는 성공 처리
      this.logMx.warnNoMetadata(
        `테넌트 파일 용량 업데이트 실패: ${ctx.tenantCode} - ${error?.message}`,
      );
    }
  }
}
