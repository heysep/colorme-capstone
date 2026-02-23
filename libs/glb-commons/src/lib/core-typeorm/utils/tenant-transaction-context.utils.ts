import { DataSource } from 'typeorm';

export const TX_MARK = Symbol.for('tenant.tx.applied');

/**
 * 테넌트 코드에서 RR 번호를 제거하고 반환
 *
 * @param tenantCode 테넌트 코드
 * @returns 테넌트 코드에서 RR 번호를 제거한 테넌트 코드
 */
export function removeTenantCodeRRNumber(tenantCode: string): string {
  // <테넌트 코드>#RR#1, <테넌트 코드>#RR#2, <테넌트 코드>#RR#3 이런 형식으로 되어있음
  // 만약 '#RR#' 문자열을 포함하고 있고 가장 마지막 '#RR#' 문자 뒤에 숫자가 있으면 그 숫자를 제거하고 반환
  const lastDashIndex = tenantCode.lastIndexOf('#RR#');
  if (lastDashIndex !== -1) {
    return tenantCode.slice(0, lastDashIndex);
  }
  return tenantCode;
}

export interface ITenantTransactionContext {
  tenantCode: string;
  dataSource: DataSource;
}
