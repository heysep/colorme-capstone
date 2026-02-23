import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultInciIngredientEntity } from './rn-default-inci-ingredient.mysql-entity';

@Entity({
  name: 'rn_default_inci_ingredient_history',
  comment: '성분코드 변경 이력 테이블',
  engine: 'InnoDB',
})
export class RnDefaultInciIngredientHistoryEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '성분코드 변경 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '성분코드 변경 이력 고유 아이디',
  })
  id: string;

  @ManyToOne(
    () => RnDefaultInciIngredientEntity,
    (ingredient) => ingredient.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      description: '성분코드 정보',
      type: () => RnDefaultInciIngredientEntity,
    },
  )
  @JoinColumn({
    name: 'ingredientId',
    referencedColumnName: 'id',
  })
  ingredient: RnDefaultInciIngredientEntity;

  // 변경 이력 JSON
  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    nullable: true,
  })
  changeHistory: any;
}
