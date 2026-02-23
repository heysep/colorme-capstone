/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// repository-in-limit.proxy.ts
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { RnBaseBaseMysqlEntity } from '../../../entity/base/rn-base.base-mysql-entity';
import { CommonError } from '../../../../core-response/utils/common-error.util';
import { GlbCoreTypeOrmError } from '../../../error/tenant/tenant-error.error';

function checkWhereObject(where: any, limit: number) {
  if (!where || typeof where !== 'object') return;

  // FindOperator 탐지: _type === 'in' && _value: any[]
  // (TypeORM 내부 구조를 이용하므로 마이너 업데이트에서 바뀔 수 있지만 0.3.x에서는 안정적)
  for (const [k, v] of Object.entries(where)) {
    if (!v) continue;

    if (typeof v === 'object' && (v as any)._type === 'in') {
      const arr = (v as any)._value;
      if (Array.isArray(arr) && arr.length > limit) {
        throw CommonError.createByErrorCode(
          GlbCoreTypeOrmError.PROXY_REPOSITORY_IN_LIMIT_ERROR
        );
      }
    } else if (Array.isArray(v)) {
      // where: [{ id: In([...]) }, { ... }] 같은 형태
      for (const item of v) checkWhereObject(item, limit);
    } else if (typeof v === 'object') {
      checkWhereObject(v, limit);
    }
  }
}

function checkFindManyOptions<T>(
  options: FindManyOptions<T> | undefined,
  limit: number
) {
  if (!options) return;
  const w = options.where as any;
  if (Array.isArray(w)) w.forEach((x) => checkWhereObject(x, limit));
  else checkWhereObject(w, limit);
}

function checkFindOneOptions<T>(
  options: FindOneOptions<T> | undefined,
  limit: number
) {
  if (!options) return;
  checkWhereObject(options.where as any, limit);
}

function checkWhere<T>(
  where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined,
  limit: number
) {
  if (!where) return;
  if (Array.isArray(where)) where.forEach((x) => checkWhereObject(x, limit));
  else checkWhereObject(where, limit);
}

// Proxy 생성기
export function createInLimitRepositoryProxy<T extends RnBaseBaseMysqlEntity>(
  repo: Repository<T>,
  limit = 1000
): Repository<T> {
  const handler: ProxyHandler<Repository<T>> = {
    get(target, prop, receiver) {
      const orig = (target as any)[prop];

      // find 계열 메서드만 가로채 검사
      if (prop === 'find') {
        return (options?: FindManyOptions<T>) => {
          checkFindManyOptions(options, limit);
          return orig.call(target, options);
        };
      }
      if (prop === 'findBy') {
        return (where: any) => {
          checkWhere(where, limit);
          return orig.call(target, where);
        };
      }
      if (prop === 'findOne') {
        return (options?: FindOneOptions<T>) => {
          checkFindOneOptions(options, limit);
          return orig.call(target, options);
        };
      }
      if (prop === 'findOneBy') {
        return (where: any) => {
          checkWhere(where, limit);
          return orig.call(target, where);
        };
      }
      if (prop === 'findAndCount') {
        return (options?: FindManyOptions<T>) => {
          checkFindManyOptions(options, limit);
          return orig.call(target, options);
        };
      }
      if (prop === 'count' || prop === 'countBy') {
        return (arg?: any) => {
          // count/countBy도 동일 규칙 적용
          if (prop === 'count') checkFindManyOptions(arg, limit);
          else checkWhere(arg, limit);
          return orig.call(target, arg);
        };
      }

      // createQueryBuilder는 그대로 반환
      return typeof orig === 'function'
        ? orig.bind(target)
        : Reflect.get(target, prop, receiver);
    },
  };
  return new Proxy<Repository<T>>(repo, handler);
}
