/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {
  REDIS_CACHE_KEY,
  REDIS_CACHE_TTL_KEY,
} from '../decorator/redis-cache.decorator';
import { GlbRedisCoreService } from '../service/redis-root.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RedisCacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: GlbRedisCoreService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const type = context.getType<'http' | 'rpc' | 'ws'>();
    if (type !== 'http') {
      return next.handle();
    }

    const isCached = this.reflector.get<boolean>(
      REDIS_CACHE_KEY,
      context.getHandler(),
    );
    if (!isCached) {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      REDIS_CACHE_TTL_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const rawTenantCode = request.headers['x-tenant-code'] || 'root';
    const tenantCode = String(rawTenantCode).replace(/[^a-zA-Z0-9_-]/g, '');
    const url = new URL(request.url, 'http://localhost');
    url.searchParams.sort();
    const cacheKey = `cache:${tenantCode}:${url.pathname}?${url.searchParams.toString()}`;
    const cachedData = await this.redisService.getRedis().get(cacheKey);

    if (cachedData) {
      this.logger.log('RedisCacheInterceptor.intercept cache hit!!');

      return new Observable((subscriber) => {
        subscriber.next(JSON.parse(cachedData));
        subscriber.complete();
      });
    }

    return new Observable((subscriber) => {
      next.handle().subscribe({
        next: async (data) => {
          await this.redisService
            .getRedis()
            .setex(cacheKey, ttl || 60, JSON.stringify(data));
          subscriber.next(data);
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        },
      });
    });
  }
}
