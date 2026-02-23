import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizBizPartnerManagerEntity } from './rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-거래처 담당자 변경 이력 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_biz_partner_mng_history',
  comment: '[기본정보] 기초정보-거래처 담당자 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizBizPartnerMngHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '거래처 담당자 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '거래처 담당자 변경 이력 고유 아이디',
  })
  id: string;

  // 거래처 담당자
  @ManyToOne(() => RnTenantCbizBizPartnerManagerEntity, (prtMng) => prtMng.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '거래처 담당자 정보',
    type: () => RnTenantCbizBizPartnerManagerEntity,
  })
  @JoinColumn({
    name: 'prtMngId',
    referencedColumnName: 'id',
  })
  prtMng: RnTenantCbizBizPartnerManagerEntity;

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
