import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizProductManufactureInciEntity } from './rn-tenant-cbiz-product-manufacture-inci.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureEntity } from './rn-tenant-cbiz-research-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_research_prd_manufacture_inci',
  comment: '제품 제조 성분 함량 테이블 (연구용)',
  engine: 'InnoDB',
})
export class RnTenantCbizResearchProductManufactureInciEntity
  extends RnBaseBaseMysqlEntity
  implements Omit<RnTenantCbizProductManufactureInciEntity, 'prdManufacture'>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 제조 성분 함량 고유 아이디',
    example: '제품 제조 성분 함량 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 제품 제조
  @ManyToOne(
    () => RnTenantCbizResearchProductManufactureEntity,
    (prdManufacture) => prdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureEntity,
      description: '제품 제조',
    },
  )
  @JoinColumn({
    name: 'prdManufactureId',
    referencedColumnName: 'id',
  })
  prdManufacture: RnTenantCbizResearchProductManufactureEntity;

  // 제품 성분 정보 JSON
  @Column({
    type: 'json',
    comment: '제품 성분 정보 JSON',
    example: '제품 성분 정보 JSON',
    nullable: false,
  })
  inciInfo: any;
}
