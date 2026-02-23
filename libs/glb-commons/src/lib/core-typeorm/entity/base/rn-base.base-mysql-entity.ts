import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from '../../decorator/decorator-with-swagger';

/**
 * MySQL 엔티티의 기본 클래스
 * - 생성일시, 수정일시, 삭제일시를 자동으로 관리
 *
 * @author 최시훈
 * @since 2025-01-02
 */
export class RnBaseBaseMysqlEntity {
  @CreateDateColumn({
    name: 'createdAt',
    type: 'datetime',
    comment: '생성일시',
    update: false, // 생성 후 수정 불가
    index: true,
    example: '생성일시',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'datetime',
    comment: '수정일시',
    nullable: true, // 최초 생성시에는 null
    example: '수정일시',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deletedAt',
    type: 'datetime',
    comment: '삭제일시 (soft delete)',
    nullable: true,
    select: false, // 기본 조회시 제외
    index: true,
    example: '삭제일시 (soft delete)',
  })
  deletedAt: Date | null;
}
