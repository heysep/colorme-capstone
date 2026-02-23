import { Entity } from 'typeorm';
import {
  Column,
  PrimaryColumn,
} from '../../../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../../../base/rn-base.base-mysql-entity';

export const COMPANY_DEFAULT_ID = 'COMPANY_DEFAULT_ID';

/**
 * [기본정보] 기초정보-회사 기본 정보
 */
@Entity({
  name: 'rn_tenant_cbiz_company_default',
  comment: '[기본정보] 기초정보-회사 기본 정보',
  engine: 'InnoDB',
})
export class RnTenantCbizCompanyDefaultEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '회사 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '회사 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '회사명',
    nullable: true,
    default: '기본 회사명',
    example: '회사명',
  })
  companyNm: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '회사명 약칭(국문)',
    nullable: true,
    default: '기본 회사명 약칭',
    example: '회사명 약칭(국문)',
  })
  companyKorAlias: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '회사명 약칭(영문)',
    nullable: true,
    default: '기본 회사명 약칭',
    example: '회사명 약칭(영문)',
  })
  companyEngAlias: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '영문 회사명',
    nullable: true,
    default: '기본 영문 회사명',
    example: '영문 회사명',
  })
  companyEngNm: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '사업자등록번호',
    nullable: true,
    default: '기본 사업자등록번호',
    example: '사업자등록번호',
  })
  businessRegNo: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '법인등록번호',
    nullable: true,
    default: '기본 법인등록번호',
    example: '법인등록번호',
  })
  corpRegNo: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '업태',
    nullable: true,
    default: '기본 업태',
    example: '업태',
  })
  bizCondition: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '업종',
    nullable: true,
    default: '기본 업종',
    example: '업종',
  })
  bizType: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '대표자명',
    nullable: true,
    default: '기본 대표자명',
    example: '대표자명',
  })
  ceoNm: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '대표 전화번호',
    nullable: true,
    default: '기본 대표 전화번호',
    example: '대표 전화번호',
  })
  ceoPhone: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '대표 팩스번호',
    nullable: true,
    default: '기본 대표 팩스번호',
    example: '대표 팩스번호',
  })
  ceoFax: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '대표 이메일',
    nullable: true,
    default: '기본 대표 이메일',
    example: '대표 이메일',
  })
  ceoEmail: string;

  @Column({
    type: 'varchar',
    length: 40,
    comment: '우편번호',
    nullable: true,
    default: '기본 우편번호',
    example: '우편번호',
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '주소',
    nullable: true,
    default: '기본 주소',
    example: '주소',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '상세주소',
    nullable: true,
    default: '기본 상세주소',
    example: '상세주소',
  })
  detailAddress: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '세무 담당자명',
    nullable: true,
    default: '기본 세무 담당자명',
    example: '세무 담당자명',
  })
  taxManagerNm: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '세무 담당자 이메일',
    nullable: true,
    default: '기본 세무 담당자 이메일',
    example: '세무 담당자 이메일',
  })
  taxManagerEmail: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '세무 담당자 전화번호',
    nullable: true,
    default: '기본 세무 담당자 전화번호',
    example: '세무 담당자 전화번호',
  })
  taxManagerPhone: string;

  @Column({
    type: 'varchar',
    length: 45,
    comment: '세무 담당자 팩스 번호',
    nullable: true,
    default: '기본 세무 담당자 팩스 번호',
    example: '세무 담당자 팩스 번호',
  })
  taxManagerFax: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '직인 이미지 아이디',
    nullable: true,
    default: null,
    example: '직인 이미지 아이디',
  })
  signatureImageId: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '회사 로고 아이디',
    nullable: true,
    default: null,
    example: '회사 로고 아이디',
  })
  companyLogoId: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '회사 로고 다크 아이디',
    nullable: true,
    default: null,
    example: '회사 로고 다크 아이디',
  })
  companyLogoDarkId: string;
}
