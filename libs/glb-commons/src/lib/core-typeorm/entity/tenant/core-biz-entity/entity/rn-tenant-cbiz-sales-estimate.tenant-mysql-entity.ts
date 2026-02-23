import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizSalesEstimateStatusType,
  RnTenantCbizSalesEstimateUrgentType,
} from '../enum/rn-tenant-cbiz-sales-estimate.enum';
import { RnTenantCbizBizPartnerManagerEntity } from './rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizEmployeeEntity } from './rn-tenant-cbiz-employee.tenant-mysql-entity';
import { RnTenantCbizSalesEstimateProductEntity } from './rn-tenant-cbiz-sales-estimate-product.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_sales_estimate',
  comment: '견적 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSalesEstimateEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '견적 고유 아이디',
    example: '견적 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 긴급
  @Column({
    type: 'enum',
    enum: RnTenantCbizSalesEstimateUrgentType,
    comment: '긴급 여부["URGENT","SUPER_URGENT","NORMAL"]',
    nullable: false,
    default: RnTenantCbizSalesEstimateUrgentType.NORMAL,
    example: '긴급 여부["URGENT","SUPER_URGENT","NORMAL"]',
  })
  urgent: RnTenantCbizSalesEstimateUrgentType;

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

  // 견적명
  @Column({
    type: 'varchar',
    length: 100,
    comment: '견적명',
    nullable: false,
    example: '견적명',
  })
  estimateName: string;

  // 견적 no
  @Column({
    type: 'varchar',
    length: 100,
    comment: '견적 no',
    nullable: false,
    example: '견적 no',
  })
  estimateNo: string;

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

  // 견적 총 금액
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '견적 총 금액',
    nullable: false,
    example: '견적 총 금액',
  })
  totalAmount: number;

  // 견적일
  @Column({
    type: 'date',
    comment: '견적일',
    nullable: false,
    example: '견적일',
  })
  estimateDate: Date;

  // 견적 유효일
  @Column({
    type: 'date',
    comment: '견적 유효일',
    nullable: true,
    example: '견적 유효일',
  })
  validDate: Date;

  // 예상 수주일
  @Column({
    type: 'date',
    comment: '예상 수주일',
    nullable: true,
    example: '예상 수주일',
  })
  expectedOrderDate: Date;

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
    enum: RnTenantCbizSalesEstimateStatusType,
    comment: '상태["WAITING","ESTIMATE","LOST","ORDER","CANCEL"]',
    nullable: false,
    example: '상태["WAITING","ESTIMATE","LOST","ORDER","CANCEL"]',
  })
  status: RnTenantCbizSalesEstimateStatusType;

  @OneToMany(
    () => RnTenantCbizSalesEstimateProductEntity,
    (product) => product.estimate,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      description: '견적 품목 정보',
      type: () => RnTenantCbizSalesEstimateProductEntity,
    },
  )
  estimateProducts: RnTenantCbizSalesEstimateProductEntity[];
}
