import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RnDefaultRootUserEntity } from '../../entity/default/rn-default-user.mysql-entity';
import { RnBaseRepository } from '../base/rn-base.base-repository';

/**
 * 기본 사용자 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Injectable()
export class RnDefaultRootUserRepository extends RnBaseRepository<RnDefaultRootUserEntity> {
  constructor(
    @InjectRepository(RnDefaultRootUserEntity)
    repository: Repository<RnDefaultRootUserEntity>
  ) {
    super(repository);
  }
}
