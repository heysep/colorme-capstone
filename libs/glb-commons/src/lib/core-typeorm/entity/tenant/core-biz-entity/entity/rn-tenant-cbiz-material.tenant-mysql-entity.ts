import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizMaterialType } from '../enum/rn-tenant-cbiz-material.enum';
import { RnTenantCbizCargoEntity } from './rn-tenant-cbiz-cargo.tenant-mysql-entity';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizMaterialGroupEntity } from './rn-tenant-cbiz-material-group.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_material',
  comment: '자재 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizMaterialEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '자재 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '자재 고유 아이디',
  })
  id: string;

  @Column({
    type: 'enum',
    comment: '자재 유형',
    nullable: false,
    default: RnTenantCbizMaterialType.MATERIAL,
    enum: RnTenantCbizMaterialType,
    example: '자재 유형["MATERIAL","SUB_MATERIAL","ETC"]',
  })
  type: RnTenantCbizMaterialType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '자재 이름',
    nullable: false,
    example: '자재 이름',
  })
  mtName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '자재 코드',
    nullable: false,
    example: '자재 코드',
  })
  mtCode: string;

  @ManyToOne(() => RnTenantCbizMaterialGroupEntity, (mtGroup) => mtGroup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizMaterialGroupEntity,
    description: '자재 그룹',
  })
  @JoinColumn({
    name: 'mtGroupId',
    referencedColumnName: 'id',
  })
  mtGroup: RnTenantCbizMaterialGroupEntity;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '단가',
    nullable: false,
    example: '단가',
    default: 0,
  })
  priceUnit: number;

  @Column({
    type: 'date',
    comment: '단가 적용일',
    nullable: true,
    example: '단가 적용일',
    default: null,
  })
  priceUnitApplyDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '단가 규격',
    nullable: true,
    example: '단가 규격',
    default: null,
  })
  priceSpec: string;

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

  @Column({
    type: 'varchar',
    length: 100,
    comment: '입고/출고 변환식',
    nullable: false,
    example: '입고/출고 변환식',
  })
  conversionFormula: string;

  @Column({
    type: 'date',
    comment: '변환식 적용일',
    nullable: false,
    example: '변환식 적용일',
  })
  conversionFormulaApplyDate: Date;

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
    nullable: false,
    example: '안전재고',
  })
  safetyStock: number;

  @Column({
    type: 'date',
    comment: '적용일',
    nullable: false,
    example: '적용일',
  })
  applyDate: Date;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    nullable: false,
    example: '사용여부',
    default: true,
  })
  useYn: boolean;
}
