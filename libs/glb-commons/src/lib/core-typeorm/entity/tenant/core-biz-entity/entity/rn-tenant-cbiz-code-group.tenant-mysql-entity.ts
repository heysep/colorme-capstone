import { Entity } from 'typeorm';
import {
  Column,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-공통코드그룹 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_code_group',
  comment: '[기본정보] 기초정보-공통코드그룹 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizCodeGroupEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '공통코드그룹 고유 아이디',
    example: '공통코드그룹 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '공통코드그룹명',
    example: '공통코드그룹명',
    nullable: false,
    unique: true,
  })
  codeGroupName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '공통코드그룹설명',
    example: '공통코드그룹설명',
    nullable: true,
  })
  codeGroupDesc: string;

  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: true,
    default: 0,
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    default: true,
  })
  useYn: boolean;

  @Column({
    type: 'date',
    comment: '적용일자',
    example: '적용일자',
    nullable: true,
  })
  applyDate: Date;

  // ------------------------------
  // 코드 목록
  // ------------------------------
  @OneToMany(() => RnTenantCbizCodeEntity, (code) => code.codeGroup, {
    type: () => RnTenantCbizCodeEntity,
  })
  codes: RnTenantCbizCodeEntity[];
}
