import { UploaderType } from './../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  RnDefaultUploadFileEntity,
  UploadFileStatus,
  UploadFileStorageType,
} from '../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';

import { createReadStream, readFileSync, statSync } from 'fs';
import { GlbRedisCoreService } from '../../core-redis/service/redis-root.service';
import {
  REDIS_KEY,
  RedisKeyNameManager,
} from '../../core-redis/utils/redis-key-name-manager.utils';
import { CommonError } from '../../core-response/utils/common-error.util';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbCoreMinioError } from '../error/minio-error.error';
import { ObjectStorageBucketService } from './object-storage-bucket.service';

@Injectable()
export class ObjectStorageUploadService {
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
   * 파일 확장자에서 MIME 타입을 추출하는 헬퍼 메서드
   *
   * @param fileExtension 파일 확장자
   * @returns MIME 타입
   */
  private getMimeTypeFromExtension(fileExtension: string): string {
    const ext = fileExtension.toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      // 이미지 파일
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      tif: 'image/tiff',
      ico: 'image/x-icon',

      // 압축 파일
      zip: 'application/zip',

      // 문서 파일
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',

      // 텍스트 파일
      txt: 'text/plain',
      html: 'text/html',
      xml: 'application/xml',
      json: 'application/json',

      // 오디오/비디오 파일
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      wmv: 'video/x-ms-wmv',
      webm: 'video/webm',
      ogg: 'video/ogg',
      flv: 'video/x-flv',
    };

    return mimeTypeMap[ext] || 'application/octet-stream';
  }

  convertLocalFileToMulterFile(
    filePath: string,
    fileNameInput?: string,
  ): Express.Multer.File {
    // 파일의 내용을 읽습니다.
    const buffer = readFileSync(filePath);
    // 파일 정보를 가져옵니다.
    const stats = statSync(filePath);
    // 파일 이름을 추출합니다.
    const fileName = fileNameInput ?? filePath.split('/').pop() ?? 'file';

    // 파일 타입 추출
    let fileType = 'application/octet-stream';
    if (fileName) {
      // 확장자로 파일 타입 추출
      const fileExtension = fileName.split('.').pop();
      if (fileExtension) {
        fileType = this.getMimeTypeFromExtension(fileExtension);
      } else {
        fileType = 'application/octet-stream';
      }
    }

    // Express.Multer.File 객체를 생성합니다.
    return {
      fieldname: 'file', // 실제 사용에 맞게 변경 가능
      originalname: fileName,
      encoding: '7bit', // 필요에 따라 실제 인코딩 방식으로 조정
      mimetype: fileType,
      size: stats.size,
      destination: '', // DiskStorage 사용 시 실제 저장 경로 입력
      filename: fileName,
      path: filePath,
      buffer,
      stream: createReadStream(filePath),
    };
  }

  /**
   * 파일 크기 체크
   *
   * @param fileSize 파일 크기
   * @returns 파일 크기 체크 결과
   */
  private checkMaxFileSize(fileSize: number): boolean {
    return fileSize <= 50 * 1024 * 1024; // 50MB
  }

  /**
   * 지연 업로드 파일 크기 체크
   *
   * @param fileSize 파일 크기
   * @returns 파일 크기 체크 결과
   */
  private checkMaxDelayedFileSize(fileSize: number): boolean {
    return fileSize <= 5 * 1024 * 1024; // 5MB
  }

  /**
   * 랜덤 파일 키 생성
   *
   * @returns 랜덤 파일 키
   */
  public randomFileKeyGenerate(): string {
    // UUID와 현재 시간을 조합하여 파일 키 생성
    return `sihun.server.${uuidv4()}_${new Date().getTime()}`;
  }

  /**
   * 지연 업로드용 랜덤 파일 키 생성
   *
   * @returns 지연 업로드용 랜덤 파일 키
   */
  public randomDelayedFileKeyGenerate(): string {
    // UUID와 현재 시간을 조합하여 지연 업로드용 파일 키 생성
    return `dly_sihun.server.${uuidv4()}_${new Date().getTime()}`;
  }

  /**
   * 파일 업로드
   *
   * @param file 업로드할 파일
   * @returns 업로드된 파일 정보
   */
  public async uploadFile(options: {
    file: Express.Multer.File;
    fileName: string;
    uploader: string;
    uploaderDetail: string;
    isTenantUser: boolean;
    uploaderIp: string;
    description?: string;
    index?: number | null;
  }): Promise<
    IDefaultOutputDto<{
      originUploadResult: {
        eTag: string;
        versionId: string;
      };
      uploadEntityResult: RnDefaultUploadFileEntity;
      index?: number | null;
    }>
  > {
    try {
      // 버킷 존재 여부 확인 및 버킷 생성
      await this.objectStorageBucketService.checkAndCreateBucket();

      // 파일 크기 체크
      if (!this.checkMaxFileSize(options?.file?.size ?? 0)) {
        throw CommonError.createByErrorCode(
          GlbCoreMinioError.MINIO_FILE_SIZE_OVER_ERROR,
        );
      }

      const utf8FileName = Buffer.from(
        options?.file?.originalname,
        'latin1',
      ).toString('utf8');

      // 파일 타입 추출
      let fileType = options?.file?.mimetype;
      if (!fileType) {
        // 확장자로 파일 타입 추출
        const fileExtension = utf8FileName.split('.').pop();
        if (fileExtension) {
          fileType = this.getMimeTypeFromExtension(fileExtension);
        } else {
          fileType = 'application/octet-stream';
        }
      }

      // 파일 업로드
      const uploadResult = await this.minioClient.putObject(
        ObjectStorageBucketService.BUCKET_NAME,
        options.fileName,
        options.file.buffer,
        options?.file?.size ?? 0,
        {
          'Content-Type': fileType,
        },
      );

      // 파일 업로드 데이터 삽입
      const uploadResultEntity = await this.uploadFileRepository.save({
        storageType: UploadFileStorageType.MINIO,
        size: options?.file?.size ?? 0,
        status: UploadFileStatus.ACTIVE,
        originalName: utf8FileName ?? 'UNKNOWN',
        storageName: options.fileName,
        uploaderType: options?.isTenantUser
          ? UploaderType.TENANT_USER
          : UploaderType.ROOT_USER,
        uploaderDetail: options?.uploaderDetail ?? 'UNKNOWN',
        uploaderId: options?.uploader ?? 'UNKNOWN',
        uploadIp: options?.uploaderIp ?? 'UNKNOWN',
        type: fileType ?? 'UNKNOWN',
        description: options?.description ?? 'UNKNOWN',
      });

      this.logMxProvider.logNoMetadata(
        `File upload success: ${uploadResultEntity.id}`,
      );

      return IDefaultOutputDto.success(
        {
          originUploadResult: {
            eTag: uploadResult?.etag ?? 'UNKNOWN',
            versionId: uploadResult?.versionId ?? 'UNKNOWN',
          },
          uploadEntityResult: uploadResultEntity,
          outputKey:
            options?.index !== null &&
            options?.index !== undefined &&
            !isNaN(options?.index)
              ? options?.index
              : null,
        },
        '파일 업로드 성공!',
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        error?.message ??
          `File upload failed ${error?.message ?? JSON.stringify(error)}`,
      );

      throw CommonError.createByErrorCode(GlbCoreMinioError.MINIO_UPLOAD_ERROR);
    }
  }

  /**
   * 지연 업로드 파일 (Redis에 임시 저장)
   *
   * @param options 지연 업로드 파라미터
   * @returns 지연 업로드 결과
   */
  public async delayedUploadFile(options: {
    fileBuffer: Buffer;
    originalName: string;
    mimetype: string;
    fileName: string;
    uploader: string;
    uploaderDetail: string;
    isTenantUser: boolean;
    uploaderIp: string;
    description?: string;
  }): Promise<
    IDefaultOutputDto<{
      uploadEntityResult: RnDefaultUploadFileEntity;
    }>
  > {
    try {
      // 파일 크기 체크
      if (!this.checkMaxDelayedFileSize(options.fileBuffer.length)) {
        throw CommonError.createByErrorCode(
          GlbCoreMinioError.MINIO_FILE_SIZE_OVER_ERROR,
        );
      }

      // Redis에 저장할 데이터 구성
      const delayedFileData = {
        fileBuffer: options.fileBuffer.toString('base64'),
        originalName: options.originalName,
        mimetype: options.mimetype,
        size: options.fileBuffer.length,
        uploader: options.uploader,
        uploaderDetail: options.uploaderDetail,
        isTenantUser: options.isTenantUser,
        uploaderIp: options.uploaderIp,
        description: options.description ?? 'UNKNOWN',
      };

      // Redis 키 생성
      const redisKey = RedisKeyNameManager.getRedisKeyName(
        REDIS_KEY.DELAYED_UPLOAD_FILE,
        options.fileName,
      );

      // Redis에 데이터 저장 (TTL 5분)
      const redis = this.glbRedisCoreService.getRedis();
      await redis.setex(redisKey, 300, JSON.stringify(delayedFileData));

      // 파일 업로드 데이터 삽입 (지연 상태)
      const uploadResultEntity = await this.uploadFileRepository.save({
        storageType: UploadFileStorageType.MINIO,
        size: options.fileBuffer.length,
        status: UploadFileStatus.DELAYED,
        originalName: options.originalName,
        storageName: options.fileName,
        uploaderType: options.isTenantUser
          ? UploaderType.TENANT_USER
          : UploaderType.ROOT_USER,
        uploaderDetail: options.uploaderDetail,
        uploaderId: options.uploader,
        uploadIp: options.uploaderIp,
        type: options.mimetype,
        description: options.description ?? 'UNKNOWN',
      });

      this.logMxProvider.logNoMetadata(
        `Delayed file upload success: ${uploadResultEntity.id}`,
      );

      return IDefaultOutputDto.success(
        {
          uploadEntityResult: uploadResultEntity,
        },
        '지연 업로드 성공!',
      );
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        error?.message ??
          `Delayed file upload failed ${
            error?.message ?? JSON.stringify(error)
          }`,
      );

      throw CommonError.createByErrorCode(GlbCoreMinioError.MINIO_UPLOAD_ERROR);
    }
  }
}
