import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizMaterialType } from '../enum/rn-tenant-cbiz-material.enum';

@Entity({
  name: 'rn_tenant_cbiz_material_group',
  comment: '자재 그룹 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizMaterialGroupEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '자재 그룹 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '자재 그룹 고유 아이디',
  })
  id: string;

  @Column({
    type: 'enum',
    comment: '자재 그룹 유형',
    nullable: false,
    default: RnTenantCbizMaterialType.MATERIAL,
    enum: RnTenantCbizMaterialType,
    example: '자재 그룹 유형["MATERIAL","SUB_MATERIAL","ETC"]',
  })
  type: RnTenantCbizMaterialType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '자재 그룹 이름',
    nullable: false,
    example: '자재 그룹 이름',
  })
  mtGroupName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '자재 그룹 코드',
    nullable: false,
    example: '자재 그룹 코드',
  })
  mtGroupCode: string;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  @Column({
    type: 'date',
    comment: '적용일',
    nullable: false,
    example: '적용일',
  })
  applyDate: Date;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    nullable: false,
    example: '사용여부',
    default: true,
  })
  useYn: boolean;
}
