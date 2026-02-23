import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizSalesEstimateProductExportType,
  RnTenantCbizSalesEstimateProductFreeType,
  RnTenantCbizSalesEstimateProductSampleType,
  RnTenantCbizSalesEstimateProductStatusType,
} from '../enum/rn-tenant-cbiz-sales-estimate.enum';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizProductGroupEntity } from './rn-tenant-cbiz-product-group.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesEstimateEntity } from './rn-tenant-cbiz-sales-estimate.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_estimate_product',
  comment: '견적 품목 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesEstimateProductEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '견적 품목 고유 아이디',
    example: '견적 품목 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 견적
  @ManyToOne(() => RnTenantCbizSalesEstimateEntity, (estimate) => estimate.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizSalesEstimateEntity,
    description: '견적',
  })
  @JoinColumn({
    name: 'estimateId',
    referencedColumnName: 'id',
  })
  estimate: RnTenantCbizSalesEstimateEntity;

  // 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesEstimateProductStatusType,
    comment: '상태["WAITING","ESTIMATE","ORDER","CANCEL"]',
    example: '상태["WAITING","ESTIMATE","ORDER","CANCEL"]',
    nullable: false,
  })
  status: RnTenantCbizSalesEstimateProductStatusType;

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

  // 견적 단위
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '견적 단위',
  })
  @JoinColumn({
    name: 'estimateUnitId',
    referencedColumnName: 'id',
  })
  estimateUnit: RnTenantCbizCodeEntity;

  // 샘플
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesEstimateProductSampleType,
    comment: '샘플["SAMPLE","PRODUCTION"]',
    example: '샘플["SAMPLE","PRODUCTION"]',
    nullable: false,
  })
  sample: RnTenantCbizSalesEstimateProductSampleType;

  // 무상
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesEstimateProductFreeType,
    comment: '무상["FREE","PAID"]',
    example: '무상["FREE","PAID"]',
    nullable: false,
  })
  free: RnTenantCbizSalesEstimateProductFreeType;

  // 수출
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesEstimateProductExportType,
    comment: '수출["EXPORT","INTERNAL"]',
    example: '수출["EXPORT","INTERNAL"]',
    nullable: false,
  })
  export: RnTenantCbizSalesEstimateProductExportType;

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
}
