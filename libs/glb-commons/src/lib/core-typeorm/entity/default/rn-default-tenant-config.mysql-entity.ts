import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultTenantEntity } from './rn-default-tenant.mysql-entity';

/**
 * 테넌트 설정 엔티티
 *
 * @author 최시훈
 * @since 2025-09-20
 */
@Entity({
  name: 'rn_tenant_config',
  comment: '테넌트 설정 테이블',
  engine: 'InnoDB',
})
export class RnDefaultTenantConfigEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '테넌트 설정 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '테넌트 설정 고유 아이디',
  })
  id: string;

  @ManyToOne(() => RnDefaultTenantEntity, (tenant) => tenant.configs, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '테넌트 외래키',
    type: () => RnDefaultTenantEntity,
  })
  @JoinColumn({
    name: 'tenantId',
    referencedColumnName: 'id',
  })
  // 테넌트 외래키
  tenant: RnDefaultTenantEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '테넌트 설정 키',
    index: true,
    example: '테넌트 설정 키',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '테넌트 설정 값',
    example: '테넌트 설정 값',
  })
  value: string;
}
