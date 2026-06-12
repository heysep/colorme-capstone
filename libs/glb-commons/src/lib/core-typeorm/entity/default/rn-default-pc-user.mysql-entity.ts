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

export enum PcUserAuthType {
  GUEST = 'GUEST',
  REGISTERED = 'REGISTERED',
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
    length: 100,
    comment: '로그인 ID (이메일)',
    nullable: true,
    unique: true,
    example: 'user@example.com',
  })
  userId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '비밀번호 (해시 저장 권장)',
    nullable: true,
    example: 'password_hash',
  })
  userPw: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    comment: '사용자 이름',
    nullable: true,
    example: '홍길동',
  })
  userName: string | null;

  @Column({
    type: 'enum',
    enum: UserGender,
    comment: '성별',
    nullable: true,
    example: UserGender.FEMALE,
  })
  userGender: UserGender | null;

  @Column({
    type: 'varchar',
    length: 5,
    comment: '나이',
    nullable: true,
    example: '25',
  })
  userAge: string | null;

  @Column({
    type: 'varchar',
    length: 120,
    comment: '게스트 세션 토큰',
    nullable: false,
    unique: true,
    example: 'pc_session_1234567890',
  })
  sessionToken: string;

  @Column({
    type: 'enum',
    enum: PcUserAuthType,
    comment: '사용자 인증 유형',
    nullable: false,
    default: PcUserAuthType.GUEST,
    example: PcUserAuthType.GUEST,
  })
  authType: PcUserAuthType;

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
    nullable: true,
  })
  @JoinColumn({
    name: 'userPersonalColorId',
    referencedColumnName: 'id',
  })
  personalColor: RnDefaultPersonalColorEntity | null;
}
