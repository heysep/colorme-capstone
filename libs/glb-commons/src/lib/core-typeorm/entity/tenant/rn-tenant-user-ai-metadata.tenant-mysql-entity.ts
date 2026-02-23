import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from './rn-tenant-employee-account.tenant-mysql-entity';

/**
 * 테넌트 사용자 AI 메타데이터 테이블
 * 사용자 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_tenant_user_ai_metadata',
  comment: '테넌트 사용자 AI 메타데이터 테이블',
  engine: 'InnoDB',
})
export class RnTenantUserAiMetadataEntity extends RnBaseBaseMysqlEntity {
  /**
   * 테넌트 사용자 AI 메타데이터 고유 아이디
   */
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '테넌트 사용자 AI 메타데이터 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '테넌트 사용자 AI 메타데이터 고유 아이디',
  })
  id: string;

  // ------------------------------
  // 직원 계정
  // ------------------------------
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
    type: 'int',
    comment: '사용가능 토큰량',
    nullable: false,
    example: '사용가능 토큰량',
  })
  availableToken: number;

  // 사용 토큰량
  @Column({
    type: 'int',
    comment: '사용 토큰량',
    nullable: false,
    example: '사용 토큰량',
  })
  usedToken: number;

  // 토큰 사용량 초기화 날짜
  @Column({
    type: 'datetime',
    comment: '토큰 사용량 초기화 날짜',
    nullable: true,
    example: '토큰 사용량 초기화 날짜',
  })
  tokenUsageResetAt?: Date;
}
