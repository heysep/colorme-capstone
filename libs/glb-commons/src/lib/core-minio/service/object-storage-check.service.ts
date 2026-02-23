/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceException } from '../../core-response/decorator/service-exception.decorator';
import { CommonError } from '../../core-response/utils/common-error.util';
import {
  RnDefaultUploadFileEntity,
  UploadFileStatus,
} from '../../core-typeorm/entity/default/rn-default-upload-file.mysql-entity';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { GlbCoreMinioError } from '../error/minio-error.error';

export enum ObjectStorageCheckResult {
  FILE_EXISTS = 'FILE_EXISTS',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_STATUS_ERROR = 'FILE_STATUS_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class ObjectStorageCheckService {
  constructor(
    // -------------
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    // -------------
    public readonly logMxProvider: LogMxProvider,
  ) {}

  /**
   * 파일 엔티티 조회
   *
   * @param options 파일 엔티티 조회 요청 데이터
   * @returns 파일 엔티티
   */
  @ServiceException({
    errorCode: GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
  })
  public async getFileEntity(options: {
    storageName: string;
  }): Promise<IDefaultOutputDto<RnDefaultUploadFileEntity>> {
    const file = await this.uploadFileRepository.findOne({
      where: { storageName: options.storageName },
    });

    if (!file) {
      throw GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR;
    }

    return IDefaultOutputDto.success(file);
  }

  /**
   * 파일 엔티티 목록 조회
   *
   * @param options 파일 엔티티 목록 조회 요청 데이터
   * @returns 파일 엔티티 목록
   */
  @ServiceException({
    errorCode: GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
  })
  public async getFileEntityList(options: {
    storageName: string[];
  }): Promise<IDefaultOutputDto<RnDefaultUploadFileEntity[]>> {
    const fileList = await this.uploadFileRepository.find({
      where: { storageName: In(options.storageName) },
    });

    if (!fileList) {
      throw GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR;
    }

    return IDefaultOutputDto.success(fileList);
  }

  /**
   * 파일 존재 여부 확인
   *
   * @param options 파일 존재 여부 확인 요청 데이터
   * @returns 파일 존재 여부 확인 결과
   */
  @ServiceException({
    errorCode: GlbCoreMinioError.MINIO_FILE_NOT_FOUND_ERROR,
  })
  public async checkFile(options: {
    storageName: string;
  }): Promise<IDefaultOutputDto<ObjectStorageCheckResult>> {
    try {
      const file = await this.uploadFileRepository.findOne({
        where: {
          storageName: options.storageName,
        },
      });

      if (!file) {
        return IDefaultOutputDto.success(
          ObjectStorageCheckResult.FILE_NOT_FOUND,
        );
      }

      if (file?.status === UploadFileStatus.INACTIVE) {
        return IDefaultOutputDto.success(
          ObjectStorageCheckResult.FILE_STATUS_ERROR,
        );
      }

      return IDefaultOutputDto.success(ObjectStorageCheckResult.FILE_EXISTS);
    } catch (error: any) {
      if (error instanceof CommonError) {
        throw error;
      }

      this.logMxProvider.errorNoMetadata(
        `파일 존재 여부 확인 오류: ${error?.message}`,
      );

      return IDefaultOutputDto.success(ObjectStorageCheckResult.UNKNOWN_ERROR);
    }
  }
}
