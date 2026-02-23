import { HttpStatus } from '@nestjs/common';
import { ICommonErrorCode } from '../../../core-response/utils/common-error-code.util';

export const GlbCoreTypeOrmError = {
  /**
   * 테넌트 연결 실패
   */
  TENANT_CONNECTION_FAILED: {
    code: 'GLB_CORE_TYPEORM_TENANT_CONNECTION_FAILED',
    message: '테넌트 연결에 실패했습니다.',
    detail: '테넌트 연결에 실패했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * 테넌트 코드가 올바르지 않음
   */
  TENANT_CODE_INVALID: {
    code: 'GLB_CORE_TYPEORM_TENANT_CODE_INVALID',
    message: '테넌트 코드가 올바르지 않습니다.',
    detail: '테넌트 코드가 올바르지 않습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * JSX_CRUD_BAD_REQUEST
   */
  JSX_CRUD_BAD_REQUEST: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_BAD_REQUEST',
    message: '잘못된 요청입니다.',
    detail: '잘못된 요청입니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * JSX_CRUD_NOT_FOUND
   */
  JSX_CRUD_NOT_FOUND: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_NOT_FOUND',
    message: '존재하지 않는 데이터입니다.',
    detail: '존재하지 않는 데이터입니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 여러 데이터 조회 오류
   */
  JSX_CRUD_GET_MANY_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_GET_MANY_UNK_ERROR',
    message:
      'JSX CRUD 여러 데이터를 조회하는 중 알 수 없는 오류가 발생했습니다.',
    detail:
      'JSX CRUD 여러 데이터를 조회하는 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 단일 데이터 조회 오류
   */
  JSX_CRUD_GET_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_GET_ONE_UNK_ERROR',
    message:
      'JSX CRUD 단일 데이터를 조회하는 중 알 수 없는 오류가 발생했습니다.',
    detail:
      'JSX CRUD 단일 데이터를 조회하는 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 생성 오류
   */
  JSX_CRUD_CREATE_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_CREATE_ONE_UNK_ERROR',
    message: 'JSX CRUD 생성 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 생성 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 여러 데이터 생성 오류
   */
  JSX_CRUD_CREATE_MANY_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_CREATE_MANY_UNK_ERROR',
    message: 'JSX CRUD 여러 데이터 생성 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 여러 데이터 생성 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 단일 데이터 수정 오류
   */
  JSX_CRUD_UPDATE_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_UPDATE_ONE_UNK_ERROR',
    message: 'JSX CRUD 단일 데이터 수정 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 단일 데이터 수정 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 여러 데이터 수정 오류
   */
  JSX_CRUD_UPDATE_MANY_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_UPDATE_MANY_UNK_ERROR',
    message: 'JSX CRUD 여러 데이터 수정 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 여러 데이터 수정 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 단일 데이터 복구 오류
   */
  JSX_CRUD_RECOVER_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_RECOVER_ONE_UNK_ERROR',
    message: 'JSX CRUD 단일 데이터 복구 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 단일 데이터 복구 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 단일 데이터 교체 오류
   */
  JSX_CRUD_REPLACE_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_REPLACE_ONE_UNK_ERROR',
    message: 'JSX CRUD 단일 데이터 교체 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 단일 데이터 교체 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 단일 데이터 삭제 오류
   */
  JSX_CRUD_DELETE_ONE_UNK_ERROR: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_DELETE_ONE_UNK_ERROR',
    message: 'JSX CRUD 단일 데이터 삭제 중 알 수 없는 오류가 발생했습니다.',
    detail: 'JSX CRUD 단일 데이터 삭제 중 알 수 없는 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  /**
   * JSX CRUD 여러 데이터 조회 오류
   */
  JSX_CRUD_GET_MANY_LIMIT_EXCEEDED: {
    code: 'GLB_CORE_TYPEORM_JSX_CRUD_GET_MANY_LIMIT_EXCEEDED',
    message: `JSX CRUD 여러 데이터를 조회하는 중 LIMIT 초과가 발생했습니다. (LIMIT에 설정 가능한 최대 값: ${
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000'
    })`,
    detail: `JSX CRUD 여러 데이터를 조회하는 중 LIMIT 초과가 발생했습니다. (LIMIT에 설정 가능한 최대 값: ${
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000'
    })`,
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  /**
   * Proxy Repository In Limit 오류
   */
  PROXY_REPOSITORY_IN_LIMIT_ERROR: {
    code: 'GLB_CORE_TYPEORM_PROXY_REPOSITORY_IN_LIMIT_ERROR',
    message: `Proxy Repository In Limit 오류가 발생했습니다. (LIMIT에 설정 가능한 최대 값: ${
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000'
    })`,
    detail: `Proxy Repository In Limit 오류가 발생했습니다. (LIMIT에 설정 가능한 최대 값: ${
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000'
    })`,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
} as const;
