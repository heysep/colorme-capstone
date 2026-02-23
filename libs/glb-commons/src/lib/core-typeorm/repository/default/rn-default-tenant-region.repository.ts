import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlbOptionalValue } from '../../../utils-optional/utils-optional.util';
import { RnDefaultTenantRegionEntity } from '../../entity/default/rn-default-tenant-region.mysql-entity';
import { RnBaseRepository } from '../base/rn-base.base-repository';

/**
 * 테넌트 리전 리포지토리
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Injectable()
export class RnDefaultTenantRegionRepository extends RnBaseRepository<RnDefaultTenantRegionEntity> {
  constructor(
    @InjectRepository(RnDefaultTenantRegionEntity)
    repository: Repository<RnDefaultTenantRegionEntity>,
  ) {
    super(repository);
  }

  /**
   * 테넌트 리전 ID로 테넌트 리전 조회
   *
   * @param id 테넌트 리전 ID
   * @returns 테넌트 리전
   */
  async findById(options: {
    id: string;
  }): Promise<GlbOptionalValue<RnDefaultTenantRegionEntity | null>> {
    const { id } = options;
    const tenantRegion = await this.repository.findOne({
      where: { id },
      withDeleted: false,
    });

    return GlbOptionalValue.of(tenantRegion);
  }
}
