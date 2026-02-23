import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';

/**
 * 전역 설정 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_config',
  comment: '전역 설정 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizConfigEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '전역 설정 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '전역 설정 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '전역 설정 키',
    nullable: false,
    index: true,
    example: '전역 설정 키',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '전역 설정 값',
    nullable: false,
    example: '전역 설정 값',
  })
  value: string;
}
