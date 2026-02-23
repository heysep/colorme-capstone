import { Entity } from 'typeorm';
import { Column, PrimaryColumn } from '../../decorator/decorator-with-swagger';
import { RnBaseBaseMysqlEntity } from '../base/rn-base.base-mysql-entity';

/**
 * 파일 업로더 종류
 */
export enum UploaderType {
  ROOT_USER = 'ROOT_USER',
  TENANT_USER = 'TENANT_USER',
}

/**
 * 파일 상태
 */
export enum UploadFileStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELAYED = 'DELAYED',
}

/**
 * 파일 저장 유형
 */
export enum UploadFileStorageType {
  MINIO = 'MINIO',
}

/**
 * 테넌트 기본 엔티티
 *
 * @author 최시훈
 * @since 2025-01-03
 */
@Entity({
  name: 'rn_default_upload_file',
  comment: '기본 업로드 파일 테이블',
  engine: 'InnoDB',
})
export class RnDefaultUploadFileEntity extends RnBaseBaseMysqlEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    comment: '파일 고유 아이디',
    generated: 'uuid',
    nullable: false,
    example: '파일 고유 아이디',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '파일 원본 이름',
    nullable: false,
    example: '파일 원본 이름',
  })
  originalName: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '파일 저장 이름',
    nullable: false,
    unique: true,
    example: '파일 저장 이름',
  })
  storageName: string;

  @Column({
    type: 'enum',
    enum: UploaderType,
    comment: '파일 업로더 종류',
    nullable: false,
    example: '파일 업로더 종류',
  })
  uploaderType: UploaderType;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '파일 업로더 세부 정보',
    nullable: false,
    example: '파일 업로더 세부 정보',
  })
  uploaderDetail: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '파일 업로더 아이디',
    nullable: false,
    example: '파일 업로더 아이디',
  })
  uploaderId: string;

  @Column({
    type: 'int',
    comment: '파일 사이즈',
    nullable: false,
    example: '파일 사이즈',
  })
  size: number;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '파일 타입',
    nullable: false,
    example: '파일 타입',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '업로드 아이피 주소',
    nullable: false,
    example: '업로드 아이피 주소',
  })
  uploadIp: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '파일 설명',
    nullable: true,
    example: '파일 설명',
  })
  description: string;

  @Column({
    type: 'enum',
    enum: UploadFileStatus,
    comment: '파일 상태',
    nullable: false,
    example: '파일 상태',
  })
  status: UploadFileStatus;

  @Column({
    type: 'enum',
    enum: UploadFileStorageType,
    comment: '파일 저장 유형',
    nullable: false,
    example: '파일 저장 유형',
  })
  storageType: UploadFileStorageType;
}
