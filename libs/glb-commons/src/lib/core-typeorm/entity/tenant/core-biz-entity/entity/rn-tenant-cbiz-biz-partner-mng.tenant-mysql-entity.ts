import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';

/**
 * [기본정보] 기초정보-거래처 담당자 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_biz_partner_manager',
  comment: '[기본정보] 기초정보-거래처 담당자 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizBizPartnerManagerEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '거래처 담당자 고유 아이디',
    example: '거래처 담당자 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // ------------------------------
  // 거래처 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizBizPartnerEntity, (prt) => prt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizBizPartnerEntity,
    description: '거래처 정보',
  })
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  prt: RnTenantCbizBizPartnerEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '담당자명',
    example: '담당자명',
    nullable: false,
    index: true,
  })
  prtMngNm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '부서명',
    example: '부서명',
    nullable: true,
  })
  prtMngDeptNm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '팀명',
    example: '팀명',
    nullable: true,
  })
  prtMngTeamNm: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '전화번호',
    example: '전화번호',
    nullable: true,
  })
  prtMngTel: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '핸드폰번호',
    example: '핸드폰번호',
    nullable: true,
  })
  prtMngMobile: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '팩스번호',
    example: '팩스번호',
    nullable: true,
  })
  prtMngFax: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '이메일',
    example: '이메일',
    nullable: true,
  })
  prtMngEmail: string;

  @Column({
    type: 'date',
    comment: '적용일',
    example: '적용일',
    nullable: true,
  })
  applyDate: Date;

  @Column({
    type: 'int',
    comment: '거래처 담당자 순서',
    example: '거래처 담당자 순서',
    nullable: true,
    default: 0,
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '거래처 담당자 사용 여부',
    example: '거래처 담당자 사용 여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;
}
