import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 테넌트 직원 계정 상태
 */
export enum RnTenantEmployeeAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * 테넌트 직원 계정 테이블
 * 직원 계정 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_tenant_employee_account',
  comment: '테넌트 직원 계정 테이블',
  engine: 'InnoDB',
})
export class RnTenantEmployeeAccountEntity extends RnBaseBaseMysqlEntity {
  /**
   * 직원 계정 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '직원 계정 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '직원 계정 고유 아이디',
  })
  id: string;

  /**
   * 직원 계정 아이디
   */
  @Column({
    type: 'varchar',
    length: 100,
    comment: '직원 계정 아이디',
    nullable: false,
    index: true,
    example: '직원 계정 아이디',
  })
  userId: string;

  /*
   * 직원 계정 이름
   */
  @Column({
    type: 'varchar',
    length: 100,
    comment: '직원 계정 이름',
    nullable: false,
    example: '직원 계정 이름',
  })
  name: string;

  // ------------------------------
  /**
   * 직원 계정 비밀번호
   */
  @Column({
    type: 'varchar',
    length: 150,
    comment: '직원 계정 비밀번호',
    nullable: false,
    example: '직원 계정 비밀번호',
  })
  passwordEncrypted: string;

  /**
   * 직원 계정 비밀번호 salt
   */
  @Column({
    type: 'varchar',
    length: 25,
    comment: '직원 계정 비밀번호 salt',
    nullable: false,
    example: '직원 계정 비밀번호 salt',
  })
  passwordSalt: string;
  // ------------------------------

  /**
   * 직원 계정 상태
   */
  @Column({
    type: 'enum',
    enum: RnTenantEmployeeAccountStatus,
    comment: '직원 계정 상태["ACTIVE","INACTIVE","SUSPENDED","DELETED"]',
    nullable: false,
    default: RnTenantEmployeeAccountStatus.ACTIVE,
    example: '직원 계정 상태["ACTIVE","INACTIVE","SUSPENDED","DELETED"]',
  })
  status: RnTenantEmployeeAccountStatus;

  /**
   * 직원 계정 마지막 로그인 일시
   */
  @Column({
    type: 'datetime',
    comment: '직원 계정 마지막 로그인 일시',
    nullable: true,
    example: '직원 계정 마지막 로그인 일시',
  })
  lastLoginAt?: Date;

  // ------------------------------
  // 역할
  // ------------------------------
  // @ManyToOne(() => RnTenantRoleEntity, (role) => role.employeeAccounts, {
  //   onDelete: 'SET NULL',
  //   onUpdate: 'SET NULL',
  //   description: '역할',
  //   type: () => RnTenantRoleEntity,
  // })
  // @JoinColumn({
  //   name: 'roleId',
  //   referencedColumnName: 'id',
  // })
  // role: RnTenantRoleEntity;
}
