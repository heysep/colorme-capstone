/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { In, Repository } from 'typeorm';
import { CommonError } from '../../core-response/utils/common-error.util';
import { RnDefaultUploadFileEntity } from '../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbCoreMinioError } from '../error/minio-error.error';
import { ObjectStorageBucketService } from './object-storage-bucket.service';

@Injectable()
export class ObjectStorageDeleteService {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    // -------------
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    // -------------
    private readonly objectStorageBucketService: ObjectStorageBucketService,
    public readonly logMxProvider: LogMxProvider,
  ) {}

  /**
   * 파일 삭제
   *
   * @param options 파일 삭제 인자
   * @param options.storageName 파일 삭제 인자
   */
  public async deleteFiles(options: { storageName: string[] }): Promise<void> {
    try {
      const fileEntity = await this.uploadFileRepository.find({
        where: {
          storageName: In(options.storageName),
        },
      });
      // 파일 존재 여부 체크
      if (
        !fileEntity ||
        fileEntity.length === 0 ||
        fileEntity.length !== options.storageName.length
      ) {
        throw CommonError.createByErrorCode(
          GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
        );
      }

      await this.objectStorageBucketService.checkAndCreateBucket();

      await this.minioClient.removeObjects(
        ObjectStorageBucketService.BUCKET_NAME,
        fileEntity.map((item) => item.storageName),
      );

      this.logMxProvider.logNoMetadata(
        `File delete success: ${fileEntity.length} files [${options.storageName}]`,
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        `File delete error: ${error?.message ?? 'Unknown error'}`,
      );

      throw CommonError.createByErrorCode(
        GlbCoreMinioError.MINIO_FILE_DELETE_ERROR,
      );
    }
  }
}
