import { HttpStatus } from '@nestjs/common';
import { ICommonErrorCode } from '../../core-response/utils/common-error-code.util';

export const UtilsServiceAccessError = {
  PERMISSION_DENIED_ERROR: {
    code: 'ACCESSPERMISSION_DENIED_ERROR',
    message: '권한이 없습니다.',
    detail: '권한이 없습니다.',
    status: HttpStatus.FORBIDDEN,
  } as ICommonErrorCode,
} as const;
