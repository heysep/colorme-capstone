/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { CommonError } from '../../core-response/utils/common-error.util';
import { GlbCoreMinioError } from '../error/minio-error.error';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';

@Injectable()
export class ObjectStorageBucketService {
  // 버킷 이름
  public static readonly BUCKET_NAME = 'sihun-bucket';

  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    private readonly logMxProvider: LogMxProvider
  ) {}

  /**
   * 버킷 존재 여부 확인 및 버킷 생성
   *
   * @param bucketName 버킷 이름
   */
  async checkAndCreateBucket() {
    try {
      const isBucketExists = await this.minioClient.bucketExists(
        ObjectStorageBucketService.BUCKET_NAME
      );

      if (!isBucketExists) {
        await this.minioClient.makeBucket(
          ObjectStorageBucketService.BUCKET_NAME,
          'ap-northeast-2'
        );
      }
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(`버킷 생성 오류: ${error?.message}`);

      throw CommonError.createByErrorCode(
        GlbCoreMinioError.BUCKET_CREATE_ERROR
      );
    }
  }
}
