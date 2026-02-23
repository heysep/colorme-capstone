import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciStandardType } from '../enum/rn-tenant-cbiz-inci.enum';
import { RnTenantCbizCargoEntity } from './rn-tenant-cbiz-cargo.tenant-mysql-entity';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizInciGroupEntity } from './rn-tenant-cbiz-inci-group.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci',
  comment: '원료 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 고유 아이디',
    example: '원료 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 순서
  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  // 원료 이름
  @Column({
    type: 'varchar',
    length: 50,
    comment: '원료 이름',
    example: '원료 이름',
    nullable: false,
  })
  inciName: string;

  // 원료 코드
  @Column({
    type: 'varchar',
    length: 50,
    comment: '원료 코드',
    example: '원료 코드',
    nullable: false,
  })
  inciCode: string;

  // 원료 그룹
  @ManyToOne(() => RnTenantCbizInciGroupEntity, (inciGroup) => inciGroup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciGroupEntity,
    description: '원료 그룹',
  })
  @JoinColumn({
    name: 'inciGroupId',
    referencedColumnName: 'id',
  })
  inciGroup: RnTenantCbizInciGroupEntity;

  // 시험기준(KFCC, GTM, RSSC, SCSDC)
  @Column({
    type: 'enum',
    enum: RnTenantCbizInciStandardType,
    comment: '시험기준["KFCC","GTM","RSSC","SCSDC"]',
    example: '시험기준["KFCC","GTM","RSSC","SCSDC"]',
    nullable: false,
  })
  inciStandard: RnTenantCbizInciStandardType;

  // 입고 단위
  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '입고 단위',
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

  // 입고/출고 변환식
  @Column({
    type: 'varchar',
    length: 100,
    comment: '입고/출고 변환식',
    example: '입고/출고 변환식',
    nullable: false,
  })
  inciConversionFormula: string;

  // 변환식 적용일
  @Column({
    type: 'date',
    comment: '변환식 적용일',
    example: '변환식 적용일',
    nullable: false,
  })
  inciConversionFormulaApplyDate: Date;

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

  // 안전재고
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '안전재고',
    example: '안전재고',
    nullable: false,
    default: 0,
  })
  safetyStock: number;

  // 적용일
  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
    nullable: false,
  })
  applyDate: Date;

  // 사용여부
  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;
}
