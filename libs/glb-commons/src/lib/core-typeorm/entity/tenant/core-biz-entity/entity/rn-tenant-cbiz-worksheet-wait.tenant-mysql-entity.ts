import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import { RnTenantEmployeeAccountEntity } from '../../rn-tenant-employee-account.tenant-mysql-entity';
import { RnTenantCbizWorksheetStatusType } from '../enum/rn-tenant-cbiz-worksheet.enum';
import { RnTenantCbizWorksheetEntity } from './rn-tenant-cbiz-worksheet.tenant-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_worksheet_wait',
  comment: '워크시트 보류 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizWorksheetWaitEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '워크시트 보류 고유 아이디',
    example: '워크시트 보류 고유 아이디',
    generated: 'uuid',
    nullable: false,
  })
  id: string;

  // 생산
  @ManyToOne(() => RnTenantCbizWorksheetEntity, (worksheet) => worksheet.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    type: () => RnTenantCbizWorksheetEntity,
  })
  @JoinColumn({
    name: 'worksheetId',
    referencedColumnName: 'id',
  })
  worksheet: RnTenantCbizWorksheetEntity;

  // 보류 사유
  @Column({
    type: 'text',
    comment: '보류 사유',
    example: '보류 사유',
    nullable: true,
  })
  reason: string;

  // 보류 일시
  @Column({
    type: 'date',
    comment: '보류 일시',
    example: '보류 일시',
    nullable: true,
  })
  requestedAt: Date;

  // 보류 사용자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'requestedEmployeeAccountId',
    referencedColumnName: 'id',
  })
  requestedEmployeeAccount: RnTenantEmployeeAccountEntity;

  // 보류 해재 일시
  @Column({
    type: 'date',
    comment: '보류 해재 일시',
    example: '보류 해재 일시',
    nullable: true,
  })
  releasedAt: Date;

  // 보류 해재 사용자
  @ManyToOne(
    () => RnTenantEmployeeAccountEntity,
    (employeeAccount) => employeeAccount.id,
    {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      nullable: true,
      type: () => RnTenantEmployeeAccountEntity,
    },
  )
  @JoinColumn({
    name: 'releasedEmployeeAccountId',
    referencedColumnName: 'id',
  })
  releasedEmployeeAccount: RnTenantEmployeeAccountEntity;

  // 보류 이전 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizWorksheetStatusType,
    comment: '보류 이전 상태',
    example: '보류 이전 상태',
    nullable: true,
  })
  previousStatus: RnTenantCbizWorksheetStatusType;
}
