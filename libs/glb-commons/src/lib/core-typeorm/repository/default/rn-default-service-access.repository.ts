import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RnBaseRepository } from '../base/rn-base.base-repository';
import { RnDefaultServiceAccessEntity } from '../../entity/default/rn-default-service-access.mysql-entity';

/**
 * 서비스 접근 제한 정보 설정 리포지토리
 *
 * @author 최시훈
 * @since 2025-10-01
 */
@Injectable()
export class RnDefaultServiceAccessRepository extends RnBaseRepository<RnDefaultServiceAccessEntity> {
  constructor(
    @InjectRepository(RnDefaultServiceAccessEntity)
    repository: Repository<RnDefaultServiceAccessEntity>,
  ) {
    super(repository);
  }
}
