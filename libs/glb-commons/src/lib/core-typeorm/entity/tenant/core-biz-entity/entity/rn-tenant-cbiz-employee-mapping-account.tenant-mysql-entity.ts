import { Entity, JoinColumn, Unique } from 'typeorm';
import {
  OneToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizEmployeeEntity } from './rn-tenant-cbiz-employee.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_employee_mapping_account',
  comment: '테넌트 직원 매핑 계정 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizEmployeeMappingAccountEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '직원 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '직원 고유 아이디',
  })
  id: string;

  @OneToOne(() => RnTenantCbizEmployeeEntity, (employee) => employee.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '직원',
    isOwner: true,
    type: () => RnTenantCbizEmployeeEntity,
  })
  @JoinColumn({
    name: 'employeeId',
    referencedColumnName: 'id',
  })
  @Unique(['employee.id'])
  employee: RnTenantCbizEmployeeEntity;

  @OneToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      description: '직원 계정',
      isOwner: true,
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'employeeAccountId',
    referencedColumnName: 'id',
  })
  @Unique(['employeeAccount.id'])
  employeeAccount: RnTenantEmployeeAccountEntity;
}
