import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizProductManufactureInciEntity } from './rn-tenant-cbiz-product-manufacture-inci.tenant-mysql-entity';
import { RnTenantCbizProductManufactureProcEntity } from './rn-tenant-cbiz-product-manufacture-proc.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';
import { RnTenantCbizResearchNoteEntity } from './rn-tenant-cbiz-research-note.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_prd_manufacture',
  comment: '제품 제조 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductManufactureEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 제조 고유 아이디',
    example: '제품 제조 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

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

  // 연구 노트
  @ManyToOne(() => RnTenantCbizResearchNoteEntity, (note) => note.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizResearchNoteEntity,
    description: '연구 노트',
  })
  @JoinColumn({
    name: 'noteId',
    referencedColumnName: 'id',
  })
  note: RnTenantCbizResearchNoteEntity;

  // 허가(보고)번호
  @Column({
    type: 'varchar',
    length: 50,
    comment: '허가(보고)번호',
    example: '허가(보고)번호',
    nullable: true,
  })
  permitNumber: string;

  // 허가(보고)일자
  @Column({
    type: 'date',
    comment: '허가(보고)일자',
    example: '허가(보고)일자',
    nullable: true,
  })
  permitDate: Date;

  // 사용기한
  @Column({
    type: 'int',
    comment: '사용기한',
    example: '사용기한',
    nullable: true,
  })
  usagePeriod: number;

  // 보관조건
  @Column({
    type: 'text',
    comment: '보관조건',
    example: '보관조건',
    nullable: true,
  })
  storageCondition: string;

  // 성상
  @Column({
    type: 'text',
    comment: '성상',
    example: '성상',
    nullable: true,
  })
  appearance: string;

  // 표시 성분
  @Column({
    type: 'text',
    comment: '표시 성분',
    example: '표시 성분',
    nullable: true,
  })
  displayedIngredient: string;

  // 용법/용량
  @Column({
    type: 'text',
    comment: '용법/용량',
    example: '용법/용량',
    nullable: true,
  })
  usageAndCapacity: string;

  // 효과 효항
  @Column({
    type: 'text',
    comment: '효과 효항',
    example: '효과 효항',
    nullable: true,
  })
  effectAndFunction: string;

  // 사용상의 주의 사항
  @Column({
    type: 'text',
    comment: '사용상의 주의 사항',
    example: '사용상의 주의 사항',
    nullable: true,
  })
  usagePrecautions: string;

  // 기타사항
  @Column({
    type: 'text',
    comment: '기타사항',
    example: '기타사항',
    nullable: true,
  })
  etc: string;

  // 제조 특이사항
  @Column({
    type: 'text',
    comment: '제조 특이사항',
    example: '제조 특이사항',
    nullable: true,
  })
  manufactureSpecific: string;

  // 작업 점검 및 주의 사항
  @Column({
    type: 'text',
    comment: '작업 점검 및 주의 사항',
    example: '작업 점검 및 주의 사항',
    nullable: true,
  })
  workInspectionAndPrecautions: string;

  // 적용일
  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
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

  // 전체 용량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '전체 용량',
    example: '전체 용량',
    nullable: true,
  })
  totalCapacity: number;

  // 단위 용량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '단위 용량',
    example: '단위 용량',
    nullable: true,
  })
  unitCapacity: number;

  @OneToMany(
    () => RnTenantCbizProductManufactureInciEntity,
    (prdManufactureInci) => prdManufactureInci.prdManufacture,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureInciEntity,
      description: '제품 제조 성분 함량',
    },
  )
  incis: RnTenantCbizProductManufactureInciEntity[];

  @OneToMany(
    () => RnTenantCbizProductManufactureProcEntity,
    (prdManufactureProc) => prdManufactureProc.prdManufacture,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizProductManufactureProcEntity,
      description: '제품 제조 공정',
    },
  )
  @JoinColumn({
    name: 'prdManufactureProcId',
    referencedColumnName: 'id',
  })
  procs: RnTenantCbizProductManufactureProcEntity[];
}
