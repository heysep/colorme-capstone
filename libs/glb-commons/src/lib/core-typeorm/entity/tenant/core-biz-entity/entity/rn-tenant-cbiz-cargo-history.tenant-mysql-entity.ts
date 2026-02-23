import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizCargoEntity } from './rn-tenant-cbiz-cargo.tenant-mysql-entity';
/**
 * [기본정보] 기초정보-창고 변경 이력 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_cargo_history',
  comment: '[기본정보] 기초정보-창고 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizCargoHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '창고 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '창고 변경 이력 고유 아이디',
  })
  id: string;

  // 창고
  @ManyToOne(() => RnTenantCbizCargoEntity, (cargo) => cargo.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '창고 정보',
    type: () => RnTenantCbizCargoEntity,
  })
  @JoinColumn({
    name: 'cargoId',
    referencedColumnName: 'id',
  })
  cargo: RnTenantCbizCargoEntity;

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
