import { Entity } from 'typeorm';
import {
  Column,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 퍼스널 컬러 톤 마스터 엔티티
 * (예: Spring Warm, Summer Cool)
 *
 * @author YOSEB
 */
@Entity({
  name: 'rn_default_personal_color',
  comment: '퍼스널 컬러 톤 마스터 테이블',
  engine: 'InnoDB',
})
export class RnDefaultPersonalColorEntity extends RnBaseBaseMysqlEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: '퍼스널 컬러 톤 고유 ID',
    example: 1,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '톤 명',
    nullable: false,
    example: 'Spring Warm',
  })
  seasonName: string;

  @Column({
    type: 'text',
    comment: '톤 설명 설명',
    nullable: true,
    example: '봄 웜톤인 이유 설명',
  })
  description: string | null;
}
