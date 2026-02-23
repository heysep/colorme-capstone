import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 기본 로그 엔티티
 *
 * @author 최시훈
 * @since 2025-02-23
 */
@Entity({
  name: 'rn_default_log_mx',
  comment: '기본 로그 테이블',
  engine: 'InnoDB',
})
export class RnDefaultLogMxEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '로그 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '로그 고유 아이디',
  })
  id: string;

  @Column({
    comment: '로그 레벨',
    nullable: true,
    type: 'varchar',
    length: 200,
    example: '로그 레벨',
  })
  level: string;

  @Column({
    comment: '컨텍스트 이름',
    nullable: true,
    type: 'varchar',
    length: 500,
    example: '컨텍스트 이름',
  })
  contextName: string;

  @Column({
    comment: '로그 메시지',
    nullable: true,
    type: 'mediumtext',
    example: '로그 메시지',
  })
  message: string;

  @Column({
    comment: '메서드 이름',
    nullable: true,
    type: 'varchar',
    length: 500,
    example: '메서드 이름',
  })
  method: string;

  @Column({
    comment: 'URL',
    nullable: true,
    type: 'text',
    example: 'URL',
  })
  url: string;

  @Column({
    comment: '상태 코드',
    nullable: true,
    type: 'varchar',
    length: 200,
    index: true,
    example: '상태 코드',
  })
  statusCode: number;

  @Column({
    comment: 'IP 주소',
    nullable: true,
    type: 'varchar',
    length: 500,
    example: 'IP 주소',
  })
  ip: string;

  @Column({
    comment: '사용자 에이전트',
    nullable: true,
    type: 'varchar',
    length: 500,
    example: '사용자 에이전트',
  })
  userAgent: string;

  @Column({
    comment: '사용자 아이디',
    nullable: true,
    type: 'varchar',
    length: 500,
    example: '사용자 아이디',
  })
  userId: string;

  @Column({
    comment: '결과 코드',
    nullable: true,
    type: 'varchar',
    length: 200,
    example: '결과 코드',
  })
  resultCode: string;

  @Column({
    comment: '테넌트 코드',
    nullable: true,
    type: 'varchar',
    length: 200,
    example: '테넌트 코드',
  })
  tenantCode: string;
}
