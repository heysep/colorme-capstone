import { Entity } from 'typeorm';
import { PrimaryColumn } from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_shipment',
  comment: '출고 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizShipmentEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '출고 고유 아이디',
    example: '출고 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;
}
