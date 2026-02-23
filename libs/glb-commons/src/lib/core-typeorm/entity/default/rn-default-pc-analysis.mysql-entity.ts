import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultPersonalColorEntity } from './rn-default-personal-color.mysql-entity';
import { RnDefaultPcUserEntity } from './rn-default-pc-user.mysql-entity';

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
  })
  @JoinColumn({
    name: 'personalColorId',
    referencedColumnName: 'id',
  })
  personalColor: RnDefaultPersonalColorEntity;

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
    type: 'json',
    comment: '컬러 분포 데이터 (JSON)',
    nullable: true,
    example: { warm: 0.7, cool: 0.3 },
  })
  distribution: Record<string, unknown> | null;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '분석 시점 성별',
    nullable: true,
    example: 'FEMALE',
  })
  gender: string | null;
}
