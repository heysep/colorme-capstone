import { SetMetadata } from '@nestjs/common';
import { REDIS_ERROR_LIST } from '../error/error-list.error';

import { createHash } from 'crypto';
import { CommonError } from '../../core-response/utils/common-error.util';
import { GlbRedisCoreService } from '../service/redis-root.service';

// CacheKey 데코레이터
export const RedisCacheKey = (key: string) => SetMetadata('cacheKey', key);

// CacheTTL 데코레이터
export const RedisCacheTTL = (ttl: number) => SetMetadata('cacheTTL', ttl);

// Cacheable 데코레이터 (캐싱 메인 로직)
export function RedisCacheable() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...options: any[]) {
      const redis: GlbRedisCoreService = (this as any)?.redisRootService; // Redis 클라이언트 접근
      if (
        !redis ||
        GlbRedisCoreService.CHECK_SUM_KEY !== redis.getCheckSumKey()
      ) {
        throw CommonError.createByErrorCode(REDIS_ERROR_LIST.REDIS_ERROR_001);
      }

      const cacheKey =
        Reflect.getMetadata('cacheKey', target, propertyKey) || propertyKey;
      const cacheTTL =
        Reflect.getMetadata('cacheTTL', target, propertyKey) || 60; // 기본 TTL 60초

      // 인자에 따라 다른 결과가 나올 수 있으므로 JSON.stringify()로 문자열로 변환하여 저장 SHA256 해시 생성 후 키 이름과 같이 저장
      const saveKey = `${cacheKey}:${createHash('sha256')
        .update(JSON.stringify(options))
        .digest('hex')}`;

      const cachedValue = await redis.getRedis().get(saveKey);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }

      // 캐시에 없을 경우 원래 메서드 실행
      const result = await originalMethod.apply(this, options);

      // 결과값을 Redis에 저장하고 TTL 설정
      await redis
        .getRedis()
        .set(saveKey, JSON.stringify(result), 'EX', cacheTTL);

      return result;
    };
  };
}
