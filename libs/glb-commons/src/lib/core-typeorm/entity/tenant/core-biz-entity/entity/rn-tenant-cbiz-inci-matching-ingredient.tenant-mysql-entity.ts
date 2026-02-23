import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizInciMatchingIngredientDetailEntity } from './rn-tenant-cbiz-inci-matching-ingredient-detail.tenant-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_matching_ingredient',
  comment: '원료 매칭 성분 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciMatchingIngredientEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 매칭 성분 고유 아이디',
    example: '원료 매칭 성분 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizInciEntity, (inci) => inci.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizInciEntity,
    description: '원료',
  })
  @JoinColumn({
    name: 'inciId',
    referencedColumnName: 'id',
  })
  inci: RnTenantCbizInciEntity;

  @OneToMany(
    () => RnTenantCbizInciMatchingIngredientDetailEntity,
    (detail) => detail.matchingIngredient,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizInciMatchingIngredientDetailEntity,
      description: '원료 매칭 성분 상세',
      exampleType: 'entity',
    },
  )
  details: RnTenantCbizInciMatchingIngredientDetailEntity[];

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
