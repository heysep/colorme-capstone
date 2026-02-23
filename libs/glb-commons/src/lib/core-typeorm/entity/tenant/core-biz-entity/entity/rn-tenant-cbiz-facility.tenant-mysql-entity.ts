import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_facility',
  comment: '설비 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizFacilityEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '설비 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '설비 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '설비명',
    nullable: false,
    example: '설비명',
  })
  facilityName: string;

  //설비 코드
  @Column({
    type: 'varchar',
    length: 50,
    comment: '설비 코드',
    nullable: false,
    example: '설비 코드',
  })
  facilityCode: string;

  @Column({
    type: 'text',
    comment: '설비 운용방법',
    nullable: false,
    example: '설비 운용방법',
  })
  facilityOperationMethod: string;

  @Column({
    type: 'json',
    comment: '설비 첨부 파일',
    nullable: true,
    example: '설비 첨부 파일',
  })
  facilityAttachmentFiles: string[] | any;

  @Column({
    type: 'date',
    comment: '설비 도입일',
    nullable: false,
    example: '설비 도입일',
  })
  facilityIntroductionDate: Date;

  @Column({
    type: 'date',
    comment: '적용일',
    nullable: false,
    example: '적용일',
  })
  applyDate: Date;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    nullable: false,
    example: '사용여부',
  })
  useYn: boolean;
}
