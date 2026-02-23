import { Entity } from 'typeorm';
import { RnDefaultRootUserEntity } from './rn-default-user.mysql-entity';

/**
 * 기본 사용자 테이블
 * 사용자 정보를 저장하는 테이블
 *
 * @author 최시훈
 * @since 2025-01-02
 */
@Entity({
  name: 'rn_default_admin_user',
  comment: 'CMS 루트 관리자 사용자 테이블',
  engine: 'InnoDB',
})
export class RnDefaultAdminUserEntity extends RnDefaultRootUserEntity {}
