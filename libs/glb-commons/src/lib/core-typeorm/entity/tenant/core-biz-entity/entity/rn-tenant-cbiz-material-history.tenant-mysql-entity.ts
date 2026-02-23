import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizMaterialEntity } from './rn-tenant-cbiz-material.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_material_history',
  comment: '자재 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizMaterialHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '자재 이력 고유 아이디',
    example: '자재 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizMaterialEntity, (mt) => mt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizMaterialEntity,
    description: '자재',
  })
  @JoinColumn({
    name: 'mtId',
    referencedColumnName: 'id',
  })
  mt: RnTenantCbizMaterialEntity;

  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    example: '변경 이력 JSON',
    nullable: true,
  })
  changeHistory: any;

  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '직원 계정',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
