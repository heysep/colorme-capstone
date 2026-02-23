import { Entity } from 'typeorm';
import {
  Column,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizEmployeeTeamEntity } from './rn-tenant-cbiz-employee-team.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-부서 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_employee_dept',
  comment: '[기본정보] 기초정보-부서 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeDeptEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '부서 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '부서 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '부서명',
    nullable: false,
    example: '부서명',
  })
  deptName: string;

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

  /**
   * 팀 목록
   */
  @OneToMany(() => RnTenantCbizEmployeeTeamEntity, (detail) => detail.dept, {
    description: '팀 목록',
    type: () => RnTenantCbizEmployeeTeamEntity,
  })
  teams: RnTenantCbizEmployeeTeamEntity[];
}
