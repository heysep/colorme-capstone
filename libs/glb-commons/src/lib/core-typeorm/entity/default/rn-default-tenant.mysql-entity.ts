import { Entity } from 'typeorm';
import {
  Column,
  OneToMany,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultTenantConfigEntity } from './rn-default-tenant-config.mysql-entity';

/**
 * 테넌트 기본 엔티티
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Entity({
  name: 'rn_tenant',
  comment: '테넌트 정보 테이블',
  engine: 'InnoDB',
})
export class RnDefaultTenantEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '테넌트 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '테넌트 고유 아이디',
  })
  id?: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '리전 설정 값',
    nullable: false,
    example: '리전 설정 값',
  })
  regionConfig?: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '테넌트 이름',
    nullable: false,
    example: '테넌트 이름',
  })
  name?: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '테넌트 코드',
    nullable: false,
    index: true,
    example: '테넌트 코드',
  })
  code?: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '데이터베이스 이름',
    nullable: false,
    index: true,
    example: '데이터베이스 이름',
  })
  dbName?: string;

  @Column({
    type: 'varchar',
    length: 60,
    comment: '테넌트별 도메인 이름',
    nullable: false,
    default: 'default',
    index: true,
    example: '테넌트별 도메인 이름',
  })
  domainName?: string;

  @OneToMany(() => RnDefaultTenantConfigEntity, (config) => config.tenant, {
    description: '테넌트 설정 목록',
    type: () => RnDefaultTenantConfigEntity,
  })
  configs: RnDefaultTenantConfigEntity[];
}
