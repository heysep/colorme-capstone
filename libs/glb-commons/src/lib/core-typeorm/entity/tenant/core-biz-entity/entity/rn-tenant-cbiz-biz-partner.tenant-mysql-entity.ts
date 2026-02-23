import { Entity } from 'typeorm';
import {
  Column,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizBizPartnerType,
  RnTenantCbizBizPartnerTypeFlag,
} from '../enum/rn-tenant-cbiz-biz-partner.enum';
import { RnTenantCbizBizPartnerManagerEntity } from './rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-거래처 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_biz_partner',
  comment: '[기본정보] 기초정보-거래처 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizBizPartnerEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '거래처 고유 아이디',
    example: '거래처 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @Column({
    type: 'int',
    name: 'prtTypes',
    default: 0,
    comment: '거래처 유형',
    example: '거래처 유형',
    nullable: true,
    transformer: {
      // DB로 보낼 때: 문자열 enum 배열 → 숫자 마스크
      to(types: RnTenantCbizBizPartnerType[]): number {
        return (types || []).reduce(
          (mask, t) => mask | (RnTenantCbizBizPartnerTypeFlag[t] ?? 0),
          0,
        );
      },
      // DB에서 꺼낼 때: 숫자 마스크 → 문자열 enum 배열
      from(mask: number): RnTenantCbizBizPartnerType[] {
        return (
          Object.keys(
            RnTenantCbizBizPartnerTypeFlag,
          ) as RnTenantCbizBizPartnerType[]
        ).filter((t) => (mask & RnTenantCbizBizPartnerTypeFlag[t]) !== 0);
      },
    },
  })
  prtTypes: RnTenantCbizBizPartnerType[];

  @Column({
    type: 'varchar',
    length: 50,
    comment: '거래처명',
    example: '거래처명',
    nullable: false,
    index: true,
  })
  prtNm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '거래처식별코드',
    example: '거래처식별코드',
    nullable: true,
    index: true,
  })
  prtCd: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '거래처 축약명',
    example: '거래처 축약명',
    nullable: true,
  })
  prtSnm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '거래처 영문명',
    example: '거래처 영문명',
    nullable: true,
  })
  prtEngNm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '거래처 영문 축약명',
    example: '거래처 영문 축약명',
    nullable: true,
  })
  prtEngSnm: string;

  @Column({
    type: 'varchar',
    length: 12,
    comment: '사업자등록번호(형식 000-00-00000)',
    example: '사업자등록번호(형식 000-00-00000)',
    nullable: true,
  })
  prtRegNo: string;

  @Column({
    type: 'varchar',
    length: 14,
    comment: '법인등록번호(형식 00000-0000000)',
    example: '법인등록번호(형식 00000-0000000)',
    nullable: true,
  })
  prtCorpRegNo: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '업태(예 - 정보통신업)',
    example: '업태(예 - 정보통신업)',
    nullable: true,
  })
  prtBizType: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '업종(예 - 소프트웨어개발 및 공급)',
    example: '업종(예 - 소프트웨어개발 및 공급)',
    nullable: true,
  })
  prtBizCate: string;

  @Column({
    type: 'varchar',
    length: 250,
    comment: '주소',
    example: '주소',
    nullable: true,
  })
  prtAddr: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '상세주소',
    example: '상세주소',
    nullable: true,
  })
  prtAddrDtl: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '우편번호',
    example: '우편번호',
    nullable: true,
  })
  prtZip: string;

  @Column({
    type: 'varchar',
    length: 25,
    comment: '대표자명',
    example: '대표자명',
    nullable: true,
  })
  prtCeo: string;

  @Column({
    type: 'varchar',
    length: 15,
    comment: '전화번호',
    example: '전화번호',
    nullable: true,
  })
  prtTel: string;

  @Column({
    type: 'varchar',
    length: 15,
    comment: '팩스번호',
    example: '팩스번호',
    nullable: true,
  })
  prtFax: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '이메일',
    example: '이메일',
    nullable: true,
  })
  prtEmail: string;

  @Column({
    type: 'boolean',
    comment: '거래처 사용 여부',
    example: '거래처 사용 여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;

  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
    nullable: true,
  })
  applyDate: Date;

  @Column({
    type: 'int',
    comment: '거래처 순서',
    example: '거래처 순서',
    nullable: true,
    default: 0,
  })
  ordNo: number;

  /**
   * 거래처 담당자 목록
   */
  @OneToMany(() => RnTenantCbizBizPartnerManagerEntity, (mng) => mng.prt, {
    type: () => RnTenantCbizBizPartnerManagerEntity,
  })
  managers: RnTenantCbizBizPartnerManagerEntity[];
}
