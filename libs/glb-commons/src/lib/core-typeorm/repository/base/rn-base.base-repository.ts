import { Repository } from 'typeorm';
import { RnBaseBaseMysqlEntity } from '../../entity/base/rn-base.base-mysql-entity';
/**
 * 기본 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-02
 */
export class RnBaseRepository<T extends RnBaseBaseMysqlEntity> {
  constructor(private readonly _repository: Repository<T>) {}

  /**
   * 리포지토리 인스턴스
   */
  get repository(): Repository<T> {
    return this._repository;
  }
}
