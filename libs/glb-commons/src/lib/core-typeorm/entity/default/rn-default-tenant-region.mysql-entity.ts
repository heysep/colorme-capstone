import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 테넌트 리전 엔티티
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Entity({
  name: 'rn_tenant_region',
  comment: '테넌트 리전 정보 테이블',
  engine: 'InnoDB',
})
export class RnDefaultTenantRegionEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '테넌트 리전 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '테넌트 리전 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '테넌트 리전 이름',
    nullable: false,
    example: '테넌트 리전 이름',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '데이터베이스 주소',
    nullable: false,
    example: '데이터베이스 주소',
  })
  dbAddress: string;

  @Column({
    type: 'int',
    comment: '데이터베이스 포트',
    nullable: false,
    example: '데이터베이스 포트',
  })
  dbPort: number;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '데이터베이스 사용자 이름',
    nullable: false,
    example: '데이터베이스 사용자 이름',
  })
  dbUsername: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '데이터베이스 비밀번호',
    nullable: false,
    example: '데이터베이스 비밀번호',
  })
  dbPassword: string;
}
