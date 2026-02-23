import {
  getTzDayjs,
  LogMxProvider,
  ObjectStorageDeleteService,
  RN_MAIN_DATABASE_CONNECTION_NAME,
  rnDayjs,
  RnDefaultUploadFileEntity,
} from '@drvalue-bmes-backend/glb-commons';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, LessThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class FileManagerAutoDeleteCron {
  // 이미 Cron이 실행되었는지 확인하는 플래그
  private static isCronExecuted = false;

  constructor(
    private readonly logMxProvider: LogMxProvider,
    // ------------------------------
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    // ------------------------------
    private readonly objectStorageDeleteService: ObjectStorageDeleteService,
  ) {}

  /**
   * 파일 자동 삭제 크론
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @Transactional({
    connectionName: RN_MAIN_DATABASE_CONNECTION_NAME,
  })
  async handleCron() {
    if (FileManagerAutoDeleteCron.isCronExecuted) {
      return;
    }

    FileManagerAutoDeleteCron.isCronExecuted = true;

    this.logMxProvider.logNoMetadata('FileManagerAutoDeleteCron start');

    const MAX_WHILE_COUNT = 200;
    const MAX_FILE_COUNT = 50;
    let index = 0;
    let whileCount = 0;

    try {
      // ---------------------------------------------------------
      // [원판 수율 결과 이미지 파일] 파일 삭제 로직
      // - 생성 후 1일 뒤 삭제
      // ---------------------------------------------------------
      // 원판 수율 파일 전체 목록 개수 조회
      const fileCount = await this.uploadFileRepository.count({
        where: {
          description: Equal('루트 사용자 전용 파일 업로더 [ 보드 수율 계산 ]'),
          createdAt: LessThan(getTzDayjs(rnDayjs).subtract(1, 'day').toDate()),
        },
      });
      this.logMxProvider.logNoMetadata(
        `[원판 수율 결과 이미지 파일] 파일 전체 목록 개수: ${fileCount}`,
      );
      // 전체 목록을 한 번에 조회하면 너무 많은 데이터가 조회되므로 MAX_FILE_COUNT 개수만큼 조회
      // 무한 반복은 매우 위험하므로 MAX_WHILE_COUNT 만큼 반복
      while (whileCount < MAX_WHILE_COUNT) {
        whileCount++;
        if (index >= fileCount) {
          break;
        }

        const fileList = await this.uploadFileRepository.find({
          where: {
            description: Equal(
              '루트 사용자 전용 파일 업로더 [ 보드 수율 계산 ]',
            ),
            createdAt: LessThan(
              getTzDayjs(rnDayjs).subtract(1, 'day').toDate(),
            ),
          },
          take: MAX_FILE_COUNT,
          skip: index,
        });

        if (fileList.length === 0) {
          break;
        }

        // Minio 에서 삭제
        const fileStorageNames = fileList.map((item) => item.storageName);
        await this.objectStorageDeleteService.deleteFiles({
          storageName: fileStorageNames,
        });

        // 데이터베이스에서 삭제
        await this.uploadFileRepository.softDelete(
          fileList.map((item) => item.id),
        );
        index += MAX_FILE_COUNT;
      }
      index = 0;
      whileCount = 0;
      this.logMxProvider.logNoMetadata(
        `[원판 수율 결과 이미지 파일] 파일 삭제 완료`,
      );
    } catch (error) {
      this.logMxProvider.errorNoMetadata(
        `FileManagerAutoDeleteCron error: ${error?.message ?? 'Unknown error'}`,
      );
    }

    FileManagerAutoDeleteCron.isCronExecuted = false;
    this.logMxProvider.logNoMetadata(`FileManagerAutoDeleteCron end`);
  }
}
