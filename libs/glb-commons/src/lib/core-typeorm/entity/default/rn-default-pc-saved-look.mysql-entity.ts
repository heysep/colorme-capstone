import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultPcAnalysisEntity } from './rn-default-pc-analysis.mysql-entity';
import { RnDefaultPcUserEntity } from './rn-default-pc-user.mysql-entity';

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
    type: 'text',
    comment: '저장 룩 설명/메모',
    nullable: true,
    example: '겨울 코트 가상 피팅 결과',
  })
  description: string | null;
}
