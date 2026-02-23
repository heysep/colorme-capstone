import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciSupEntity } from './rn-tenant-cbiz-inci-sup.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_price',
  comment: '원료 단가 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciPriceEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 단가 고유 아이디',
    example: '원료 단가 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizInciSupEntity, (inciSup) => inciSup.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciSupEntity,
    description: '원료 구매처',
  })
  @JoinColumn({
    name: 'inciSupId',
    referencedColumnName: 'id',
  })
  inciSup: RnTenantCbizInciSupEntity;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '이전 단가',
    example: '이전 단가',
    nullable: true,
    default: 0,
  })
  priceUnitBefore: number | null;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '이후 단가',
    example: '이후 단가',
    nullable: false,
    default: 0,
  })
  priceUnitAfter: number;

  @Column({
    type: 'date',
    comment: '이전 단가 적용일',
    example: '이전 단가 적용일',
    nullable: true,
    default: null,
  })
  priceUnitApplyDateBefore: Date | null;

  @Column({
    type: 'date',
    comment: '이후 단가 적용일',
    example: '이후 단가 적용일',
    nullable: true,
    default: null,
  })
  priceUnitApplyDateAfter: Date;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '단가 규격',
    example: '단가 규격',
    nullable: false,
  })
  priceSpec: string;

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

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;
}
