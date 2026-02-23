import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './rn-tenant-cbiz-sales-order.tenant-mysql-entity';
import { RnTenantCbizSalesProductEntity } from './rn-tenant-cbiz-sales-product.tenant-mysql-entity';
import { RnTenantCbizStockEntity } from './rn-tenant-cbiz-stock.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_stock_reservation',
  comment: '재고 예약 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizStockReservationEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '재고 예약 고유 아이디',
    example: '재고 예약 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 거래처
  @ManyToOne(() => RnTenantCbizBizPartnerEntity, (prt) => prt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizBizPartnerEntity,
    description: '거래처',
  })
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  prt: RnTenantCbizBizPartnerEntity;

  // 제품
  @ManyToOne(() => RnTenantCbizProductEntity, (prd) => prd.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizProductEntity,
    description: '제품',
  })
  @JoinColumn({
    name: 'prdId',
    referencedColumnName: 'id',
  })
  prd: RnTenantCbizProductEntity;

  // 제조 제품
  @ManyToOne(() => RnTenantCbizSalesProductEntity, (salesPrd) => salesPrd.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizSalesProductEntity,
    description: '제조 제품',
  })
  @JoinColumn({
    name: 'salesPrdId',
    referencedColumnName: 'id',
  })
  salesPrd: RnTenantCbizSalesProductEntity;

  // salesOrder
  @ManyToOne(
    () => RnTenantCbizSalesOrderEntity,
    (salesOrder) => salesOrder.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesOrderEntity,
      description: '수주',
    },
  )
  @JoinColumn({
    name: 'salesOrderId',
    referencedColumnName: 'id',
  })
  salesOrder: RnTenantCbizSalesOrderEntity;

  // salesOrderPrd
  @ManyToOne(
    () => RnTenantCbizSalesOrderProductEntity,
    (salesOrderPrd) => salesOrderPrd.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesOrderProductEntity,
      description: '수주 제품',
    },
  )
  @JoinColumn({
    name: 'salesOrderPrdId',
    referencedColumnName: 'id',
  })
  salesOrderPrd: RnTenantCbizSalesOrderProductEntity;

  // 재고
  @ManyToOne(() => RnTenantCbizStockEntity, (stock) => stock.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizStockEntity,
    description: '재고',
  })
  @JoinColumn({
    name: 'stockId',
    referencedColumnName: 'id',
  })
  stock: RnTenantCbizStockEntity;

  // 예약 수량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '예약 수량',
    example: '예약 수량',
    nullable: false,
  })
  reservationQuantity: number;

  // 예약 확정 여부
  @Column({
    type: 'boolean',
    comment: '예약 확정 여부',
    example: '예약 확정 여부',
    nullable: false,
    default: false,
  })
  confirmedYn: boolean;

  // 예약한 사람
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '예약한 사람',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
