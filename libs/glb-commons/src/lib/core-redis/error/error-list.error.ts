import { HttpStatus } from "@nestjs/common";

export const REDIS_ERROR_LIST = {
  REDIS_ERROR_001: {
    // Redis 서비스를 찾을 수 없습니다. 올바르게 Redis 모듈이 주입되었는지 확인해주세요.
    code: 'REDIS_ERROR_001',
    message: 'Cannot find the Redis service. Please check if the Redis module is injected correctly.',
    detail: 'Redis service is not found.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
