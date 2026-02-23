import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import {
  RnTenantCbizSalesOrderProductExportType,
  RnTenantCbizSalesOrderProductFreeType,
  RnTenantCbizSalesOrderProductSampleType,
  RnTenantCbizSalesOrderProductStatusType,
} from '../enum/rn-tenant-cbiz-sales-order.enum';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizProductGroupEntity } from './rn-tenant-cbiz-product-group.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './rn-tenant-cbiz-sales-order.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_order_product',
  comment: '수주 품목 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesOrderProductEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '수주 품목 고유 아이디',
    example: '수주 품목 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

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

  // 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderProductStatusType,
    comment:
      '상태["SALES_ORDER","PRODUCTION_WAIT","PRODUCTION","SHIPMENT","DISCARD"]',
    example:
      '상태["SALES_ORDER","PRODUCTION_WAIT","PRODUCTION","SHIPMENT","DISCARD"]',
    nullable: false,
  })
  status: RnTenantCbizSalesOrderProductStatusType;

  // 고객 제품명
  @Column({
    type: 'varchar',
    length: 100,
    comment: '고객 제품명',
    example: '고객 제품명',
    nullable: false,
  })
  customerProductName: string;

  // 제품그룹
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

  // 납기 요구일
  @Column({
    type: 'date',
    comment: '납기 요구일',
    example: '납기 요구일',
    nullable: false,
  })
  deliveryDate: Date;

  // 금액
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '금액',
    example: '금액',
    nullable: false,
  })
  amount: number;

  // 수주 단위
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '수주 단위',
  })
  @JoinColumn({
    name: 'salesOrderUnitId',
    referencedColumnName: 'id',
  })
  salesOrderUnit: RnTenantCbizCodeEntity;

  // 샘플
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderProductSampleType,
    comment: '샘플["SAMPLE","PRODUCTION"]',
    example: '샘플["SAMPLE","PRODUCTION"]',
    nullable: false,
  })
  sample: RnTenantCbizSalesOrderProductSampleType;

  // 무상
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderProductFreeType,
    comment: '무상["FREE","PAID"]',
    example: '무상["FREE","PAID"]',
    nullable: false,
  })
  free: RnTenantCbizSalesOrderProductFreeType;

  // 수출
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderProductExportType,
    comment: '수출["EXPORT","INTERNAL"]',
    example: '수출["EXPORT","INTERNAL"]',
    nullable: false,
  })
  export: RnTenantCbizSalesOrderProductExportType;

  // 통화
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '통화',
  })
  @JoinColumn({
    name: 'currencyId',
    referencedColumnName: 'id',
  })
  currency: RnTenantCbizCodeEntity;

  // 환율
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '환율',
    example: '환율',
    nullable: false,
  })
  exchangeRate: number;

  //원화 환산
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '원화 환산',
    example: '원화 환산',
    nullable: false,
  })
  krwConversion: number;

  // 완제 여부
  @Column({
    type: 'boolean',
    comment: '완제 여부',
    example: '완제 여부',
    nullable: false,
    default: false,
  })
  completionYn: boolean;

  // 수주량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '수주량',
    example: '수주량',
    nullable: false,
  })
  salesOrderQuantity: number;

  // 총 출고량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '총 출고량',
    example: '총 출고량',
    nullable: false,
  })
  totalShipmentQuantity: number;

  // 총 생산량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '총 생산량',
    example: '총 생산량',
    nullable: false,
  })
  totalProductionQuantity: number;

  // 총 생산 계획량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '총 생산 계획량',
    example: '총 생산 계획량',
    nullable: false,
  })
  totalProductionPlanQuantity: number;

  // 예약됨
  @Column({
    type: 'boolean',
    comment: '예약됨',
    example: '예약됨',
    nullable: false,
    default: false,
  })
  reservedYn: boolean;

  // 예약 일시
  @Column({
    type: 'datetime',
    comment: '예약 일시',
    example: '예약 일시',
    nullable: true,
  })
  reservedDate: Date;

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
