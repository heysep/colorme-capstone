import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcUnitInciEntity } from './rn-tenant-cbiz-product-manufacture-proc-unit-inci.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureProcUnitEntity } from './rn-tenant-cbiz-research-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureProcEntity } from './rn-tenant-cbiz-research-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureEntity } from './rn-tenant-cbiz-research-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_research_prd_manufacture_proc_unit_inci',
  comment: '제품 제조 공정 단위 원료 테이블 (연구용)',
  engine: 'InnoDB',
})
export class RnTenantCbizResearchProductManufactureProcUnitInciEntity
  extends RnBaseBaseMysqlEntity
  implements
    Omit<
      RnTenantCbizProductManufactureProcUnitInciEntity,
      'prdManufacture' | 'proc' | 'procUnit'
    >
{
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

  // 제품 제조 공정
  @ManyToOne(
    () => RnTenantCbizResearchProductManufactureProcEntity,
    (proc) => proc.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureProcEntity,
      description: '제품 제조 공정',
    },
  )
  @JoinColumn({
    name: 'procId',
    referencedColumnName: 'id',
  })
  proc: RnTenantCbizResearchProductManufactureProcEntity;

  // 제품 제조 공정 단위 공정
  @ManyToOne(
    () => RnTenantCbizResearchProductManufactureProcUnitEntity,
    (procUnit) => procUnit.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureProcUnitEntity,
      description: '제품 제조 공정 단위 공정',
    },
  )
  @JoinColumn({
    name: 'procUnitId',
    referencedColumnName: 'id',
  })
  procUnit: RnTenantCbizResearchProductManufactureProcUnitEntity;

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
