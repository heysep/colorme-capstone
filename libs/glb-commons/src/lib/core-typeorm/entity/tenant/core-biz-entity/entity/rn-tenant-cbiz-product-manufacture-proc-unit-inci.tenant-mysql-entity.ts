import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcUnitEntity } from './rn-tenant-cbiz-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcEntity } from './rn-tenant-cbiz-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizProductManufactureEntity } from './rn-tenant-cbiz-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_prd_manufacture_proc_unit_inci',
  comment: '제품 제조 공정 단위 원료 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductManufactureProcUnitInciEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 제조 고유 아이디',
    example: '제품 제조 고유 아이디',
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

  // 제품 제조 공정
  @ManyToOne(
    () => RnTenantCbizProductManufactureProcEntity,
    (proc) => proc.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureProcEntity,
      description: '제품 제조 공정',
    },
  )
  @JoinColumn({
    name: 'procId',
    referencedColumnName: 'id',
  })
  proc: RnTenantCbizProductManufactureProcEntity;

  // 제품 제조 공정 단위 공정
  @ManyToOne(
    () => RnTenantCbizProductManufactureProcUnitEntity,
    (procUnit) => procUnit.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureProcUnitEntity,
      description: '제품 제조 공정 단위 공정',
    },
  )
  @JoinColumn({
    name: 'procUnitId',
    referencedColumnName: 'id',
  })
  procUnit: RnTenantCbizProductManufactureProcUnitEntity;

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
