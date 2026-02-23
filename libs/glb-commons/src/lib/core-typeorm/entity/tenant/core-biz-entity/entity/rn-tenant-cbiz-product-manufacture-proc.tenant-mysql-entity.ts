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
import { RnTenantCbizProductManufactureProcUnitEntity } from './rn-tenant-cbiz-product-manufacture-proc-unit.tenant-mysql-entity';
import { RnTenantCbizProductManufactureEntity } from './rn-tenant-cbiz-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_prd_manufacture_proc',
  comment: '제품 제조 공정 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductManufactureProcEntity extends RnBaseBaseMysqlEntity {
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
    () => RnTenantCbizProductManufactureProcUnitEntity,
    (prdManufactureProcUnit) => prdManufactureProcUnit.proc,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureProcUnitEntity,
      description: '제품 제조 공정 단위',
    },
  )
  procUnits: RnTenantCbizProductManufactureProcUnitEntity[];
}
