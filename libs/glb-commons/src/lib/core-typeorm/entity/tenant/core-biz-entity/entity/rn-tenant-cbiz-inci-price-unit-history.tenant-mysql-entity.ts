import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizInciPriceEntity } from './rn-tenant-cbiz-inci-price.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_price_unit_history',
  comment: '[기본정보] 기초정보-원료 단가 단가 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciPriceUnitHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 단가 단가 변경 이력 고유 아이디',
    example: '원료 단가 단가 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizInciPriceEntity, (inciPrice) => inciPrice.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '원료 단가',
    type: () => RnTenantCbizInciPriceEntity,
  })
  @JoinColumn({
    name: 'inciPriceId',
    referencedColumnName: 'id',
  })
  inciPrice: RnTenantCbizInciPriceEntity;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '이전 단가',
    example: '이전 단가',
    nullable: true,
    default: 0,
  })
  priceUnitBefore: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '이후 단가',
    example: '이후 단가',
    nullable: true,
    default: 0,
  })
  priceUnitAfter: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '이전 단가규격',
    example: '이전 단가규격',
    nullable: true,
    default: null,
  })
  priceUnitSpecBefore: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '이후 단가규격',
    example: '이후 단가규격',
    nullable: true,
    default: null,
  })
  priceUnitSpecAfter: string;

  @Column({
    type: 'date',
    comment: '이전 단가 적용일',
    example: '이전 단가 적용일',
    nullable: true,
  })
  priceUnitApplyDateBefore: Date | null;

  @Column({
    type: 'date',
    comment: '이후 단가 적용일',
    example: '이후 단가 적용일',
    nullable: true,
    default: null,
  })
  priceUnitApplyDateAfter: Date;

  @Column({
    type: 'boolean',
    comment: '취소 여부',
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
