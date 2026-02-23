import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 테넌트 권한 테이블
 * 권한 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_tenant_permission',
  comment: '테넌트 권한 테이블',
  engine: 'InnoDB',
})
export class RnTenantPermissionEntity extends RnBaseBaseMysqlEntity {
  /**
   * 권한 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '권한 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '권한 고유 아이디',
  })
  id: string;

  /**
   * 권한 이름
   */
  @Column({
    type: 'varchar',
    length: 500,
    comment: '권한 이름',
    nullable: false,
    example: '권한 이름',
  })
  name: string;

  /**
   * 권한 설명
   */
  @Column({
    type: 'varchar',
    length: 255,
    comment: '권한 설명',
    nullable: false,
    example: '권한 설명',
  })
  description: string;
}
