import { FindOptionsOrder } from 'typeorm';

export const RN_DATABASE_SUBMYSQL_CONNECTION_NAME = 'rn-database-submysql';
// 테넌트 연결 상태 확인 전용 테넌트 코드
export const TENANT_CONNECTION_TEST_TENANT_CODE = 'bktzkkhojvi1tksd';

export function pageNationOptions<T>({
  page,
  limit,
  order,
}: {
  page: number;
  limit: number;
  order?: FindOptionsOrder<T>;
}): { take: number; skip: number; order?: FindOptionsOrder<T> } {
  return {
    take: limit,
    skip: (page - 1) * limit,
    order: order || undefined,
  };
}
