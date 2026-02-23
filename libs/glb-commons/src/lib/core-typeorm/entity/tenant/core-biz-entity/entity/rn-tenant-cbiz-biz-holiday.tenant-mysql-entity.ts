import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';

@Entity({
  name: 'rn_tenant_cbiz_biz_holiday',
  comment: '휴일 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizBizHolidayEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '휴일 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '휴일 고유 아이디',
  })
  id: string;

  // 쉬는날 명칭
  @Column({
    type: 'varchar',
    length: 50,
    comment: '쉬는날 이름',
    nullable: false,
    example: '쉬는날 이름',
  })
  holidayName: string;

  // 쉬는날
  @Column({
    type: 'date',
    comment: '쉬는날 날짜',
    nullable: false,
    example: '쉬는날 날짜',
  })
  holidayDate: Date;

  // 반복
  @Column({
    type: 'boolean',
    comment: '반복 여부',
    nullable: false,
    example: '반복 여부',
  })
  repeatYn: boolean;

  // 대체공휴일
  @Column({
    type: 'boolean',
    comment: '대체공휴일 여부',
    nullable: false,
    example: '대체공휴일 여부',
  })
  replacementHolidayYn: boolean;

  // 사용
  @Column({
    type: 'boolean',
    comment: '사용 여부',
    nullable: false,
    example: '사용 여부',
  })
  useYn: boolean;

  // 순서
  @Column({
    type: 'int',
    comment: '순서',
    nullable: false,
    example: '순서',
  })
  ordNo: number;
}
