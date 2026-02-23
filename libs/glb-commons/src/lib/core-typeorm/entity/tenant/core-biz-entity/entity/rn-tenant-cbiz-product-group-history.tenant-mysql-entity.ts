import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizProductGroupEntity } from './rn-tenant-cbiz-product-group.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_product_group_history',
  comment: '[기본정보] 기초정보-제품 그룹 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductGroupHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 그룹 이력 고유 아이디',
    example: '제품 그룹 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizProductGroupEntity, (prdGroup) => prdGroup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizProductGroupEntity,
    description: '제품 그룹',
  })
  @JoinColumn({
    name: 'prdGroupId',
    referencedColumnName: 'id',
  })
  prdGroup: RnTenantCbizProductGroupEntity;

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
      description: '변경한 사람',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
