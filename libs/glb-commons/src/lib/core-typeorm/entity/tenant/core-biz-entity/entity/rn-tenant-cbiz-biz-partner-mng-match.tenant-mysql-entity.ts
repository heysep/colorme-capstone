import { Entity, JoinColumn } from 'typeorm';
import {
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizBizPartnerManagerEntity } from './rn-tenant-cbiz-biz-partner-mng.tenant-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';

/**
 * 거래처 관리자 매핑 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_biz_partner_mng_match',
  comment: '거래처 관리자 매핑 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizBizPartnerMngMatchEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '거래처 관리자 매핑 고유 아이디',
    example: '거래처 관리자 매핑 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(() => RnTenantCbizBizPartnerEntity, (prt) => prt.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizBizPartnerEntity,
    description: '거래처',
  })
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  // 거래처
  prt: RnTenantCbizBizPartnerEntity;

  @ManyToOne(() => RnTenantCbizBizPartnerManagerEntity, (mng) => mng.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizBizPartnerManagerEntity,
    description: '거래처 관리자',
  })
  @JoinColumn({
    name: 'mngId',
    referencedColumnName: 'id',
  })
  // 거래처 관리자
  mng: RnTenantCbizBizPartnerManagerEntity;
}
