import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_formula_history',
  comment: '원료 변환식 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciFormulaHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 변환식 이력 고유 아이디',
    example: '원료 변환식 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizInciEntity, (inci) => inci.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciEntity,
    description: '원료',
  })
  @JoinColumn({
    name: 'inciId',
    referencedColumnName: 'id',
  })
  inci: RnTenantCbizInciEntity;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '이전 원료 변환식',
    example: '이전 원료 변환식',
    nullable: false,
  })
  formulaBefore: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '이후 원료 변환식',
    example: '이후 원료 변환식',
    nullable: false,
  })
  formulaAfter: string;

  @Column({
    type: 'date',
    comment: '이전 변환식 적용일',
    example: '이전 변환식 적용일',
    nullable: false,
  })
  formulaApplyDateBefore: Date;

  @Column({
    type: 'date',
    comment: '이후 변환식 적용일',
    example: '이후 변환식 적용일',
    nullable: false,
  })
  formulaApplyDateAfter: Date;

  @Column({
    type: 'boolean',
    comment: '취소 여부',
    example: '취소 여부',
    nullable: false,
    default: false,
  })
  canceledYn: boolean;

  // 취소한 사람
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (canceledEmployeeAccount) => canceledEmployeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '취소한 사람',
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'canceledEmployeeAccountId',
    referencedColumnName: 'id',
  })
  canceledEmployeeAccount: RnTenantEmployeeAccountEntity;

  // 변경한 사람
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '변경한 사람',
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
