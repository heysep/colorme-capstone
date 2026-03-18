import { Entity } from 'typeorm';
import {
  Column,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

export enum PcCatalogItemType {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  ACCESSORY = 'ACCESSORY',
}

@Entity({
  name: 'rn_default_pc_catalog_item',
  comment: '퍼스널 컬러 의상 카탈로그 아이템',
  engine: 'InnoDB',
})
export class RnDefaultPcCatalogItemEntity extends RnBaseBaseMysqlEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: '카탈로그 아이템 고유 ID',
    example: 1,
  })
  id: number;

  @Column({
    type: 'enum',
    enum: PcCatalogItemType,
    comment: '카탈로그 아이템 유형',
    nullable: false,
    example: PcCatalogItemType.TOP,
  })
  itemType: PcCatalogItemType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '카탈로그 아이템 이름',
    nullable: false,
    example: '코랄 블라우스',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '카탈로그 이미지 파일 ID',
    nullable: false,
    example: 'upload-file-id',
  })
  imageFileId: string;

  @Column({
    type: 'json',
    comment: '이미지 파싱 속성',
    nullable: true,
    example: {
      sleeve: 'LONG',
      fit: 'REGULAR',
    },
  })
  parsedAttributes: Record<string, unknown> | null;

  @Column({
    type: 'json',
    comment: '추천 시즌 코드 목록',
    nullable: true,
    example: ['SPRING_WARM', 'AUTUMN_WARM'],
  })
  recommendedSeasons: string[] | null;

  @Column({
    type: 'json',
    comment: '추천 성별 목록',
    nullable: true,
    example: ['FEMALE', 'UNISEX'],
  })
  recommendedGenders: string[] | null;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '대표 색상 HEX',
    nullable: true,
    example: '#FF7F50',
  })
  dominantColorHex: string | null;

  @Column({
    type: 'json',
    comment: '스타일 태그',
    nullable: true,
    example: ['romantic', 'soft'],
  })
  styleTags: string[] | null;

  @Column({
    type: 'boolean',
    comment: '활성 여부',
    nullable: false,
    default: true,
    example: true,
  })
  activeYn: boolean;

  @Column({
    type: 'int',
    comment: '정렬 순서',
    nullable: false,
    default: 0,
    example: 0,
  })
  sortNo: number;
}
