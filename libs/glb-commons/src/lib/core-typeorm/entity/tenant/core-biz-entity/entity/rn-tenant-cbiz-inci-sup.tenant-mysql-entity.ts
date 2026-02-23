import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizBizPartnerEntity } from './rn-tenant-cbiz-biz-partner.tenant-mysql-entity';
import { RnTenantCbizInciEntity } from './rn-tenant-cbiz-inci.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_inci_sup',
  comment: '원료 구매처 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizInciSupEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '원료 구매처 고유 아이디',
    example: '원료 구매처 고유 아이디',
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

  @ManyToOne(
    () => RnTenantCbizBizPartnerEntity,
    (bizPartner) => bizPartner.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizBizPartnerEntity,
      description: '거래처',
    },
  )
  @JoinColumn({
    name: 'prtId',
    referencedColumnName: 'id',
  })
  prt: RnTenantCbizBizPartnerEntity;

  @Column({
    type: 'int',
    comment: '순서',
    example: '순서',
    nullable: false,
    default: 0,
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    example: '사용여부',
    nullable: false,
    default: true,
  })
  useYn: boolean;

  @Column({
    type: 'date',
    comment: '적용 일시',
    example: '적용 일시',
    nullable: true,
  })
  applyDate: Date | null;
}
