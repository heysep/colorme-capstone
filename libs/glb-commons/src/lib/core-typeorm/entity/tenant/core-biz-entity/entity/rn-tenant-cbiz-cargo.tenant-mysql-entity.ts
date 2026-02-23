import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizCargoType,
  RnTenantCbizCargoTypeFlag,
} from '../enum/rn-tenant-cbiz-cargo.enum';

@Entity({
  name: 'rn_tenant_cbiz_cargo',
  comment: '[기본정보] 기초정보-창고',
  engine: 'InnoDB',
})
export class RnTenantCbizCargoEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '창고 고유 아이디',
    example: '창고 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    comment: '창고 이름',
    example: '창고 이름',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  cargoName: string;

  @Column({
    comment: '창고 코드',
    example: '창고 코드',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  cargoCode: string;

  @Column({
    comment: '창고 개설일',
    example: '창고 개설일',
    type: 'date',
    nullable: false,
  })
  openDate: Date;

  @Column({
    comment: '순서',
    example: '순서',
    type: 'int',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  @Column({
    comment: '창고 적용일',
    example: '창고 적용일',
    type: 'date',
    nullable: false,
  })
  applyDate: Date;

  @Column({
    type: 'int',
    name: 'cargoTypes',
    default: 0,
    comment: '창고 유형',
    example: '창고 유형',
    nullable: true,
    transformer: {
      // DB로 보낼 때: 문자열 enum 배열 → 숫자 마스크
      to(types: RnTenantCbizCargoType[]): number {
        return (types || []).reduce(
          (mask, t) => mask | (RnTenantCbizCargoTypeFlag[t] ?? 0),
          0,
        );
      },
      // DB에서 꺼낼 때: 숫자 마스크 → 문자열 enum 배열
      from(mask: number): RnTenantCbizCargoType[] {
        return (
          Object.keys(RnTenantCbizCargoTypeFlag) as RnTenantCbizCargoType[]
        ).filter((t) => (mask & RnTenantCbizCargoTypeFlag[t]) !== 0);
      },
    },
  })
  cargoTypes: RnTenantCbizCargoType[];

  @Column({
    comment: '창고 사용 여부',
    example: '창고 사용 여부',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  useYn: boolean;
}
