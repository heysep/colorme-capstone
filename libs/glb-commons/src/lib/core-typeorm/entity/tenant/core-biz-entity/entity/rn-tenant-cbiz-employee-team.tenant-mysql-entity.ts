import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizEmployeeDeptEntity } from './rn-tenant-cbiz-employee-dept.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-팀 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_employee_team',
  comment: '[기본정보] 기초정보-팀 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeTeamEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '팀 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '팀 고유 아이디',
  })
  id: string;

  // ------------------------------
  // 부서 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizEmployeeDeptEntity, (dept) => dept.teams, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '부서 정보',
    type: () => RnTenantCbizEmployeeDeptEntity,
  })
  @JoinColumn({
    name: 'deptId',
    referencedColumnName: 'id',
  })
  dept: RnTenantCbizEmployeeDeptEntity;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '팀명',
    nullable: false,
    index: true,
    example: '팀명',
  })
  teamName: string;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    nullable: false,
    default: true,
    example: '사용여부',
  })
  useYn: boolean;

  @Column({
    type: 'date',
    comment: '적용일',
    nullable: false,
    example: '적용일',
  })
  applyDate: Date;
}
