import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizSalesOrderStatusType,
  RnTenantCbizSalesOrderUrgentType,
} from '../enum/rn-tenant-cbiz-sales-order.enum';
import { RnTenantCbizBizPartnerManagerEntity } from './rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizEmployeeEntity } from './rn-tenant-cbiz-employee.tenant-mysql-entity';
import { RnTenantCbizSalesEstimateEntity } from './rn-tenant-cbiz-sales-estimate.tenant-mysql-entity';
import { RnTenantCbizSalesOrderProductEntity } from './rn-tenant-cbiz-sales-order-product.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_order',
  comment: '수주 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesOrderEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '수주 고유 아이디',
    example: '수주 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 긴급
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderUrgentType,
    comment: '긴급 여부["URGENT","SUPER_URGENT","NORMAL"]',
    nullable: false,
    default: RnTenantCbizSalesOrderUrgentType.NORMAL,
    example: '긴급 여부["URGENT","SUPER_URGENT","NORMAL"]',
  })
  urgent: RnTenantCbizSalesOrderUrgentType;

  // 업체
  @ManyToOne(() => RnTenantCbizBizPartnerEntity, (prt) => prt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '업체 정보',
    type: () => RnTenantCbizBizPartnerEntity,
  })
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  prt: RnTenantCbizBizPartnerEntity;

  // 수주명
  @Column({
    type: 'varchar',
    length: 100,
    comment: '수주명',
    nullable: false,
    example: '수주명',
  })
  salesName: string;

  // 수주 no
  @Column({
    type: 'varchar',
    length: 100,
    comment: '수주 no',
    nullable: false,
    example: '수주 no',
  })
  salesNo: string;

  // 제품품목수
  @Column({
    type: 'int',
    comment: '제품품목수',
    nullable: false,
    example: '제품품목수',
  })
  productItemCount: number;

  // 업체 담당
  @ManyToOne(() => RnTenantCbizBizPartnerManagerEntity, (prtMng) => prtMng.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '담당자 정보',
    type: () => RnTenantCbizBizPartnerManagerEntity,
  })
  @JoinColumn({
    name: 'prtMngId',
    referencedColumnName: 'id',
  })
  prtMng: RnTenantCbizBizPartnerManagerEntity;

  // 영업 담당
  @ManyToOne(
    () => RnTenantCbizEmployeeEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '영업 담당 정보',
      type: () => RnTenantCbizEmployeeEntity,
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employee: RnTenantCbizEmployeeEntity;

  // 수주 총 금액
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '수주 총 금액',
    nullable: false,
    example: '수주 총 금액',
  })
  totalAmount: number;

  // 수주일
  @Column({
    type: 'date',
    comment: '수주일',
    nullable: false,
    example: '수주일',
  })
  salesDate: Date;

  // 최단납기요구일
  @Column({
    type: 'date',
    comment: '최단납기요구일',
    nullable: false,
    example: '최단납기요구일',
  })
  shortestDeliveryDate: Date;

  // 고객 요구 정보
  @Column({
    type: 'text',
    comment: '고객 요구 정보',
    nullable: true,
    example: '고객 요구 정보',
  })
  customerRequirements: string;

  // 첨부 파일
  @Column({
    type: 'text',
    comment: '첨부 파일',
    nullable: true,
    example: '첨부 파일',
  })
  attachmentFiles: string[];

  // 메모
  @Column({
    type: 'text',
    comment: '메모',
    nullable: true,
    example: '메모',
  })
  memo: string;

  // 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesOrderStatusType,
    comment:
      '상태["SALES_ORDER","PRODUCTION_WAIT","PARTIAL_PRODUCTION","PRODUCTION","PARTIAL_SHIPMENT","SHIPMENT","DISCARD"]',
    nullable: false,
    example:
      '상태["SALES_ORDER","PRODUCTION_WAIT","PARTIAL_PRODUCTION","PRODUCTION","PARTIAL_SHIPMENT","SHIPMENT","DISCARD"]',
  })
  status: RnTenantCbizSalesOrderStatusType;

  @OneToMany(
    () => RnTenantCbizSalesOrderProductEntity,
    (product) => product.salesOrder,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '수주 품목 정보',
      type: () => RnTenantCbizSalesOrderProductEntity,
    },
  )
  products: RnTenantCbizSalesOrderProductEntity[];

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
}
