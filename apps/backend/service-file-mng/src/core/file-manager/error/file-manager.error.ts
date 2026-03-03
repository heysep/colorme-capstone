import { ICommonErrorCode } from '@capstone-project/glb-commons';
import { HttpStatus } from '@nestjs/common';

export const GlbFileManagerError = {
  /**
   * 파일 다운로드 중 오류가 발생했습니다.
   */
  FILE_DOWNLOAD_ERROR: {
    code: 'FILE_DOWNLOAD_ERROR',
    message: '파일 다운로드 중 오류가 발생했습니다.',
    detail: '파일 다운로드 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 파일 업로드 중 오류가 발생했습니다.
   */
  FILE_UPLOAD_ERROR: {
    code: 'FILE_UPLOAD_ERROR',
    message: '파일 업로드 중 오류가 발생했습니다.',
    detail: '파일 업로드 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
};
