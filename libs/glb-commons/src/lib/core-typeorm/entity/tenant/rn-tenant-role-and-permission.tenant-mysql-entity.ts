import { Entity, JoinColumn } from 'typeorm';
import { ManyToOne, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnTenantRoleEntity } from './rn-tenant-role.tenant-mysql-entity';
import { RnTenantPermissionEntity } from './rn-tenant-permission.tenant-mysql-entity';

/**
 * 테넌트 권한 테이블
 * 권한 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_tenant_role_and_permission',
  comment: '테넌트 역할 및 권한 테이블',
  engine: 'InnoDB',
})
export class RnTenantRoleAndPermissionEntity extends RnBaseBaseMysqlEntity {
  /**
   * 역할 및 권한 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '역할 및 권한 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '역할 및 권한 고유 아이디',
  })
  id: string;

  // ------------------------------
  // 역할
  // ------------------------------
  @ManyToOne(
    () => RnTenantRoleEntity,
    (role) => role.id,
    {
      eager: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      description: '역할',
      type: () => RnTenantRoleEntity,
    }
  )
  @JoinColumn({
    name: 'roleId',
    referencedColumnName: 'id',
  })
  role: RnTenantRoleEntity;

  // ------------------------------
  // 권한
  // ------------------------------
  @ManyToOne(
    () => RnTenantPermissionEntity,
    (permission) => permission.id,
    {
      eager: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      description: '권한',
      type: () => RnTenantPermissionEntity,
    }
  )
  @JoinColumn({
    name: 'permissionId',
    referencedColumnName: 'id',
  })
  permission: RnTenantPermissionEntity;
}
