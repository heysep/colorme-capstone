import { ICommonErrorCode } from '@capstone-project/glb-commons';
import { HttpStatus } from '@nestjs/common';

export const PersonalColorError = {
  SESSION_TOKEN_REQUIRED: {
    code: 'PC_SESSION_TOKEN_REQUIRED',
    message: '세션 토큰이 필요합니다.',
    detail: '세션 토큰이 필요합니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  SESSION_NOT_FOUND: {
    code: 'PC_SESSION_NOT_FOUND',
    message: '유효한 세션을 찾을 수 없습니다.',
    detail: '유효한 세션을 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  } as ICommonErrorCode,
  INVALID_IMAGE_FILE: {
    code: 'PC_INVALID_IMAGE_FILE',
    message: '이미지 파일만 업로드할 수 있습니다.',
    detail: '이미지 파일만 업로드할 수 있습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  ANALYSIS_NOT_FOUND: {
    code: 'PC_ANALYSIS_NOT_FOUND',
    message: '진단 결과를 찾을 수 없습니다.',
    detail: '진단 결과를 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  } as ICommonErrorCode,
  ANALYSIS_ACCESS_DENIED: {
    code: 'PC_ANALYSIS_ACCESS_DENIED',
    message: '진단 결과에 접근할 수 없습니다.',
    detail: '진단 결과에 접근할 수 없습니다.',
    status: HttpStatus.FORBIDDEN,
  } as ICommonErrorCode,
  ANALYSIS_NOT_COMPLETED: {
    code: 'PC_ANALYSIS_NOT_COMPLETED',
    message: '진단이 아직 완료되지 않았습니다.',
    detail: '진단이 아직 완료되지 않았습니다.',
    status: HttpStatus.BAD_REQUEST,
  } as ICommonErrorCode,
  CATALOG_ITEM_NOT_FOUND: {
    code: 'PC_CATALOG_ITEM_NOT_FOUND',
    message: '카탈로그 아이템을 찾을 수 없습니다.',
    detail: '카탈로그 아이템을 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  } as ICommonErrorCode,
  LOOK_NOT_FOUND: {
    code: 'PC_LOOK_NOT_FOUND',
    message: '가상 피팅 결과를 찾을 수 없습니다.',
    detail: '가상 피팅 결과를 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  } as ICommonErrorCode,
  LOOK_ACCESS_DENIED: {
    code: 'PC_LOOK_ACCESS_DENIED',
    message: '가상 피팅 결과에 접근할 수 없습니다.',
    detail: '가상 피팅 결과에 접근할 수 없습니다.',
    status: HttpStatus.FORBIDDEN,
  } as ICommonErrorCode,
  SHARE_NOT_FOUND: {
    code: 'PC_SHARE_NOT_FOUND',
    message: '공유된 룩을 찾을 수 없습니다.',
    detail: '공유된 룩을 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  } as ICommonErrorCode,
  GEMINI_ANALYSIS_ERROR: {
    code: 'PC_GEMINI_ANALYSIS_ERROR',
    message: 'Gemini 분석 중 오류가 발생했습니다.',
    detail: 'Gemini 분석 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  GEMINI_ANALYSIS_INVALID_RESPONSE: {
    code: 'PC_GEMINI_ANALYSIS_INVALID_RESPONSE',
    message: 'Gemini 분석 응답을 해석할 수 없습니다.',
    detail: 'Gemini 분석 응답을 해석할 수 없습니다.',
    status: HttpStatus.BAD_GATEWAY,
  } as ICommonErrorCode,
  GEMINI_TRYON_ERROR: {
    code: 'PC_GEMINI_TRYON_ERROR',
    message: 'Gemini 가상 피팅 생성 중 오류가 발생했습니다.',
    detail: 'Gemini 가상 피팅 생성 중 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  } as ICommonErrorCode,
  AUTH_DUPLICATE_USER_ID: {
    code: 'PC_AUTH_DUPLICATE_USER_ID',
    message: '이미 가입된 이메일입니다.',
    detail: '이미 가입된 이메일입니다.',
    status: HttpStatus.CONFLICT,
  } as ICommonErrorCode,
  AUTH_ALREADY_REGISTERED: {
    code: 'PC_AUTH_ALREADY_REGISTERED',
    message: '이미 회원으로 등록된 세션입니다.',
    detail: '이미 회원으로 등록된 세션입니다.',
    status: HttpStatus.CONFLICT,
  } as ICommonErrorCode,
  AUTH_LOGIN_FAILED: {
    code: 'PC_AUTH_LOGIN_FAILED',
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
    status: HttpStatus.UNAUTHORIZED,
  } as ICommonErrorCode,
} as const;
