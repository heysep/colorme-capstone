import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  PrimaryColumn,
} from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';
import { RnDefaultBugfixBoardEntity } from './rn-default-bugfix-board.mysql-entity';

/**
 * 기본 버그픽스 게시판 댓글 엔티티
 *
 * @author 최시훈
 * @since 2025-02-23
 */
@Entity({
  name: 'rn_default_bugfix_board_comment',
  comment: '기본 버그픽스 게시판 댓글 테이블',
  engine: 'InnoDB',
})
export class RnDefaultBugfixBoardCommentEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '댓글 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '댓글 고유 아이디',
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

  // ------------------------------
  // ------------------------------
  // ------------------------------

  @ManyToOne(() => RnDefaultBugfixBoardCommentEntity, (comment) => comment.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '부모 댓글',
    type: () => RnDefaultBugfixBoardCommentEntity,
  })
  @JoinColumn({
    name: 'parentId',
    referencedColumnName: 'id',
  })
  parent: RnDefaultBugfixBoardCommentEntity;

  @Column({
    type: 'varchar',
    length: 1000,
    comment: '댓글 내용',
    nullable: false,
    example: '댓글 내용',
  })
  message: string;

  @Column({
    type: 'int',
    comment: '부모 또는 자식 여부',
    nullable: false,
    default: 0,
    example: '부모 또는 자식 여부',
  })
  class: number;

  @Column({
    type: 'int',
    comment: '정렬 순서',
    nullable: true,
    default: 0,
    example: '정렬 순서',
  })
  order: number;

  // ------------------------------
  // ------------------------------
  // ------------------------------

  @ManyToOne(() => RnDefaultBugfixBoardEntity, (board) => board.id, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    description: '게시판',
    type: () => RnDefaultBugfixBoardEntity,
  })
  @JoinColumn({
    name: 'boardId',
    referencedColumnName: 'id',
  })
  board: RnDefaultBugfixBoardEntity;
}
