import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizFacilityEntity } from './rn-tenant-cbiz-facility.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-공통코드 변경 이력 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_facility_history',
  comment: '[기본정보] 기초정보-설비 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizFacilityHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '설비 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '설비 변경 이력 고유 아이디',
  })
  id: string;

  // 설비 정보
  @ManyToOne(() => RnTenantCbizFacilityEntity, (facility) => facility.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '설비 정보',
    type: () => RnTenantCbizFacilityEntity,
  })
  @JoinColumn({
    name: 'facilityId',
    referencedColumnName: 'id',
  })
  facility: RnTenantCbizFacilityEntity;

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
