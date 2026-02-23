import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizProductManufactureHistoryEntity } from './rn-tenant-cbiz-product-manufacture-history.tenant-mysql-entity';
import { RnTenantCbizResearchProductManufactureEntity } from './rn-tenant-cbiz-research-product-manufacture.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_research_prd_manufacture_history',
  comment: '제품 제조 이력 테이블 (연구용)',
  engine: 'InnoDB',
})
export class RnTenantCbizResearchProductManufactureHistoryEntity
  extends RnBaseBaseMysqlEntity
  implements Omit<RnTenantCbizProductManufactureHistoryEntity, 'prdManufacture'>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '제품 제조 이력 고유 아이디',
    example: '제품 제조 이력 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  @ManyToOne(
    () => RnTenantCbizResearchProductManufactureEntity,
    (prdManufacture) => prdManufacture.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantCbizResearchProductManufactureEntity,
      description: '제품',
    },
  )
  @JoinColumn({
    name: 'prdManufactureId',
    referencedColumnName: 'id',
  })
  prdManufacture: RnTenantCbizResearchProductManufactureEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '변경 이력 얼리어스',
    example: '변경 이력 얼리어스',
    nullable: true,
  })
  changeHistoryAlias: string;

  @Column({
    type: 'json',
    comment: '변경 이력 JSON',
    example: '변경 이력 JSON',
    nullable: true,
  })
  changeHistory: any;

  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
      description: '직원 계정',
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  employeeAccount: RnTenantEmployeeAccountEntity;
}
