/* eslint-disable @typescript-eslint/no-explicit-any */

import { SetMetadata } from '@nestjs/common';
export const REDIS_CACHE_KEY = 'REDIS_CACHE_KEY';
export const REDIS_CACHE_TTL_KEY = 'REDIS_CACHE_TTL_KEY';

export interface RedisCacheOptions {
  ttl?: number;
}

export function RedisCache(options: RedisCacheOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(REDIS_CACHE_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(REDIS_CACHE_TTL_KEY, options.ttl)(
      target,
      propertyKey,
      descriptor
    );
  };
}
