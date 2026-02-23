import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_prd_manufacture_inci',
  comment: '판매 제품 제조 성분 함량 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesProductManufactureInciEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '판매 제품 제조 성분 함량 고유 아이디',
    example: '판매 제품 제조 성분 함량 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 제품 제조
  @ManyToOne(
    () => RnTenantCbizSalesProductManufactureEntity,
    (prdManufacture) => prdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureEntity,
      description: '제품 제조',
    },
  )
  @JoinColumn({
    name: 'prdManufactureId',
    referencedColumnName: 'id',
  })
  prdManufacture: RnTenantCbizSalesProductManufactureEntity;

  // 제품 성분 정보 JSON
  @Column({
    type: 'json',
    comment: '제품 성분 정보 JSON',
    example: '제품 성분 정보 JSON',
    nullable: false,
  })
  inciInfo: any;
}
