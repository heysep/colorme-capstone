import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizWorksheetStatusType } from '../enum/rn-tenant-cbiz-worksheet.enum';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './rn-tenant-cbiz-sales-order.tenant-mysql-entity';
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizSalesProductEntity } from './rn-tenant-cbiz-sales-product.tenant-mysql-entity';
import { RnTenantCbizSelfProductOrderEntity } from './rn-tenant-cbiz-self-product-order.tenant-mysql-entity';
import { RnTenantCbizWorksheetScheduleEntity } from './rn-tenant-cbiz-worksheet-schedule.teant-mysql-entity';
import { RnTenantCbizWorksheetStopEntity } from './rn-tenant-cbiz-worksheet-stop.tenant-mysql-entity';
import { RnTenantCbizWorksheetWaitEntity } from './rn-tenant-cbiz-worksheet-wait.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_worksheet',
  comment: '워크시트 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizWorksheetEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '생산 고유 아이디',
    example: '생산 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // prd
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

  // salesPrd
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

  // salesPrdManufacture
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

  // salesOrderProduct
  @ManyToOne(
    () => RnTenantCbizSalesOrderProductEntity,
    (salesOrderProduct) => salesOrderProduct.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSalesOrderProductEntity,
      description: '수주 제품',
    },
  )
  @JoinColumn({
    name: 'salesOrderProductId',
    referencedColumnName: 'id',
  })
  salesOrderProduct: RnTenantCbizSalesOrderProductEntity;

  // selfProductOrder
  @ManyToOne(
    () => RnTenantCbizSelfProductOrderEntity,
    (selfProductOrder) => selfProductOrder.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizSelfProductOrderEntity,
      description: '자체 제품 수주',
    },
  )
  @JoinColumn({
    name: 'selfProductOrderId',
    referencedColumnName: 'id',
  })
  selfProductOrder: RnTenantCbizSelfProductOrderEntity;

  // prt
  @ManyToOne(() => RnTenantCbizBizPartnerEntity, (prt) => prt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizBizPartnerEntity,
    description: '업체',
  })
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  prt: RnTenantCbizBizPartnerEntity;

  // 스케쥴
  @ManyToOne(
    () => RnTenantCbizWorksheetScheduleEntity,
    (schedule) => schedule.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizWorksheetScheduleEntity,
      description: '스케쥴',
    },
  )
  @JoinColumn({
    name: 'scheduleId',
    referencedColumnName: 'id',
  })
  schedule: RnTenantCbizWorksheetScheduleEntity;

  // lotNo
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'LOT NO',
    example: 'LOT NO',
    nullable: true,
  })
  lotNo: string;

  // 생산량
  @Column({
    type: 'int',
    comment: '생산량',
    example: '생산량',
    nullable: false,
    default: 0,
  })
  productionQuantity: number;

  // 생산 완료 량
  @Column({
    type: 'int',
    comment: '생산 완료 량',
    example: '생산 완료 량',
    nullable: false,
    default: 0,
  })
  productionCompletedQuantity: number;

  // 상태[대기, 생산, 생산완료, 출고, 중단, 보류]
  @Column({
    type: 'enum',
    enum: RnTenantCbizWorksheetStatusType,
    comment:
      '상태["WAITING","PRODUCTION","COMPLETED","SHIPMENT","STOP","HOLD"]',
    example:
      '상태["WAITING","PRODUCTION","COMPLETED","SHIPMENT","STOP","HOLD"]',
    nullable: true,
  })
  status: RnTenantCbizWorksheetStatusType;

  // 생산 시작일
  @Column({
    type: 'date',
    comment: '생산 시작일',
    example: '생산 시작일',
    nullable: true,
  })
  worksheetStartDate: Date;

  // 생산 완료일
  @Column({
    type: 'date',
    comment: '생산 완료일',
    example: '생산 완료일',
    nullable: true,
  })
  worksheetEndDate: Date;

  // 최근 중단
  @ManyToOne(
    () => RnTenantCbizWorksheetStopEntity,
    (worksheetStop) => worksheetStop.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizWorksheetStopEntity,
      description: '최근 중단',
    },
  )
  @JoinColumn({
    name: 'latestWorksheetStopId',
    referencedColumnName: 'id',
  })
  latestWorksheetStop: RnTenantCbizWorksheetStopEntity;

  // 최근 보류
  @ManyToOne(
    () => RnTenantCbizWorksheetWaitEntity,
    (worksheetWait) => worksheetWait.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizWorksheetWaitEntity,
      description: '최근 보류',
    },
  )
  @JoinColumn({
    name: 'latestWorksheetWaitId',
    referencedColumnName: 'id',
  })
  latestWorksheetWait: RnTenantCbizWorksheetWaitEntity;
}
