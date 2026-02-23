import { Entity, Index } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

@Entity({
  name: 'rn_default_inci_ingredient',
  comment: '재료 테이블(성분코드 테이블)',
  engine: 'InnoDB',
})
@Index('cas_number_version', ['casNumber', 'version'])
export class RnDefaultInciIngredientEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '성분코드 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '성분코드 고유 아이디',
  })
  id: string;

  // verseion
  @Column({
    type: 'int',
    comment: '버전',
    nullable: false,
    example: '버전',
    default: 0,
  })
  version: number;

  // 성분코드
  @Column({
    type: 'varchar',
    length: 50,
    comment: '성분코드',
    nullable: false,
    example: '성분코드',
  })
  ingredientCode: string;

  // 성분명
  @Column({
    type: 'varchar',
    length: 50,
    comment: '성분명',
    nullable: false,
    example: '성분명',
  })
  ingredientName: string;

  // 영문명
  @Column({
    type: 'varchar',
    length: 50,
    comment: '영문명',
    nullable: false,
    example: '영문명',
  })
  englishName: string;

  // CAS 번호
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'CAS 번호',
    nullable: false,
    example: 'CAS 번호',
  })
  casNumber: string;

  // 구명칭
  @Column({
    type: 'varchar',
    length: 50,
    comment: '구명칭',
    nullable: false,
    example: '구명칭',
  })
  tradeName: string;

  // 배합 목적
  @Column({
    type: 'varchar',
    length: 500,
    comment: '배합 목적',
    nullable: false,
    example: '배합 목적',
  })
  blendPurpose: string;

  // 기원 및 정의
  @Column({
    type: 'text',
    comment: '기원 및 정의',
    nullable: false,
    example: '기원 및 정의',
  })
  originAndDefinition: string;

  // 최종 업데이트
  @Column({
    type: 'datetime',
    comment: '최종 업데이트',
    nullable: false,
    example: '최종 업데이트',
  })
  lastUpdatedAt: Date;

  // 사용여부
  @Column({
    type: 'boolean',
    comment: '사용여부',
    nullable: false,
    default: true,
    example: '사용여부',
  })
  useYn: boolean;
}
