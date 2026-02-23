import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 사용자 상태
 */
export enum RnDefaultUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * 기본 사용자 테이블
 * 사용자 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_default_root_user',
  comment: 'CMS 루트 사용자 테이블',
  engine: 'InnoDB',
})
export class RnDefaultRootUserEntity extends RnBaseBaseMysqlEntity {
  /**
   * 사용자 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '사용자 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '사용자 고유 아이디',
  })
  id: string;

  /**
   * 사용자 이름
   */
  @Column({
    type: 'varchar',
    length: 100,
    comment: '사용자 이름',
    nullable: false,
    example: '사용자 이름',
  })
  name: string;

  /**
   * 사용자 아이디
   */
  @Column({
    type: 'varchar',
    length: 100,
    comment: '사용자 아이디',
    nullable: false,
    example: '사용자 아이디',
  })
  userId: string;

  // ------------------------------
  /**
   * 사용자 비밀번호
   */
  @Column({
    type: 'varchar',
    length: 150,
    comment: '사용자 비밀번호',
    nullable: false,
    example: '사용자 비밀번호',
  })
  passwordEncrypted: string;

  /**
   * 사용자 비밀번호 salt
   */
  @Column({
    type: 'varchar',
    length: 25,
    comment: '사용자 비밀번호 salt',
    nullable: false,
    example: '사용자 비밀번호 salt',
  })
  passwordSalt: string;
  // ------------------------------

  /**
   * 사용자 상태
   */
  @Column({
    type: 'enum',
    enum: RnDefaultUserStatus,
    comment: '사용자 상태',
    nullable: false,
    default: RnDefaultUserStatus.ACTIVE,
    example: '사용자 상태',
  })
  status: RnDefaultUserStatus;

  /**
   * 사용자 마지막 로그인 일시
   */
  @Column({
    type: 'datetime',
    comment: '사용자 마지막 로그인 일시',
    nullable: true,
    example: '사용자 마지막 로그인 일시',
  })
  lastLoginAt?: Date;
}
