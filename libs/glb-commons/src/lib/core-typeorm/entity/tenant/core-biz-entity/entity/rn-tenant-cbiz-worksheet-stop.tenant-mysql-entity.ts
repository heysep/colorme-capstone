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
  name: 'rn_tenant_cbiz_worksheet_stop',
  comment: '워크시트 중단 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizWorksheetStopEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '워크시트 중단 고유 아이디',
    example: '워크시트 중단 고유 아이디',
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

  // 중단 사유
  @Column({
    type: 'text',
    comment: '중단 사유',
    example: '중단 사유',
    nullable: true,
  })
  reason: string;

  // 중단 요청 일시
  @Column({
    type: 'date',
    comment: '중단 요청 일시',
    example: '중단 요청 일시',
    nullable: true,
  })
  requestedAt: Date;

  // 중단 요청 사용자
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

  // 중단 확정 사용자
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
    name: 'confirmedEmployeeAccountId',
    referencedColumnName: 'id',
  })
  confirmedEmployeeAccount: RnTenantEmployeeAccountEntity;

  // 중단 확정 일시
  @Column({
    type: 'date',
    comment: '중단 확정 일시',
    example: '중단 확정 일시',
    nullable: true,
  })
  confirmedAt: Date;

  // 중단 확정 여부
  @Column({
    type: 'boolean',
    comment: '중단 확정 여부',
    example: '중단 확정 여부',
    nullable: false,
    default: false,
  })
  isConfirmed: boolean;

  // 중단 이전 상태
  @Column({
    type: 'enum',
    enum: RnTenantCbizWorksheetStatusType,
    comment: '중단 이전 상태',
    example: '중단 이전 상태',
    nullable: true,
  })
  previousStatus: RnTenantCbizWorksheetStatusType;
}
