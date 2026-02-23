import { Repository } from 'typeorm';
import { RnBaseBaseMysqlEntity } from '../../entity/base/rn-base.base-mysql-entity';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';
import { ClassType } from '@dataui/crud-util';
import { createInLimitRepositoryProxy } from './utils/repository-in-limit.proxy';

/**
 * 테넌트 기본 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-03
 */
export class RnBaseTenantRepository<T extends RnBaseBaseMysqlEntity> {
  /**
   * 리포지토리 인스턴스
   */
  repository(
    ctx: ITenantTransactionContext,
    entity: ClassType<T>
  ): Repository<T> {
    const base = ctx.dataSource.getRepository<T>(entity);
    // find 계열 보호용 Proxy 부착
    return createInLimitRepositoryProxy<T>(
      base,
      parseInt(process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000')
    );
  }
}
