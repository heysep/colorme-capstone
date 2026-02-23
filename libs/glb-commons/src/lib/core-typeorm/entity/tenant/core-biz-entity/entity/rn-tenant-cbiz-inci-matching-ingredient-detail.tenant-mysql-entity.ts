import { ApiProperty } from '@nestjs/swagger';
import { UUID_LENGTH } from 'libs/glb-commons/src/lib/utils-dto/default.utils';
import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnDefaultInciIngredientEntity } from '../../../default/rn-default-inci-ingredient.mysql-entity';
import { RnTenantCbizInciMatchingIngredientEntity } from './rn-tenant-cbiz-inci-matching-ingredient.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_matching_ingredient_detail',
  comment: '원료 매칭 성분 상세 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciMatchingIngredientDetailEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 매칭 성분 상세 고유 아이디',
    example: '원료 매칭 성분 상세 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(
    () => RnTenantCbizInciMatchingIngredientEntity,
    (matchingIngredient) => matchingIngredient.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizInciMatchingIngredientEntity,
      description: '원료 매칭 성분',
    },
  )
  @JoinColumn({
    name: 'matchingIngredientId',
    referencedColumnName: 'id',
  })
  matchingIngredient: RnTenantCbizInciMatchingIngredientEntity;

  @Column({
    type: 'varchar',
    length: UUID_LENGTH,
    comment: '성분코드 고유 아이디',
    example: '성분코드 고유 아이디',
  })
  ingredientId: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '매칭 비율',
    example: '매칭 비율',
    nullable: false,
    default: 0,
  })
  ratio: number;

  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  @ApiProperty({
    description: '성분코드',
    type: RnDefaultInciIngredientEntity,
  })
  ingredient: RnDefaultInciIngredientEntity;
}
