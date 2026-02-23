import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcUnitEntity } from './rn-tenant-cbiz-sales-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcEntity } from './rn-tenant-cbiz-sales-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_prd_manufacture_proc_unit_inci',
  comment: '판매 제품 제조 공정 단위 원료 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesProductManufactureProcUnitInciEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '판매 제품 제조 고유 아이디',
    example: '판매 제품 제조 고유 아이디',
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

  // 제품 제조 공정
  @ManyToOne(
    () => RnTenantCbizSalesProductManufactureProcEntity,
    (proc) => proc.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureProcEntity,
      description: '제품 제조 공정',
    },
  )
  @JoinColumn({
    name: 'procId',
    referencedColumnName: 'id',
  })
  proc: RnTenantCbizSalesProductManufactureProcEntity;

  // 제품 제조 공정 단위 공정
  @ManyToOne(
    () => RnTenantCbizSalesProductManufactureProcUnitEntity,
    (procUnit) => procUnit.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureProcUnitEntity,
      description: '제품 제조 공정 단위 공정',
    },
  )
  @JoinColumn({
    name: 'procUnitId',
    referencedColumnName: 'id',
  })
  procUnit: RnTenantCbizSalesProductManufactureProcUnitEntity;

  // 원료
  @ManyToOne(() => RnTenantCbizInciEntity, (inci) => inci.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciEntity,
    description: '원료',
  })
  @JoinColumn({
    name: 'inciId',
    referencedColumnName: 'id',
  })
  inci: RnTenantCbizInciEntity;

  // 함량(총합이 100 초가면 안됨)
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '함량',
    example: '함량',
    nullable: false,
  })
  concentration: number;
}
