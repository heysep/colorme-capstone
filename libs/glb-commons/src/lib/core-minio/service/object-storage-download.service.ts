/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Repository } from 'typeorm';
import { RnDefaultUploadFileEntity } from '../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Readable } from 'stream';
import { GlbRedisCoreService } from '../../core-redis/service/redis-root.service';
import {
  REDIS_KEY,
  RedisKeyNameManager,
} from '../../core-redis/utils/redis-key-name-manager.utils';
import { CommonError } from '../../core-response/utils/common-error.util';
import { UploadFileStatus } from '../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbCoreMinioError } from '../error/minio-error.error';
import { ObjectStorageBucketService } from './object-storage-bucket.service';
import internal = require('stream');

@Injectable()
export class ObjectStorageDownloadService {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    // -------------
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    // -------------
    private readonly objectStorageBucketService: ObjectStorageBucketService,
    public readonly logMxProvider: LogMxProvider,
    private readonly glbRedisCoreService: GlbRedisCoreService,
  ) {}

  /**
   * 파일 다운로드
   *
   * @param options
   * @returns
   */
  public async downloadFile(options: { storageName: string }): Promise<
    IDefaultOutputDto<{
      fileStream: internal.Readable;
      entity: RnDefaultUploadFileEntity;
    }>
  > {
    try {
      const fileEntity = await this.uploadFileRepository.findOne({
        where: {
          storageName: options.storageName,
        },
      });
      // 파일 존재 여부 체크
      if (!fileEntity) {
        throw CommonError.createByErrorCode(
          GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
        );
      }

      // 지연 업로드 파일인지 확인
      if (fileEntity.status === UploadFileStatus.DELAYED) {
        return await this.processDelayedUploadFile(fileEntity);
      }

      await this.objectStorageBucketService.checkAndCreateBucket();

      const fileStream = await this.minioClient.getObject(
        ObjectStorageBucketService.BUCKET_NAME,
        fileEntity.storageName,
      );

      return IDefaultOutputDto.success(
        {
          fileStream,
          entity: fileEntity,
        },
        '파일 다운로드 성공!',
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        `File download error: ${error?.message ?? 'Unknown error'}`,
      );

      throw CommonError.createByErrorCode(
        GlbCoreMinioError.MINIO_FILE_DOWNLOAD_ERROR,
      );
    }
  }

  /**
   * 지연 업로드 파일 처리
   *
   * @param fileEntity
   * @returns
   */
  private async processDelayedUploadFile(
    fileEntity: RnDefaultUploadFileEntity,
  ): Promise<
    IDefaultOutputDto<{
      fileStream: internal.Readable;
      entity: RnDefaultUploadFileEntity;
    }>
  > {
    try {
      // Redis에서 파일 데이터 가져오기
      const redisKey = RedisKeyNameManager.getRedisKeyName(
        REDIS_KEY.DELAYED_UPLOAD_FILE,
        fileEntity.storageName,
      );

      const redis = this.glbRedisCoreService.getRedis();
      const delayedFileDataString = await redis.get(redisKey);

      if (!delayedFileDataString) {
        throw CommonError.createByErrorCode(
          GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
        );
      }

      const delayedFileData = JSON.parse(delayedFileDataString);

      // base64 디코딩하여 Buffer로 변환
      const fileBuffer = Buffer.from(delayedFileData.fileBuffer, 'base64');

      // 버킷 존재 여부 확인 및 버킷 생성
      await this.objectStorageBucketService.checkAndCreateBucket();

      // MINIO에 실제 업로드
      await this.minioClient.putObject(
        ObjectStorageBucketService.BUCKET_NAME,
        fileEntity.storageName,
        fileBuffer,
        fileBuffer.length,
        {
          'Content-Type': delayedFileData.mimetype,
        },
      );

      // DB 상태 업데이트
      await this.uploadFileRepository.update(
        { id: fileEntity.id },
        { status: UploadFileStatus.ACTIVE },
      );

      // Redis에서 해당 키 삭제
      await redis.del(redisKey);

      // 파일 스트림 생성
      const fileStream = Readable.from(fileBuffer);

      // 엔티티 상태 업데이트
      fileEntity.status = UploadFileStatus.ACTIVE;

      this.logMxProvider.logNoMetadata(
        `Delayed file processed and uploaded: ${fileEntity.id}`,
      );

      return IDefaultOutputDto.success(
        {
          fileStream,
          entity: fileEntity,
        },
        '지연 업로드 파일 처리 및 다운로드 성공!',
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        `Delayed file processing error: ${error?.message ?? 'Unknown error'}`,
      );

      throw CommonError.createByErrorCode(
        GlbCoreMinioError.MINIO_FILE_DOWNLOAD_ERROR,
      );
    }
  }
}
