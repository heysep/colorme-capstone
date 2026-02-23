import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizProductManufactureEntity } from './rn-tenant-cbiz-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_prd_manufacture_inci',
  comment: '제품 제조 성분 함량 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductManufactureInciEntity extends RnBaseBaseMysqlEntity {
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
    () => RnTenantCbizProductManufactureEntity,
    (prdManufacture) => prdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureEntity,
      description: '제품 제조',
    },
  )
  @JoinColumn({
    name: 'prdManufactureId',
    referencedColumnName: 'id',
  })
  prdManufacture: RnTenantCbizProductManufactureEntity;

  // 제품 성분 정보 JSON
  @Column({
    type: 'json',
    comment: '제품 성분 정보 JSON',
    example: '제품 성분 정보 JSON',
    nullable: false,
  })
  inciInfo: any;
}
