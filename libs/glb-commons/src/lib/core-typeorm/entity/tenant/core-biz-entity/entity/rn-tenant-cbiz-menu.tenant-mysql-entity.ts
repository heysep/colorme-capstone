import { Entity, JoinColumn } from 'typeorm';
import {
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';
import {
  RnTenantCbizMenuClassifyType,
  RnTenantCbizMenuType,
} from '../enum/rn-tenant-cbiz-menu.enum';

/**
 * [기본정보] 기초정보-메뉴 테이블
 */
@Entity({
  name: 'rn_tenant_cbiz_menu',
  comment: '[기본정보] 기초정보-메뉴 테이블',
  engine: 'InnoDB',
})
export class RnTenantCbizMenuEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '메뉴 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '메뉴 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '메뉴명',
    nullable: false,
    index: true,
    example: '메뉴명',
  })
  menuName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '메뉴 원본 이름',
    nullable: false,
    index: true,
    example: '메뉴 원본 이름',
  })
  menuNameOrigin: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '메뉴 참조명 (영문)',
    nullable: true,
    example: '메뉴 참조명 (영문)',
  })
  menuRefName: string | null;

  @Column({
    type: 'varchar',
    length: 250,
    comment: '메뉴 URL',
    nullable: true,
    example: '메뉴 URL',
  })
  menuUrl: string | null;

  @Column({
    type: 'tinyint',
    comment: '메뉴 깊이 (1~3)',
    nullable: false,
    default: 1,
    index: true,
    example: '메뉴 깊이 (1~3)',
  })
  menuDepth: number;

  @Column({
    type: 'enum',
    enum: RnTenantCbizMenuType,
    comment: '메뉴 유형 (일반 메뉴, 페이지)',
    default: RnTenantCbizMenuType.MENU,
    nullable: false,
    example: '메뉴 유형 (일반 메뉴, 페이지)',
  })
  menuTypeEm: RnTenantCbizMenuType;

  @Column({
    type: 'enum',
    enum: RnTenantCbizMenuClassifyType,
    comment: '메뉴 분류 (일반 메뉴, 설정 메뉴)',
    default: RnTenantCbizMenuClassifyType.NORMAL,
    nullable: false,
    example: '메뉴 분류 (일반 메뉴, 설정 메뉴)',
  })
  menuClassifyEm: RnTenantCbizMenuClassifyType;

  // ------------------------------
  // 상위 메뉴 정보
  // ------------------------------
  @ManyToOne(() => RnTenantCbizMenuEntity, (menu) => menu.children, {
    eager: false,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    nullable: true,
    description: '상위 메뉴',
    type: () => RnTenantCbizMenuEntity,
  })
  @JoinColumn({
    name: 'menuPrtId',
    referencedColumnName: 'id',
  })
  parent: RnTenantCbizMenuEntity;

  // ------------------------------
  // 하위 메뉴 목록
  // ------------------------------
  @OneToMany(() => RnTenantCbizMenuEntity, (child) => child.parent, {
    description: '하위 메뉴 목록',
    type: () => RnTenantCbizMenuEntity,
  })
  children: RnTenantCbizMenuEntity[];

  @Column({
    type: 'boolean',
    comment: '조회 권한',
    default: false,
    nullable: false,
    example: '조회 권한',
  })
  menuActList: boolean;

  @Column({
    type: 'boolean',
    comment: '등록 권한',
    default: false,
    nullable: false,
    example: '등록 권한',
  })
  menuActAdd: boolean;

  @Column({
    type: 'boolean',
    comment: '수정 권한',
    default: false,
    nullable: false,
    example: '수정 권한',
  })
  menuActUp: boolean;

  @Column({
    type: 'boolean',
    comment: '삭제 권한',
    default: false,
    nullable: false,
    example: '삭제 권한',
  })
  menuActDel: boolean;

  @Column({
    type: 'boolean',
    comment: '승인 권한',
    default: false,
    nullable: false,
    example: '승인 권한',
  })
  menuActApp: boolean;

  @Column({
    type: 'text',
    comment: '추가 권한 정보 (JSON)',
    nullable: true,
    example: '추가 권한 정보 (JSON)',
  })
  menuActOther: string;

  @Column({
    type: 'text',
    comment: '통합 검색 JSXCRUD 조건 (JSON)',
    nullable: true,
    example: '통합 검색 JSXCRUD 조건 (JSON)',
  })
  menuSearchJsxcrud: string | null;

  @Column({
    type: 'int',
    comment: '순서',
    nullable: true,
    default: 0,
    example: '순서',
  })
  ordNo: number;

  @Column({
    type: 'boolean',
    comment: '사용여부',
    default: true,
    example: '사용여부',
  })
  useYn: boolean;
}
