import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizEmployeeDeptEntity } from './rn-tenant-cbiz-employee-dept.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-부서 변경 이력 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_employee_dept_history',
  comment: '[기본정보] 기초정보-부서 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeDeptHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '부서 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '직원 변경 이력 고유 아이디',
  })
  id: string;

  // 부서 정보
  @ManyToOne(() => RnTenantCbizEmployeeDeptEntity, (dept) => dept.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '부서 정보',
    type: () => RnTenantCbizEmployeeDeptEntity,
  })
  @JoinColumn({
    name: 'deptId',
    referencedColumnName: 'id',
  })
  dept: RnTenantCbizEmployeeDeptEntity;

  //변경 이력 JSON
  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    nullable: true,
    example: '변경 이력 JSON',
  })
  changeHistory: any;

  // 변경한 직원 계정
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      description: '직원 계정',
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
