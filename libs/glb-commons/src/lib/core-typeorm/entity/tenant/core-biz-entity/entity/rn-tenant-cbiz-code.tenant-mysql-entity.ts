import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizCodeGroupEntity } from './rn-tenant-cbiz-code-group.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-공통코드 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_code',
  comment: '[기본정보] 기초정보-공통코드 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizCodeEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '공통코드 고유 아이디',
    example: '공통코드 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // ------------------------------
  // 공통코드그룹 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizCodeGroupEntity, (codeGroup) => codeGroup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '공통코드그룹 정보',
    type: () => RnTenantCbizCodeGroupEntity,
  })
  @JoinColumn({
    name: 'codeGroupId',
    referencedColumnName: 'id',
  })
  codeGroup: RnTenantCbizCodeGroupEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '공통코드명',
    example: '공통코드명',
    nullable: true,
    index: true,
  })
  codeName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '공통코드설명',
    example: '공통코드설명',
    nullable: true,
  })
  codeDesc: string;

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
}
