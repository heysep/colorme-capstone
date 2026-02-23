import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RnBaseRepository } from '../base/rn-base.base-repository';
import { RnDefaultAdminUserEntity } from '../../entity/default/rn-default-admin-user.mysql-entity';

/**
 * 기본 관리자 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Injectable()
export class RnDefaultRootAdminUserRepository extends RnBaseRepository<RnDefaultAdminUserEntity> {
  constructor(
    @InjectRepository(RnDefaultAdminUserEntity)
    repository: Repository<RnDefaultAdminUserEntity>
  ) {
    super(repository);
  }
}
