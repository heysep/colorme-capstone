import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultPcAnalysisEntity } from './rn-default-pc-analysis.mysql-entity';
import { RnDefaultPcUserEntity } from './rn-default-pc-user.mysql-entity';

export enum PcSavedLookStatus {
  TRYON_PENDING = 'TRYON_PENDING',
  TRYON_PROCESSING = 'TRYON_PROCESSING',
  TRYON_COMPLETED = 'TRYON_COMPLETED',
  FAILED = 'FAILED',
}

/**
 * 가상 피팅 저장 결과 엔티티
 *
 * @author YOSEB
 */
@Entity({
  name: 'rn_default_pc_saved_look',
  comment: '가상 피팅 저장 결과 테이블',
  engine: 'InnoDB',
})
export class RnDefaultPcSavedLookEntity extends RnBaseBaseMysqlEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: '저장 룩 고유 ID',
    example: 1,
  })
  id: number;

  @ManyToOne(() => RnDefaultPcUserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    description: '저장한 사용자',
    type: () => RnDefaultPcUserEntity,
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  user: RnDefaultPcUserEntity;

  @ManyToOne(() => RnDefaultPcAnalysisEntity, (analysis) => analysis.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    description: '연결된 진단 결과',
    type: () => RnDefaultPcAnalysisEntity,
  })
  @JoinColumn({
    name: 'analysisId',
    referencedColumnName: 'id',
  })
  analysis: RnDefaultPcAnalysisEntity;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '가상 피팅 결과 이미지 URL',
    nullable: true,
    example: 'https://storage.example.com/tryon/result.jpg',
  })
  tryOnImageUrl: string | null;

  @Column({
    type: 'enum',
    enum: PcSavedLookStatus,
    comment: '가상 피팅 상태',
    nullable: false,
    default: PcSavedLookStatus.TRYON_PENDING,
    example: PcSavedLookStatus.TRYON_PROCESSING,
  })
  status: PcSavedLookStatus;

  @Column({
    type: 'json',
    comment: '선택된 카탈로그 아이템 ID 목록',
    nullable: true,
    example: {
      topItemId: 1,
      bottomItemId: 2,
      accessoryItemId: 3,
    },
  })
  selectedItemIds: Record<string, number | null> | null;

  @Column({
    type: 'json',
    comment: '추천 스냅샷',
    nullable: true,
    example: {
      tops: [],
      bottoms: [],
      accessories: [],
    },
  })
  recommendationSnapshot: Record<string, unknown> | null;

  @Column({
    type: 'varchar',
    length: 120,
    comment: '제공자 작업 ID',
    nullable: true,
    example: 'gemini-look-123',
  })
  providerJobId: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '제공자 이름',
    nullable: true,
    example: 'GEMINI',
  })
  providerName: string | null;

  @Column({
    type: 'varchar',
    length: 120,
    comment: '공유 토큰',
    nullable: true,
    unique: true,
    example: 'share-token-123',
  })
  shareToken: string | null;

  @Column({
    type: 'boolean',
    comment: '저장 여부',
    nullable: false,
    default: false,
    example: false,
  })
  savedYn: boolean;

  @Column({
    type: 'text',
    comment: '저장 룩 설명/메모',
    nullable: true,
    example: '겨울 코트 가상 피팅 결과',
  })
  description: string | null;
}
