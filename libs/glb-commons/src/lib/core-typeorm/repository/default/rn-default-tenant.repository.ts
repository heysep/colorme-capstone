import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlbOptionalValue } from '../../../utils-optional/utils-optional.util';
import { RnDefaultTenantEntity } from '../../entity/default/rn-default-tenant.mysql-entity';
import { RnBaseRepository } from '../base/rn-base.base-repository';

/**
 * 테넌트 기본 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Injectable()
export class RnDefaultTenantRepository extends RnBaseRepository<RnDefaultTenantEntity> {
  constructor(
    @InjectRepository(RnDefaultTenantEntity)
    repository: Repository<RnDefaultTenantEntity>,
  ) {
    super(repository);
  }

  /**
   * 테넌트 코드로 테넌트 조회
   *
   * @param code 테넌트 코드
   * @returns 테넌트
   */
  async findByCode(options: {
    code: string;
  }): Promise<GlbOptionalValue<RnDefaultTenantEntity | null>> {
    const { code } = options;
    const tenant = await this.repository.findOne({
      where: { code },
      withDeleted: false,
    });

    return GlbOptionalValue.of(tenant);
  }
}
