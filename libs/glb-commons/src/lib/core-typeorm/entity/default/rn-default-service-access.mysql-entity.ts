import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 기본 서비스 접근 제한 정보 설정 테이블
 *
 * @author 최시훈
 * @since 2025-10-01
 */
@Entity({
  name: 'rn_default_service_access',
  comment: 'CMS 서비스 접근 제한 정보 설정 테이블',
  engine: 'InnoDB',
})
export class RnDefaultServiceAccessEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '서비스 접근 제한 정보 설정 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '서비스 접근 제한 정보 설정 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '서비스 접근 제한 정보 설정 키',
    nullable: false,
    example: '서비스 접근 제한 정보 설정 키',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '서비스 접근 제한 정보 설정 값',
    nullable: false,
    example: '서비스 접근 제한 정보 설정 값',
  })
  value: string;
}
