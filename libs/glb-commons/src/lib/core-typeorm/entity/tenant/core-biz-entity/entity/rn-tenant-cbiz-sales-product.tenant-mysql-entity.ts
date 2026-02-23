import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import {
  RnTenantCbizSalesProductManufactureStatusType,
  RnTenantCbizSalesProductType,
} from '../enum/rn-tenant-cbiz-sales-product.enum';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';
import { RnTenantCbizSalesOrderEntity } from './rn-tenant-cbiz-sales-order.tenant-mysql-entity';
import { RnTenantCbizSelfProductOrderEntity } from './rn-tenant-cbiz-self-product-order.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_product',
  comment: '수주 제품 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesProductEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '수주 제품 고유 아이디',
    example: '수주 제품 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 제품 타입 [수주, 자체 생산]
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesProductType,
    comment: '제품 타입 ["SALES_ORDER","SELF_PRODUCTION"]',
    example: '제품 타입 ["SALES_ORDER","SELF_PRODUCTION"]',
    nullable: false,
  })
  productType: RnTenantCbizSalesProductType;

  // 수주 제품 제조 정보 등록 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesProductManufactureStatusType,
    comment: '수주 제품 제조 정보 등록 상태',
    example: '수주 제품 제조 정보 등록 상태',
    nullable: false,
  })
  manufactureStatus: RnTenantCbizSalesProductManufactureStatusType;

  // 원본 prd
  @ManyToOne(() => RnTenantCbizProductEntity, (prd) => prd.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizProductEntity,
    description: '원본 prd',
  })
  @JoinColumn({
    name: 'originalPrdId',
    referencedColumnName: 'id',
  })
  originalPrd: RnTenantCbizProductEntity;

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

  // 수주 제품
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

  // 자체 제품 수주
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

  // 적용일자
  @Column({
    type: 'date',
    comment: '적용일자',
    example: '적용일자',
    nullable: true,
    default: null,
  })
  applyDate: Date;

  // 생성 적용일
  @Column({
    type: 'date',
    comment: '생성 적용일',
    example: '생성 적용일',
    nullable: true,
    default: null,
  })
  createdApplyDate: Date;

  // 작성자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '작성자',
    },
  )
  @JoinColumn({
    name: 'writerId',
    referencedColumnName: 'id',
  })
  writer: RnTenantEmployeeAccountEntity;

  // 검토자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '검토자',
    },
  )
  @JoinColumn({
    name: 'reviewerId',
    referencedColumnName: 'id',
  })
  reviewer: RnTenantEmployeeAccountEntity;

  // 승인
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '승인',
    },
  )
  @JoinColumn({
    name: 'approverId',
    referencedColumnName: 'id',
  })
  approver: RnTenantEmployeeAccountEntity;
}
