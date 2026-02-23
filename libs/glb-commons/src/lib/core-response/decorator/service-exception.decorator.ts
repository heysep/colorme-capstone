/* eslint-disable @typescript-eslint/no-explicit-any */
import { runInTransaction } from 'typeorm-transactional';
import {
  ITenantTransactionContext,
  TX_MARK,
} from '../../core-typeorm/utils/tenant-transaction-context.utils';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { ICommonErrorCode } from '../utils/common-error-code.util';
import { CommonError } from '../utils/common-error.util';

// 예외 처리 메타데이터 인터페이스
export interface ServiceExceptionMetadata {
  errorCode: ICommonErrorCode;
  logMessage?: string;
}

/**
 * 서비스 메서드의 예외를 자동으로 처리하는 데코레이터
 * 단, 이 데코레이터는 LogMxProvider 인스턴스가 있어야 합니다. (로컬 변수 이름: logMxProvider)
 * @param metadata 예외 처리 메타데이터
 */
export function ServiceException(metadata: ServiceExceptionMetadata) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...options: any[]) {
      try {
        // 현재 타겟 메서드(=이미 다른 데코레이터가 감싸고 있을 수 있음)
        const maybeTxWrapped = (originalMethod as any)[TX_MARK] === true;

        if (maybeTxWrapped === true) {
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
        }

        return await originalMethod.apply(this, options);
      } catch (error: any) {
        if (error instanceof CommonError) {
          throw error;
        }

        // LogMxProvider 인스턴스 가져오기
        const logger: LogMxProvider = (this as any)?.logMxProvider;

        // 로그 메시지 생성
        const logMessage =
          metadata.logMessage ||
          `Error in ${target.constructor.name}.${propertyKey}: ${
            error?.message || JSON.stringify(error)
          }`;

        // 로그 기록
        if (logger) {
          await logger.error(logMessage, {
            method: propertyKey,
            resultCode: metadata.errorCode.code,
          });
        }

        // 커스텀 예외로 변환하여 throw
        throw CommonError.createByErrorCode(
          metadata.errorCode,
          error?.message || JSON.stringify(error),
        );
      }
    };

    return descriptor;
  };
}
