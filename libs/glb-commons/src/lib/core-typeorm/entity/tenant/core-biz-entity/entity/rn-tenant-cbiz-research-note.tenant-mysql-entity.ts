import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizResearchNoteResultType } from '../enum/rn-tenant-cbiz-research-note.enum';
import { RnTenantCbizProductGroupEntity } from './rn-tenant-cbiz-product-group.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureHistoryEntity } from './rn-tenant-cbiz-research-product-manufacture-history.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureEntity } from './rn-tenant-cbiz-research-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_research_note',
  comment: '노트 테이블 (연구용)',
  engine: 'InnoDB',
})
export class RnTenantCbizResearchNoteEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '노트 고유 아이디',
    example: '노트 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 제품
  // @ManyToOne(() => RnTenantCbizProductEntity, (prd) => prd.id, {
  //   onDelete: 'SET NULL',
  //   onUpdate: 'SET NULL',
  //   nullable: true,
  //   type: () => RnTenantCbizProductEntity,
  //   description: '제품',
  // })
  // @JoinColumn({
  //   name: 'prdId',
  //   referencedColumnName: 'id',
  // })
  // prd: RnTenantCbizProductEntity;

  // 제품 그룹
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

  // 연구 no
  @Column({
    type: 'varchar',
    length: 50,
    comment: '연구 no',
    example: '연구 no',
    nullable: false,
  })
  researchNo: string;

  // 연구명
  @Column({
    type: 'varchar',
    length: 100,
    comment: '연구명',
    example: '연구명',
    nullable: false,
  })
  researchName: string;

  // 연구 결과 (대기, 진행중, 보류, 중단, 성공, 제품화)
  @Column({
    type: 'enum',
    comment:
      '연구 결과 ["WAITING", "IN_PROGRESS", "HOLD", "STOP", "SUCCESS", "PRODUCT"]',
    nullable: false,
    enum: RnTenantCbizResearchNoteResultType,
    example:
      '연구 결과 ["WAITING", "IN_PROGRESS", "HOLD", "STOP", "SUCCESS", "PRODUCT"]',
  })
  resultType: RnTenantCbizResearchNoteResultType;

  // 연구 시작
  @Column({
    type: 'date',
    comment: '연구 시작',
    example: '연구 시작',
    nullable: true,
  })
  researchStartDate: Date;

  // 확정일
  @Column({
    type: 'date',
    comment: '확정일',
    example: '확정일',
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

  // 제품 제조
  @OneToOne(
    () => RnTenantCbizResearchProductManufactureEntity,
    (prdManufacture) => prdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureEntity,
      description: '제품 제조',
    },
  )
  prdManufacture: RnTenantCbizResearchProductManufactureEntity;

  // 가장 최근 히스토리
  @ManyToOne(
    () => RnTenantCbizResearchProductManufactureHistoryEntity,
    (history) => history.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureHistoryEntity,
      description: '가장 최근 히스토리',
    },
  )
  @JoinColumn({
    name: 'latestHistoryId',
    referencedColumnName: 'id',
  })
  latestHistory: RnTenantCbizResearchProductManufactureHistoryEntity;
}
