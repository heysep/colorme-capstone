import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizFacilityEntity } from './rn-tenant-cbiz-facility.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcUnitInciEntity } from './rn-tenant-cbiz-sales-product-manufacture-proc-unit-inci.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcEntity } from './rn-tenant-cbiz-sales-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_prd_manufacture_proc_unit',
  comment: '판매 제품 제조 공정 단위 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesProductManufactureProcUnitEntity extends RnBaseBaseMysqlEntity {
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

  // 공정
  @Column({
    type: 'varchar',
    length: 50,
    comment: '공정',
    example: '공정',
    nullable: false,
  })
  procName: string;

  // 사용설비
  @ManyToOne(() => RnTenantCbizFacilityEntity, (facility) => facility.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizFacilityEntity,
    description: '사용설비',
  })
  @JoinColumn({
    name: 'facilityId',
    referencedColumnName: 'id',
  })
  facility: RnTenantCbizFacilityEntity;

  // 제조방법
  @Column({
    type: 'text',
    comment: '제조방법',
    example: '제조방법',
    nullable: true,
  })
  manufactureMethod: string;

  // TEMP
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'TEMP',
    example: 'TEMP',
    nullable: true,
  })
  temp: string;

  // TIME
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'TIME',
    example: 'TIME',
    nullable: true,
  })
  time: string;

  // RPM
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'RPM',
    example: 'RPM',
    nullable: true,
  })
  rpm: string;

  @OneToMany(
    () => RnTenantCbizSalesProductManufactureProcUnitInciEntity,
    (procUnitInci) => procUnitInci.procUnit,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureProcUnitInciEntity,
      description: '판매 제품 제조 공정 단위 성분 함량',
    },
  )
  procUnitIncis: RnTenantCbizSalesProductManufactureProcUnitInciEntity[];
}
