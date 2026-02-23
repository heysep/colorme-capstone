import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizEmployeeDeptEntity } from './rn-tenant-cbiz-employee-dept.tenant-mysql-entity';
import { RnTenantCbizEmployeeTeamEntity } from './rn-tenant-cbiz-employee-team.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureProcUnitEntity } from './rn-tenant-cbiz-sales-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_prd_manufacture_proc',
  comment: '판매 제품 제조 공정 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesProductManufactureProcEntity extends RnBaseBaseMysqlEntity {
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

  // 순서
  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  // 공정
  @Column({
    type: 'varchar',
    length: 50,
    comment: '공정',
    example: '공정',
    nullable: false,
  })
  procName: string;

  // 부서
  @ManyToOne(() => RnTenantCbizEmployeeDeptEntity, (dept) => dept.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizEmployeeDeptEntity,
    description: '부서',
  })
  @JoinColumn({
    name: 'deptId',
    referencedColumnName: 'id',
  })
  dept: RnTenantCbizEmployeeDeptEntity;

  // 팀
  @ManyToOne(() => RnTenantCbizEmployeeTeamEntity, (team) => team.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizEmployeeTeamEntity,
    description: '팀',
  })
  @JoinColumn({
    name: 'teamId',
    referencedColumnName: 'id',
  })
  team: RnTenantCbizEmployeeTeamEntity;

  // 제조 방법
  @Column({
    type: 'text',
    comment: '제조 방법',
    example: '제조 방법',
    nullable: true,
  })
  manufactureMethod: string;

  @OneToMany(
    () => RnTenantCbizSalesProductManufactureProcUnitEntity,
    (prdManufactureProcUnit) => prdManufactureProcUnit.proc,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureProcUnitEntity,
      description: '판매 제품 제조 공정 단위',
    },
  )
  procUnits: RnTenantCbizSalesProductManufactureProcUnitEntity[];
}
