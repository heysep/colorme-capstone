import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizInciSupEntity } from './rn-tenant-cbiz-inci-sup.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_sup_history',
  comment: '원료 구매처 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciSupHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 구매처 이력 고유 아이디',
    example: '원료 구매처 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizInciSupEntity, (inciSup) => inciSup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciSupEntity,
    description: '원료 구매처',
  })
  @JoinColumn({
    name: 'inciSupId',
    referencedColumnName: 'id',
  })
  inciSup: RnTenantCbizInciSupEntity;

  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    example: '변경 이력 JSON',
    nullable: true,
  })
  changeHistory: any;

  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '직원 계정',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
