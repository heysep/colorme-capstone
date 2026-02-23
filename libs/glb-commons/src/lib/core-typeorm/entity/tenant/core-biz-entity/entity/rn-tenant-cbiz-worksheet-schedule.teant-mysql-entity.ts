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
import { RnTenantCbizSalesProductManufactureEntity } from './rn-tenant-cbiz-sales-product-manufacture.tenant-mysql-entity';
import { RnTenantCbizSalesProductEntity } from './rn-tenant-cbiz-sales-product.tenant-mysql-entity';
import { RnTenantCbizSelfProductOrderEntity } from './rn-tenant-cbiz-self-product-order.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_worksheet_schedule',
  comment: '워크시트 스케쥴 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizWorksheetScheduleEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '워크시트 스케쥴 고유 아이디',
    example: '워크시트 스케쥴 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

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
    description: '판매 제품',
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

  // salesOrderprd
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

  // selfPrdOrder
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

  // 생산 수량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '생산 수량',
    example: '생산 수량',
    nullable: false,
    default: 0,
  })
  productionQuantity: number;

  // 생산 예정일
  @Column({
    type: 'date',
    comment: '생산 예정일',
    example: '생산 예정일',
    nullable: true,
  })
  productionDate: Date;

  // 생산 확정일
  @Column({
    type: 'date',
    comment: '생산 확정일',
    example: '생산 확정일',
    nullable: true,
  })
  productionConfirmedDate: Date;

  // 생산 확정 담당자
  @ManyToOne(() => RnTenantEmployeeAccountEntity, (employee) => employee.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantEmployeeAccountEntity,
    description: '생산 확정 담당자',
  })
  @JoinColumn({
    name: 'productionConfirmedEmployeeId',
    referencedColumnName: 'id',
  })
  productionConfirmedEmployeeAccount: RnTenantEmployeeAccountEntity;
}
