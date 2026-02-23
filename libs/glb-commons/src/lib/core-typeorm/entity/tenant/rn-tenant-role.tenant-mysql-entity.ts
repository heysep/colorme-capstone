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
  name: 'rn_tenant_role',
  comment: '테넌트 역할 테이블',
  engine: 'InnoDB',
})
export class RnTenantRoleEntity extends RnBaseBaseMysqlEntity {
  /**
   * 역할 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '역할 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '역할 고유 아이디',
  })
  id: string;

  /**
   * 역할 이름
   */
  @Column({
    type: 'varchar',
    length: 50,
    comment: '역할 이름',
    nullable: false,
    example: '역할 이름',
  })
  name: string;

  /**
   * 권한 설명
   */
  @Column({
    type: 'varchar',
    length: 255,
    comment: '역할 설명',
    nullable: false,
    example: '역할 설명',
  })
  description: string;

  // ------------------------------
  // 직원 계정 리스트
  // ------------------------------
  // @OneToMany(() => RnTenantEmployeeAccountEntity, (employeeAccount) => employeeAccount.role, {
  //   eager: false,
  //   onDelete: 'SET NULL',
  //   onUpdate: 'SET NULL',
  //   description: '직원 계정 리스트',
  //   type: () => RnTenantEmployeeAccountEntity,
  // })
  // employeeAccounts: RnTenantEmployeeAccountEntity[];
}
