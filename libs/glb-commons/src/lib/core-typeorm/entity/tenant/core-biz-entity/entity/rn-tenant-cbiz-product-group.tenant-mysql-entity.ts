import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizProductType } from '../enum/rn-tenant-cbiz-product.enum';

@Entity({
  name: 'rn_tenant_cbiz_product_group',
  comment: '제품 그룹 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizProductGroupEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 그룹 고유 아이디',
    example: '제품 그룹 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '제품 그룹 이름',
    example: '제품 그룹 이름',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    comment: '제품 그룹 유형["PRODUCT","PRODUCT_HALF","PRODUCT_IN_PROCESS"]',
    nullable: false,
    enum: RnTenantCbizProductType,
    example: '제품 그룹 유형["PRODUCT","PRODUCT_HALF","PRODUCT_IN_PROCESS"]',
  })
  type: RnTenantCbizProductType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '제품 그룹 코드',
    example: '제품 그룹 코드',
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
    comment: '연구 제품 그룹 여부',
    example: '연구 제품 그룹 여부',
    nullable: false,
    default: false,
  })
  researchYn: boolean;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    nullable: false,
  })
  useYn: boolean;

  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
  })
  ordNo: number;
}
