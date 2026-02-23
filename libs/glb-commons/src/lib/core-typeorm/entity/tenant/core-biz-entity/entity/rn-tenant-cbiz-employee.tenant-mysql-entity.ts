import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeStatusType } from '../enum/rn-tenant-cbiz-employee.enum';
import { RnTenantCbizEmployeeDeptEntity } from './rn-tenant-cbiz-employee-dept.tenant-mysql-entity';
import { RnTenantCbizEmployeeMappingAccountEntity } from './rn-tenant-cbiz-employee-mapping-account.tenant-mysql-entity';
import { RnTenantCbizEmployeeTeamEntity } from './rn-tenant-cbiz-employee-team.tenant-mysql-entity';

export class BookMarkMenuEntity {
  index: number;
  url: string;
  label: string;
}

export class RnTenantEmployeeMetaDatEntity {
  bookMarkMenu: BookMarkMenuEntity[];
}

/**
 * [기본정보] 기초정보-직원 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_employee',
  comment: '[기본정보] 기초정보-직원 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '직원 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '직원 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '직원 이름',
    nullable: false,
    index: true,
    example: '직원 이름',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '이메일',
    nullable: false,
    index: true,
    example: '이메일',
  })
  email: string;

  // ------------------------------
  // 부서 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizEmployeeDeptEntity, (dept) => dept.id, {
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

  // ------------------------------
  // 팀 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizEmployeeTeamEntity, (team) => team.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '팀 정보',
    type: () => RnTenantCbizEmployeeTeamEntity,
  })
  @JoinColumn({
    name: 'teamId',
    referencedColumnName: 'id',
  })
  team: RnTenantCbizEmployeeTeamEntity;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '사원번호',
    nullable: true,
    index: true,
    example: '사원번호',
  })
  empIdnum: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '직급',
    nullable: true,
    example: '직급',
  })
  empRank: string;

  @Column({
    type: 'date',
    comment: '입사일',
    nullable: true,
    example: '입사일',
  })
  empStartDate: Date;

  @Column({
    type: 'varchar',
    length: 250,
    comment: '비고',
    nullable: true,
    example: '비고',
  })
  empRemarks: string;

  // @Column({
  //   type: 'date',
  //   comment: '적용일',
  //   nullable: true,
  //   example: '적용일',
  // })
  // applyDate: Date;

  @Column({
    type: 'json',
    comment: '추가 정보',
    nullable: true,
    example: '추가 정보',
  })
  metaData: RnTenantEmployeeMetaDatEntity;

  // ------------------------------------
  // 근무형태, 업무형태, 근무상태
  // ------------------------------------
  @Column({
    type: 'varchar',
    length: 200,
    comment: '근무형태[정규직, 계약직, 일용직]',
    nullable: true,
    example: '근무형태[정규직, 계약직, 일용직]',
  })
  defMetaDataWorkType: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '업무형태[임원, 관리직, 사무직, 연구직, 생산직]',
    nullable: true,
    example: '업무형태[임원, 관리직, 사무직, 연구직, 생산직]',
  })
  defMetaDataJobType: string;

  @Column({
    type: 'enum',
    enum: RnTenantEmployeeStatusType,
    comment: '근무 상태["WORKING","LEAVE","SICK","RETIRED"]',
    default: RnTenantEmployeeStatusType.WORKING,
    nullable: false,
    example: '근무 상태["WORKING","LEAVE","SICK","RETIRED"]',
  })
  empStatus: RnTenantEmployeeStatusType;

  @Column({
    type: 'date',
    comment: '근무상태 적용일',
    nullable: true,
    example: '근무상태 적용일',
  })
  empStatusApplyDate: Date;

  @OneToOne(
    () => RnTenantCbizEmployeeMappingAccountEntity,
    (mappingAccount) => mappingAccount.employee,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '직원 매핑 계정 정보',
      type: () => RnTenantCbizEmployeeMappingAccountEntity,
      isOwner: true,
    },
  )
  mappingAccount: RnTenantCbizEmployeeMappingAccountEntity;
}
