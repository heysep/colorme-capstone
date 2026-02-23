import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 처리 상태 열거형
 */
export enum RnDefaultBugfixBoardStatus {
  REGISTERED = 'REGISTERED', // 등록
  NEED_AGREEMENT = 'NEED_AGREEMENT', // 협의 필요
  IN_PROGRESS = 'IN_PROGRESS', // 처리중
  COMPLETED = 'COMPLETED', // 처리 완료
  CANCELLED = 'CANCELLED', // 취소
}

/**
 * 기본 버그픽스 게시판 엔티티
 *
 * @author 최시훈
 * @since 2025-02-23
 */
@Entity({
  name: 'rn_default_bugfix_board',
  comment: '기본 버그픽스 게시판 테이블',
  engine: 'InnoDB',
})
export class RnDefaultBugfixBoardEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '게시판 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '게시판 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '테넌트 아이디',
    nullable: false,
    index: true,
    example: '테넌트 아이디',
  })
  tenantId: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '작성자 UUID',
    nullable: false,
    index: true,
    example: '작성자 UUID',
  })
  tenantUserId: string;

  // ----------------------------
  // ----------------------------
  // ----------------------------

  @Column({
    type: 'varchar',
    length: 200,
    comment: '작성자 아이디',
    nullable: false,
    index: true,
    example: '작성자 아이디',
  })
  writerId: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '작성자 이름',
    nullable: false,
    example: '작성자 이름',
  })
  writerName: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '메뉴명',
    nullable: false,
    example: '메뉴명',
  })
  menuName: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '세부 작업명',
    nullable: false,
    example: '세부 작업명',
  })
  detailWorkName: string;

  @Column({
    type: 'text',
    comment: '내용',
    nullable: false,
    example: '내용',
  })
  content: string;

  @Column({
    type: 'text',
    comment: '첨부 파일 JSON',
    nullable: false,
    default: '[]',
    example: '첨부 파일 JSON',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachmentFiles: any | string[];

  @Column({
    type: 'enum',
    enum: RnDefaultBugfixBoardStatus,
    comment: '상태',
    nullable: false,
    default: RnDefaultBugfixBoardStatus.REGISTERED,
    example: '상태',
  })
  status: RnDefaultBugfixBoardStatus;
}
