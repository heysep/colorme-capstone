import { HttpStatus } from '@nestjs/common';
import { ICommonErrorCode } from '../../core-response/utils/common-error-code.util';

export const GlbCoreMinioError = {
  /**
   * 버킷 생성 오류
   */
  BUCKET_CREATE_ERROR: {
    code: 'GLB_CORE_MINIO_BUCKET_CREATE_ERROR',
    message: '버킷 생성에 실패했습니다.',
    detail: '버킷 생성에 실패했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 파일 업로드 오류
   */
  MINIO_UPLOAD_ERROR: {
    code: 'GLB_CORE_MINIO_UPLOAD_ERROR',
    message: '파일 업로드에 실패했습니다.',
    detail: '파일 업로드에 실패했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 파일 크기 초과
   */
  MINIO_FILE_SIZE_OVER_ERROR: {
    code: 'GLB_CORE_MINIO_FILE_SIZE_OVER_ERROR',
    message: '파일 크기가 초과되었습니다.',
    detail: '파일 크기가 초과되었습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 파일 존재하지 않음
   */
  MINIO_FILE_NOT_FOUND_ERROR: {
    code: 'GLB_CORE_MINIO_FILE_NOT_FOUND_ERROR',
    message: '파일이 존재하지 않습니다.',
    detail: '파일이 존재하지 않습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 파일 다운로드 오류
   */
  MINIO_FILE_DOWNLOAD_ERROR: {
    code: 'GLB_CORE_MINIO_FILE_DOWNLOAD_ERROR',
    message: '파일 다운로드에 실패했습니다.',
    detail: '파일 다운로드에 실패했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 파일 삭제 오류
   */
  MINIO_FILE_DELETE_ERROR: {
    code: 'GLB_CORE_MINIO_FILE_DELETE_ERROR',
    message: '파일 삭제에 실패했습니다.',
    detail: '파일 삭제에 실패했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
} as const;
