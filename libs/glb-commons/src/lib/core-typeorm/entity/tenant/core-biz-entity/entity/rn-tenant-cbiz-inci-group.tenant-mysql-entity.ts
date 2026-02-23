import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_group',
  comment: '원료 그룹 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciGroupEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 그룹 고유 아이디',
    example: '원료 그룹 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '형태',
  })
  @JoinColumn({
    name: 'typeId',
    referencedColumnName: 'id',
  })
  type: RnTenantCbizCodeEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '원료 그룹 이름',
    example: '원료 그룹 이름',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '원료 그룹 코드',
    example: '원료 그룹 코드',
    nullable: false,
  })
  code: string;

  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
    nullable: false,
  })
  applyDate: Date;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;
}
