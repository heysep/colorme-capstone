/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from 'crypto';
import { Request } from 'express';
import { TENANT_CODE_HEADER } from '../../core-typeorm/middleware/tenant.middleware';
import { ObjectType } from 'typeorm';

export class RedisCacheKeyUtils {
  public static generateCacheKey(
    req: Request,
    entity?: ObjectType<any>
  ): string {
    const hash = createHash('sha256');
    const tenantCode = (req.headers[TENANT_CODE_HEADER] as string) || 'root';

    // 캐시 키 생성에 사용할 데이터
    const cacheData = {
      tenantCode,
      url: req.originalUrl || req.url,
      query: req.query,
      headers: {
        [TENANT_CODE_HEADER]: tenantCode,
      },
      entity: entity
        ? {
            name: entity.name,
            tableName:
              (entity as any).prototype?.constructor?.name || entity.name,
          }
        : null,
    };

    // JSON 문자열로 변환하여 해시 생성
    hash.update(JSON.stringify(cacheData));
    const hashValue = hash.digest('hex');

    // 캐시 키 형식: CACHE:{tenantCode}:{entityName}:{hash}
    return `CACHE:${tenantCode}:${
      entity ? entity.name : 'default'
    }:${hashValue}`;
  }

  public static getTableCacheKey(
    tableName: string,
    tenantCode: string
  ): string {
    return `TABLE_CACHE:${tenantCode}:${tableName}`;
  }

  public static getTableCacheInvalidationKey(
    tableName: string,
    tenantCode: string
  ): string {
    return `TABLE_CACHE_INVALIDATION:${tenantCode}:${tableName}`;
  }

  public static getTenantCodeFromRequest(req: Request): string {
    return (req.headers[TENANT_CODE_HEADER] as string) || 'root';
  }
}
