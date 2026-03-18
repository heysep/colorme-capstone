import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultPersonalColorEntity } from './rn-default-personal-color.mysql-entity';
import { RnDefaultPcUserEntity } from './rn-default-pc-user.mysql-entity';

export enum PcAnalysisStatus {
  UPLOADED = 'UPLOADED',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * 퍼스널 컬러 진단 결과 엔티티
 *
 * @author YOSEB
 */
@Entity({
  name: 'rn_default_pc_analysis',
  comment: '퍼스널 컬러 진단 결과 테이블',
  engine: 'InnoDB',
})
export class RnDefaultPcAnalysisEntity extends RnBaseBaseMysqlEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: '진단 결과 고유 ID',
    example: 1,
  })
  id: number;

  @ManyToOne(() => RnDefaultPcUserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    description: '진단 대상 사용자',
    type: () => RnDefaultPcUserEntity,
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  user: RnDefaultPcUserEntity;

  @ManyToOne(() => RnDefaultPersonalColorEntity, (color) => color.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '진단된 퍼스널 컬러',
    type: () => RnDefaultPersonalColorEntity,
    nullable: true,
  })
  @JoinColumn({
    name: 'personalColorId',
    referencedColumnName: 'id',
  })
  personalColor: RnDefaultPersonalColorEntity | null;

  @Column({
    type: 'enum',
    enum: PcAnalysisStatus,
    comment: '진단 상태',
    nullable: false,
    default: PcAnalysisStatus.UPLOADED,
    example: PcAnalysisStatus.ANALYZING,
  })
  status: PcAnalysisStatus;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '원본 업로드 파일 ID',
    nullable: true,
    example: 'upload-file-id',
  })
  uploadFileId: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '분석용 원본 이미지 URL',
    nullable: true,
    example: 'https://storage.example.com/analysis/original.jpg',
  })
  originalImageUrl: string | null;

  @Column({
    type: 'text',
    comment: 'AI 진단 이유/설명',
    nullable: true,
    example: '피부톤 분석 결과 봄 웜톤으로 판단됩니다.',
  })
  reason: string | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: '최종 시즌 신뢰도',
    nullable: true,
    example: 82.5,
  })
  primaryConfidence: number | null;

  @Column({
    type: 'json',
    comment: '시즌별 점수',
    nullable: true,
    example: {
      SPRING_WARM: 82.5,
      SUMMER_COOL: 7.5,
      AUTUMN_WARM: 8,
      WINTER_COOL: 2,
    },
  })
  seasonScores: Record<string, number> | null;

  @Column({
    type: 'json',
    comment: '컬러 분포 데이터 (JSON)',
    nullable: true,
    example: { warm: 0.7, cool: 0.3 },
  })
  distribution: Record<string, unknown> | null;

  @Column({
    type: 'json',
    comment: '톤 분석 신호',
    nullable: true,
    example: {
      undertone: 'WARM',
      value: 'LIGHT',
      chroma: 'CLEAR',
      contrast: 'MEDIUM',
      canAnalyze: true,
      rejectionReasons: [],
    },
  })
  toneSignals: Record<string, unknown> | null;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '분석 시점 성별',
    nullable: true,
    example: 'FEMALE',
  })
  gender: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '분석 제공자',
    nullable: true,
    example: 'GEMINI',
  })
  analysisProvider: string | null;

  @Column({
    type: 'text',
    comment: '분석 오류 메시지',
    nullable: true,
    example: '얼굴 인식이 어렵습니다. 정면 사진으로 다시 시도해주세요.',
  })
  analysisError: string | null;
}
