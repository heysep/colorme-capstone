import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizCodeGroupEntity } from './rn-tenant-cbiz-code-group.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-공통코드그룹 변경 이력 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_code_group_history',
  comment: '[기본정보] 기초정보-공통코드그룹 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizCodeGroupHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '공통코드그룹 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '공통코드그룹 변경 이력 고유 아이디',
  })
  id: string;

  // 공통코드그룹 정보
  @ManyToOne(() => RnTenantCbizCodeGroupEntity, (codeGroup) => codeGroup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '공통코드그룹 정보',
    type: () => RnTenantCbizCodeGroupEntity,
  })
  @JoinColumn({
    name: 'codeGroupId',
    referencedColumnName: 'id',
  })
  codeGroup: RnTenantCbizCodeGroupEntity;

  //변경 이력 JSON
  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    nullable: true,
    example: '변경 이력 JSON',
  })
  changeHistory: any;

  // 변경한 사람 계정
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
