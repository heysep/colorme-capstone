import { ICommonErrorCode } from '@capstone-project/glb-commons';
import { HttpStatus } from '@nestjs/common';

export const CbizTenantSlimiterError = {
  /**
   * 테넌트 저장소 용량 제한 초과 오류
   */
  TENANT_STORAGE_LIMIT_EXCEEDED: {
    code: 'CBIZ_TENANT_SLIMITER_STORAGE_LIMIT_EXCEEDED',
    message:
      'DB 또는 파일 저장소 용량 제한을 초과하여 POST/PATCH 요청이 거부되었습니다.',
    detail:
      'DB 또는 파일 저장소 용량 제한을 초과하여 POST/PATCH 요청이 거부되었습니다.',
    status: HttpStatus.FORBIDDEN,
  } as ICommonErrorCode,
} as const;
