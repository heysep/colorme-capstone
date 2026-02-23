import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizEmployeeTeamEntity } from './rn-tenant-cbiz-employee-team.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-팀 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_employee_team_history',
  comment: '[기본정보] 기초정보-팀 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeTeamHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '팀 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '팀 변경 이력 고유 아이디',
  })
  id: string;

  // 팀 정보
  @ManyToOne(() => RnTenantCbizEmployeeTeamEntity, (team) => team.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '팀 정보',
    type: () => RnTenantCbizEmployeeTeamEntity,
  })
  @JoinColumn({
    name: 'teamId',
    referencedColumnName: 'id',
  })
  team: RnTenantCbizEmployeeTeamEntity;

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
