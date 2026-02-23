import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from './rn-tenant-employee-account.tenant-mysql-entity';

/**
 * 테넌트 메뉴 권한 테이블
 * 테넌트 사용자별 메뉴 권한 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_tenant_permission_by_menu',
  comment: '테넌트 메뉴 권한 테이블',
  engine: 'InnoDB',
})
export class RnTenantPermissionByMenuEntity extends RnBaseBaseMysqlEntity {
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

  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      description: '직원 계정',
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '메뉴 원본 명',
    example: '메뉴 원본 명',
  })
  menuOriginName: string;

  // 읽기 권한 부여 여부
  @Column({
    type: 'boolean',
    comment: '읽기 권한 부여 여부',
    default: false,
    example: '읽기 권한 부여 여부',
  })
  permissionReadYn: boolean;

  // 생성 권한 부여 여부
  @Column({
    type: 'boolean',
    comment: '생성 권한 부여 여부',
    default: false,
    example: '생성 권한 부여 여부',
  })
  permissionCreateYn: boolean;

  // 삭제 권한 부여 여부
  @Column({
    type: 'boolean',
    comment: '삭제 권한 부여 여부',
    default: false,
    example: '삭제 권한 부여 여부',
  })
  permissionDeleteYn: boolean;

  // 수정 권한 부여 여부
  @Column({
    type: 'boolean',
    comment: '수정 권한 부여 여부',
    default: false,
    example: '수정 권한 부여 여부',
  })
  permissionUpdateYn: boolean;
}
