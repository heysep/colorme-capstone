import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './rn-tenant-cbiz-sales-order.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizSalesProductEntity } from './rn-tenant-cbiz-sales-product.tenant-mysql-entity';
import { RnTenantCbizSelfProductOrderEntity } from './rn-tenant-cbiz-self-product-order.tenant-mysql-entity';
import { RnTenantCbizStockHistoryEntity } from './rn-tenant-cbiz-stock-history.tenant-mysql-entity';
import { RnTenantCbizWorksheetEntity } from './rn-tenant-cbiz-worksheet.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_stock',
  comment: '재고 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizStockEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '재고 고유 아이디',
    example: '재고 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

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

  // 수주
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

  // 수주 품목
  @ManyToOne(
    () => RnTenantCbizSalesOrderProductEntity,
    (salesOrderPrd) => salesOrderPrd.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesOrderProductEntity,
      description: '수주 품목',
    },
  )
  @JoinColumn({
    name: 'salesOrderPrdId',
    referencedColumnName: 'id',
  })
  salesOrderPrd: RnTenantCbizSalesOrderProductEntity;

  // 수주 제품
  @ManyToOne(() => RnTenantCbizSalesProductEntity, (salesPrd) => salesPrd.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizSalesProductEntity,
    description: '수주 제품',
  })
  @JoinColumn({
    name: 'salesPrdId',
    referencedColumnName: 'id',
  })
  salesPrd: RnTenantCbizSalesProductEntity;

  // 수주 제품 제조
  @ManyToOne(
    () => RnTenantCbizSalesProductManufactureEntity,
    (salesPrdManufacture) => salesPrdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesProductManufactureEntity,
      description: '수주 제품 제조',
    },
  )
  @JoinColumn({
    name: 'salesPrdManufactureId',
    referencedColumnName: 'id',
  })
  salesPrdManufacture: RnTenantCbizSalesProductManufactureEntity;

  // 자체 제품 수주
  @ManyToOne(
    () => RnTenantCbizSelfProductOrderEntity,
    (selfPrdOrder) => selfPrdOrder.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSelfProductOrderEntity,
      description: '자체 제품 수주',
    },
  )
  @JoinColumn({
    name: 'selfPrdOrderId',
    referencedColumnName: 'id',
  })
  selfPrdOrder: RnTenantCbizSelfProductOrderEntity;

  // 창고
  // @ManyToOne(() => RnTenantCbizCargoEntity, (cargo) => cargo.id, {
  //   onDelete: 'SET NULL',
  //   onUpdate: 'SET NULL',
  //   nullable: true,
  //   type: () => RnTenantCbizCargoEntity,
  //   description: '창고',
  // })
  // @JoinColumn({
  //   name: 'cargoId',
  //   referencedColumnName: 'id',
  // })
  // cargo: RnTenantCbizCargoEntity;

  // 재고 수량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '재고 수량',
    example: '재고 수량',
    nullable: false,
  })
  stockQuantity: number;

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

  // 보존기한
  @Column({
    type: 'date',
    comment: '보존기한',
    example: '보존기한',
    nullable: false,
  })
  preservationPeriod: Date;

  // 제고 입고일
  @Column({
    type: 'date',
    comment: '제고 입고일',
    example: '제고 입고일',
    nullable: false,
  })
  inputDate: Date;

  // 최근 이력
  @ManyToOne(
    () => RnTenantCbizStockHistoryEntity,
    (stockHistory) => stockHistory.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizStockHistoryEntity,
      description: '최근 재고 이력',
    },
  )
  @JoinColumn({
    name: 'recentStockHistoryId',
    referencedColumnName: 'id',
  })
  recentStockHistory: RnTenantCbizStockHistoryEntity;

  // 생산
  @ManyToOne(() => RnTenantCbizWorksheetEntity, (worksheet) => worksheet.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizWorksheetEntity,
    description: '생산',
  })
  @JoinColumn({
    name: 'worksheetId',
    referencedColumnName: 'id',
  })
  worksheet: RnTenantCbizWorksheetEntity;

  // 예약 여부
  @Column({
    type: 'boolean',
    comment: '예약 여부',
    example: '예약 여부',
    nullable: false,
    default: false,
  })
  reservedYn: boolean;

  // 예약 일시
  @Column({
    type: 'date',
    comment: '예약 일시',
    example: '예약 일시',
    nullable: true,
  })
  reservedDate: Date;

  // 예약 담당자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '예약 담당자',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
