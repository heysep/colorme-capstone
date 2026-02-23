import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizProductType } from '../enum/rn-tenant-cbiz-product.enum';
import { RnTenantCbizCargoEntity } from './rn-tenant-cbiz-cargo.tenant-mysql-entity';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizProductGroupEntity } from './rn-tenant-cbiz-product-group.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_product',
  comment: '제품 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 고유 아이디',
    example: '제품 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '제품 이름',
    example: '제품 이름',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '제품 코드',
    example: '제품 코드',
    nullable: false,
  })
  code: string;

  @Column({
    type: 'enum',
    comment: '제품 유형["PRODUCT","PRODUCT_HALF","PRODUCT_IN_PROCESS"]',
    nullable: false,
    enum: RnTenantCbizProductType,
    example: '제품 유형["PRODUCT","PRODUCT_HALF","PRODUCT_IN_PROCESS"]',
  })
  type: RnTenantCbizProductType;

  // 그룹
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

  // 창고
  @ManyToOne(() => RnTenantCbizCargoEntity, (cargo) => cargo.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCargoEntity,
    description: '창고',
  })
  @JoinColumn({
    name: 'cargoId',
    referencedColumnName: 'id',
  })
  cargo: RnTenantCbizCargoEntity;

  // 단가
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '단가',
    example: '단가',
    nullable: true,
    default: 0,
  })
  priceUnit: number;

  // 단가 적용일
  @Column({
    type: 'date',
    comment: '단가 적용일',
    example: '단가 적용일',
    nullable: true,
    default: null,
  })
  priceUnitApplyDate: Date;

  // 단가 규격
  @Column({
    type: 'varchar',
    length: 100,
    comment: '단가 규격',
    example: '단가 규격',
    nullable: true,
    default: null,
  })
  priceSpec: string;

  // 투입단위
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '투입 단위',
  })
  @JoinColumn({
    name: 'inputUnitId',
    referencedColumnName: 'id',
  })
  inputUnit: RnTenantCbizCodeEntity;

  // 출고 단위
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '출고 단위',
  })
  @JoinColumn({
    name: 'outputUnitId',
    referencedColumnName: 'id',
  })
  outputUnit: RnTenantCbizCodeEntity;

  // 투입/출과 변환식
  @Column({
    type: 'varchar',
    length: 100,
    comment: '투입/출고 변환식',
    example: '투입/출고 변환식',
    nullable: false,
  })
  conversionFormula: string;

  // 안전재고
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '안전재고',
    example: '안전재고',
    nullable: false,
  })
  safetyStock: number;

  // 재고 유효기간
  @Column({
    type: 'int',
    comment: '재고 유효기간',
    example: '재고 유효기간',
    nullable: false,
  })
  safetyStockValidityDate: number;

  // 적용일
  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
    nullable: false,
  })
  applyDate: Date;

  // 제품정보 최근 적용일
  @Column({
    type: 'date',
    comment: '제품정보 최근 적용일',
    example: '제품정보 최근 적용일',
    nullable: false,
  })
  productInfoRecentApplyDate: Date;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  // 사용여부
  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;

  // 제품 제조 미등록 여부
  @Column({
    type: 'boolean',
    comment: '제품 제조 미등록 여부',
    example: '제품 제조 미등록 여부',
    nullable: false,
    default: false,
  })
  manufactureUnregisteredYn: boolean;

  // 연구 제품 여부
  // @Column({
  //   type: 'boolean',
  //   comment: '연구 제품 여부',
  //   example: '연구 제품 여부',
  //   nullable: false,
  //   default: false,
  // })
  // researchProductYn: boolean;
}
