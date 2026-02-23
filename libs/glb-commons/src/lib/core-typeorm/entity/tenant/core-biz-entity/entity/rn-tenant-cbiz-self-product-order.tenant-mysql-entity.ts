import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantCbizSelfProductOrderStatusType } from '../enum/rn-tenant-cbiz-self-product-order.enum';
import { RnTenantCbizCodeEntity } from './rn-tenant-cbiz-code.tenant-mysql-entity';
import { RnTenantCbizProductEntity } from './rn-tenant-cbiz-product.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_self_product_order',
  comment: '자체 제품 수주 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizSelfProductOrderEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '자체 제품 수주 고유 아이디',
    example: '자체 제품 수주 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizSelfProductOrderStatusType,
    comment:
      '상태["WAITING","PRODUCTION_WAIT","PRODUCTION","PARTIAL_PRODUCTION","SHIPMENT_WAIT","PARTIAL_SHIPMENT","SHIPMENT","DISCARD"]',
    example:
      '상태["WAITING","PRODUCTION_WAIT","PRODUCTION","PARTIAL_PRODUCTION","SHIPMENT_WAIT","PARTIAL_SHIPMENT","SHIPMENT","DISCARD"]',
    nullable: false,
  })
  status: RnTenantCbizSelfProductOrderStatusType;

  // 제품
  @ManyToOne(() => RnTenantCbizProductEntity, (prd) => prd.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizProductEntity,
    description: '제품',
  })
  @JoinColumn({
    name: 'prdId',
    referencedColumnName: 'id',
  })
  prd: RnTenantCbizProductEntity;

  // 생산 예정일
  @Column({
    type: 'date',
    comment: '생산 예정일',
    example: '생산 예정일',
    nullable: false,
  })
  productionDate: Date;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '생산량',
    example: '생산량',
    nullable: false,
  })
  productionQuantity: number;

  @ManyToOne(() => RnTenantCbizCodeEntity, (code) => code.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizCodeEntity,
    description: '단위',
  })
  @JoinColumn({
    name: 'unitId',
    referencedColumnName: 'id',
  })
  unit: RnTenantCbizCodeEntity;

  // 총 생산량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '총 생산량',
    example: '총 생산량',
    nullable: false,
  })
  totalProductionQuantity: number;

  // 총 생산 계획량
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 5,
    comment: '총 생산 계획량',
    example: '총 생산 계획량',
    nullable: false,
  })
  totalProductionPlanQuantity: number;
}
