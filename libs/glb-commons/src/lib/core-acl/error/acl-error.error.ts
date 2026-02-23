import { HttpStatus } from '@nestjs/common';
import { ICommonErrorCode } from '../../core-response/utils/common-error-code.util';

export const GlbCoreAclError = {
  /**
   * 알 수 없는 오류가 발생한 경우
   */
  LOGIN_FAILED_UNKNOWN_ERROR: {
    code: 'GLB_CORE_ACL_LOGIN_FAILED_UNKNOWN_ERROR',
    message: '로그인에 실패했습니다.',
    detail: '알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 아이디 또는 비밀번호가 올바르지 않은 경우
   */
  LOGIN_FAILED_ID_OR_PASSWORD_INVALID: {
    code: 'GLB_CORE_ACL_LOGIN_FAILED_ID_OR_PASSWORD_INVALID',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    detail: '아이디 또는 비밀번호가 올바르지 않습니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 사용자 조회 실패
   */
  FIND_USER_FAILED: {
    code: 'GLB_CORE_ACL_FIND_USER_FAILED',
    message: '사용자 조회에 실패했습니다.',
    detail: '사용자 조회에 실패했습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 사용자 인증 정보를 찾을 수 없습니다.
   */
  FIND_USER_JWT_RESPONSE_FAILED: {
    code: 'GLB_CORE_ACL_FIND_USER_JWT_RESPONSE_FAILED',
    message: '사용자 인증 정보를 찾을 수 없습니다.',
    detail: '사용자 인증 정보를 찾을 수 없습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 사용자 상태가 비활성화 상태인 경우
   */
  USER_SUSPENDED: {
    code: 'GLB_CORE_ACL_USER_SUSPENDED',
    message: '사용자 상태가 비활성화 상태입니다.',
    detail: '사용자 상태가 비활성화 상태입니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 사용자 상태가 삭제 상태인 경우
   */
  USER_DELETED: {
    code: 'GLB_CORE_ACL_USER_DELETED',
    message: '사용자 상태가 삭제 상태입니다.',
    detail: '사용자 상태가 삭제 상태입니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 사용자 상태가 비활성화 상태인 경우
   */
  USER_INACTIVE: {
    code: 'GLB_CORE_ACL_USER_INACTIVE',
    message: '사용자 상태가 비활성화 상태입니다.',
    detail: '사용자 상태가 비활성화 상태입니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 토큰이 유효하지 않습니다.
   */
  INVALID_TOKEN: {
    code: 'GLB_CORE_ACL_INVALID_TOKEN',
    message: '토큰이 유효하지 않습니다.',
    detail: '토큰이 유효하지 않습니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 인증 요청시 사용한 테넌트 코드와 사용자가 제출한 인증 정보의 테넌트 코드가 다릅니다.
   */
  INVALID_TOKEN_TENANT_CODE: {
    code: 'GLB_CORE_ACL_INVALID_TOKEN_TENANT_CODE',
    message:
      '인증 요청시 사용한 테넌트 코드와 사용자가 제출한 인증 정보의 테넌트 코드가 다릅니다.',
    detail:
      '인증 요청시 사용한 테넌트 코드와 사용자가 제출한 인증 정보의 테넌트 코드가 다릅니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 토큰이 만료되었습니다.
   */
  TOKEN_EXPIRED: {
    code: 'GLB_CORE_ACL_TOKEN_EXPIRED',
    message: '토큰이 만료되었습니다.',
    detail: '토큰이 만료되었습니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
  /**
   * 인증/인가 작업 처리 중 오류가 발생하였습니다.
   */
  AUTH_FAILED: {
    code: 'GLB_CORE_ACL_AUTH_FAILED',
    message: '인증/인가 작업 처리 중 오류가 발생했습니다.',
    detail: '인증/인가 작업 처리 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 잘못된 요청입니다, 해당 요청은 루트 테넌트에서만 사용할 수 있습니다.
   */
  ONLY_ROOT_REQUEST_ERROR: {
    code: 'GLB_CORE_ACL_ONLY_ROOT_REQUEST_ERROR',
    message:
      '잘못된 요청입니다, 해당 요청은 루트 테넌트에서만 사용할 수 있습니다.',
    detail:
      '잘못된 요청입니다, 해당 요청은 루트 테넌트에서만 사용할 수 있습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 잘못된 요청입니다, 해당 요청은 테넌트 테넌트에서만 사용할 수 있습니다.
   */
  ONLY_TENANT_REQUEST_ERROR: {
    code: 'GLB_CORE_ACL_ONLY_TENANT_REQUEST_ERROR',
    message:
      '잘못된 요청입니다, 해당 요청은 테넌트 테넌트에서만 사용할 수 있습니다.',
    detail:
      '잘못된 요청입니다, 해당 요청은 테넌트 테넌트에서만 사용할 수 있습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 권한을 조회하는 중 오류가 발생했습니다.
   */
  GET_PERMISSION_FAILED: {
    code: 'GLB_CORE_ACL_GET_PERMISSION_FAILED',
    message: '권한을 조회하는 중 오류가 발생했습니다.',
    detail: '권한을 조회하는 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 해당 역할에 대한 권한이 존재하지 않습니다.
   */
  NO_PERMISSION_FOR_ROLE: {
    code: 'GLB_CORE_ACL_NO_PERMISSION_FOR_ROLE',
    message: '해당 역할에 대한 권한이 존재하지 않습니다.',
    detail: '해당 역할에 대한 권한이 존재하지 않습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * 권한이 없습니다.
   */
  PERMISSION_DENIED_ERROR: {
    code: 'GLB_CORE_ACL_PERMISSION_DENIED_ERROR',
    message: '권한이 없습니다.',
    detail: '권한이 없습니다.',
    status: HttpStatus.FORBIDDEN,
  } as ICommonErrorCode,
  /**
   * 사용자가 외주처입니다. 외주처 사용자는 접근할 수 없습니다.
   */
  USER_IS_VENDER: {
    code: 'GLB_CORE_ACL_USER_IS_VENDER',
    message: '사용자가 외주처입니다. 외주처 사용자는 접근할 수 없습니다.',
    detail: '사용자가 외주처입니다. 외주처 사용자는 접근할 수 없습니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
} as const;
