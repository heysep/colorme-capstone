import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizStockQtType } from '../enum/rn-tenant-cbiz-stock-history.enum';
import { RnTenantCbizStockEntity } from './rn-tenant-cbiz-stock.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_stock_history',
  comment: '재고 이력 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizStockHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '재고 이력 고유 아이디',
    example: '재고 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 제고
  @ManyToOne(() => RnTenantCbizStockEntity, (stock) => stock.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizStockEntity,
    description: '제고',
  })
  @JoinColumn({
    name: 'stockId',
    referencedColumnName: 'id',
  })
  stock: RnTenantCbizStockEntity;

  // 제고 출고 수량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '제고 출고 수량',
    nullable: false,
    example: '제고 출고 수량',
    default: 0,
  })
  stockQtyOut: number;

  // 제고 입고 수량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '제고 입고 수량',
    nullable: false,
    example: '제고 입고 수량',
    default: 0,
  })
  stockQtyIn: number;

  // 제고 출/입고 타입
  @Column({
    type: 'enum',
    enum: RnTenantCbizStockQtType,
    comment: '제고 출/입고 타입',
    nullable: false,
    example: '제고 출/입고 타입',
  })
  stockQtType: RnTenantCbizStockQtType;

  // 출고 사유
  @Column({
    type: 'text',
    comment: '출고 사유',
    nullable: false,
    example: '출고 사유',
  })
  stockHistoryReason: string;

  // 담당자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '담당자',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;

  @Column({
    type: 'date',
    comment: '출고일',
    nullable: false,
    example: '출고일',
  })
  stockQtOutputDate: Date;

  @Column({
    type: 'date',
    comment: '입고일',
    nullable: false,
    example: '입고일',
  })
  stockQtInputDate: Date;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '재고 수량 이전',
    nullable: false,
    example: '재고 수량 이전',
    default: 0,
  })
  stockQtyBefore: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '재고 수량 이후',
    nullable: false,
    example: '재고 수량 이후',
    default: 0,
  })
  stockQtyAfter: number;

  // 취소 여부
  @Column({
    type: 'boolean',
    comment: '취소 여부',
    nullable: false,
    example: '취소 여부',
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
      type: () => RnTenantEmployeeAccountEntity,
      description: '취소한 사람',
    },
  )
  @JoinColumn({
    name: 'canceledEmployeeAccountId',
    referencedColumnName: 'id',
  })
  canceledEmployeeAccount: RnTenantEmployeeAccountEntity;

  // 취소된 히스토리
  @ManyToOne(
    () => RnTenantCbizStockHistoryEntity,
    (canceledStockHistory) => canceledStockHistory.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizStockHistoryEntity,
      description: '취소된 히스토리',
    },
  )
  @JoinColumn({
    name: 'canceledStockHistoryId',
    referencedColumnName: 'id',
  })
  canceledStockHistory: RnTenantCbizStockHistoryEntity;

  // 취소 이유
  @Column({
    type: 'text',
    comment: '취소 이유',
    nullable: false,
    example: '취소 이유',
  })
  stockHistoryCancelReason: string;
}
