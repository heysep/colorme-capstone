import {
  IDefaultOutputDto,
  RnDefaultTenantRepository,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantDefaultService {
  constructor(private readonly tenantRepository: RnDefaultTenantRepository) {}

  async findTenantByCode(data: { code: string }) {
    const { code } = data;
    const tenant = await this.tenantRepository.repository.findOne({
      where: { code },
    });
    return IDefaultOutputDto.success({
      data: tenant,
    });
  }

  async findTenantByDomain(data: { domain: string }) {
    const { domain } = data;
    const tenant = await this.tenantRepository.repository.findOne({
      where: { domainName: domain },
    });
    return IDefaultOutputDto.success({
      data: tenant,
    });
  }
}
