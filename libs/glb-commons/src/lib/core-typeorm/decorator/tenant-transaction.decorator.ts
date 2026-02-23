/* eslint-disable @typescript-eslint/no-explicit-any */

// [ADD] 이미 래핑 여부를 표시할 전역 심볼과 메타데이터 사용
import 'reflect-metadata';

import { runInTransaction } from 'typeorm-transactional';
import {
  ITenantTransactionContext,
  TX_MARK,
} from '../utils/tenant-transaction-context.utils';

export function TenantTransactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // [ADD] 이미 트랜잭션으로 감싸진 메서드라면 중복 래핑 방지
    if ((originalMethod as any)?.[TX_MARK]) {
      return descriptor;
    }

    descriptor.value = async function (...options: any[]) {
      // 첫 번째 파라미터가 ITenantTransactionContext 타입인지 확인
      let ctx = options[0] as ITenantTransactionContext;
      if (!ctx?.tenantCode) {
        // 만약 아니라면 모든 인자에서 ITenantTransactionContext 형식을 찾아서 사용
        ctx = options.find(
          (arg: any) => !!arg?.dataSource && !!arg?.tenantCode,
        );

        // 만약 여전히 없다면 에러 발생
        if (!ctx?.tenantCode) {
          throw new Error(
            'TenantTransactionContext is required as first parameter',
          );
        }
      }

      // runInTransaction으로 감싸서 실행
      return await runInTransaction(
        async () => {
          return await originalMethod.apply(this, options);
        },
        { connectionName: ctx.tenantCode },
      );
    };

    // [ADD] 현재 메서드가 트랜잭션으로 래핑되었음을 표시
    (descriptor.value as any)[TX_MARK] = true;

    return descriptor;
  };
}
