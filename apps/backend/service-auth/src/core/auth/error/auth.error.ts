import { ICommonErrorCode } from '@drvalue-bmes-backend/glb-commons';
import { HttpStatus } from '@nestjs/common';

export const AuthError = {
  // 루트 사용자 아이디가 없습니다.
  ROOT_USER_ID_NOT_FOUND: {
    code: 'AUTH_ROOT_USER_ID_NOT_FOUND',
    message: '루트 사용자 아이디가 없습니다.',
    detail: '루트 사용자 아이디가 없습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  // 테넌트 사용자 아이디가 없습니다.
  TENANT_USER_ID_NOT_FOUND: {
    code: 'AUTH_TENANT_USER_ID_NOT_FOUND',
    message: '테넌트 사용자 아이디가 없습니다.',
    detail: '테넌트 사용자 아이디가 없습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
} as const;
