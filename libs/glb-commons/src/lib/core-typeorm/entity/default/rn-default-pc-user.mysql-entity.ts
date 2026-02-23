import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultPersonalColorEntity } from './rn-default-personal-color.mysql-entity';

/**
 * 퍼스널 컬러 앱 사용자 성별
 */
export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

/**
 * 퍼스널 컬러 앱 사용자 엔티티
 *
 * @author YOSEB
 */
@Entity({
  name: 'rn_default_pc_user',
  comment: '퍼스널 컬러 앱 사용자 테이블',
  engine: 'InnoDB',
})
export class RnDefaultPcUserEntity extends RnBaseBaseMysqlEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: '사용자 고유 ID',
    example: 1,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '로그인 ID',
    nullable: false,
    unique: true,
    example: 'user001',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '비밀번호 (해시 저장 권장)',
    nullable: false,
    example: 'password_hash',
  })
  userPw: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '사용자 이름',
    nullable: false,
    example: '홍길동',
  })
  userName: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    comment: '성별',
    nullable: false,
    example: UserGender.FEMALE,
  })
  userGender: UserGender;

  @Column({
    type: 'varchar',
    length: 5,
    comment: '나이',
    nullable: false,
    example: '25',
  })
  userAge: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '국가',
    nullable: true,
    example: '대한민국',
  })
  userCountry: string | null;

  @ManyToOne(() => RnDefaultPersonalColorEntity, (color) => color.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '진단된 퍼스널 컬러',
    type: () => RnDefaultPersonalColorEntity,
  })
  @JoinColumn({
    name: 'userPersonalColorId',
    referencedColumnName: 'id',
  })
  personalColor: RnDefaultPersonalColorEntity | null;
}
