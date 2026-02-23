/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';
import { ObjectStorageUploadService } from '../../core-minio/service/object-storage-upload.service';
import { LogMxProvider } from '../../utils-log-mx/public-providers/log-mx.provider';
import { join } from 'path';
import { IDefaultOutputDto } from '../../utils-dto/default-output.dto';
import { CommonError } from '../../core-response/utils/common-error.util';
import { EXCEL_ERROR_LIST } from '../error/error-list.error';
import { SFields } from '@dataui/crud-request';

export class ExcelCal {
  key: string;
  value: string;
  order: number;
  width?: number;
}

@Injectable()
export class ExcelUtilService {
  constructor(
    private readonly objectStorageUploadService: ObjectStorageUploadService,
    // -------------
    private readonly logMxProvider: LogMxProvider
  ) {}

  /**
   * 마이그레이션 데이터 제외 조건
   */
  static getExcludeMigrationDataCondition(): SFields {
    // 만약 아이디에 rnt_ 가 포함되어 있다면 제외
    return {
      id: {
        $starts: 'rnt_',
      },
    };
  }

  /**
   * 엑셀 다운로드
   *
   * @param metadata 메타데이터
   * @param getData 데이터 가져오기 함수 (페이지네이션)
   * @param excelColumnMapping 엑셀 컬럼 매핑
   * @param sheetName 시트 이름
   * @returns 엑셀 파일 경로
   */
  async makeDownloadExcel(
    metadata: {
      uploader: string;
      uploaderDetail: string;
      uploaderIp: string;
      isTenantUser: boolean;
      description: string;
      filePath?: string;
    },
    getData: (
      currentPage: number,
      limit: number
    ) => Promise<[number, boolean, any[]]>,
    excelColumnMapping: ExcelCal[],
    sheetName = 'Sheet1'
  ): Promise<
    IDefaultOutputDto<{
      storageName: string;
      deleteTempFiles: () => Promise<void>;
    }>
  > {
    try {
      const excelId = `sihun.dzwWPTj2.${new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, '')}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;

      const tempDir = metadata?.filePath ?? join(__dirname, 'temp');

      const fs = require('fs').promises;
      try {
        await fs.mkdir(tempDir, { recursive: true });
      } catch (e) {
        // ignore if exists
      }

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: `${tempDir}/${excelId}.xlsx`,
        useStyles: true,
        useSharedStrings: true,
      });

      const worksheet = workbook.addWorksheet(sheetName);

      // 페이지네이션 설정
      const limit = 500; // 한 번에 처리할 데이터 개수
      let currentPage = 1;
      let totalCount = 0;
      let hasNext = true;
      let no = 0;
      let isFirstPage = true;

      const excelColumnMappingSorted = excelColumnMapping.sort(
        (a, b) => a.order - b.order
      );
      excelColumnMappingSorted.unshift({
        key: 'no',
        value: 'No',
        order: 0,
      });

      // 페이지네이션으로 데이터 처리
      while (hasNext) {
        // 데이터 가져오기
        const [currentTotalCount, currentHasNext, currentData] = await getData(
          currentPage,
          limit
        );

        if (isFirstPage) {
          totalCount = currentTotalCount;
          no = totalCount;
          isFirstPage = false;
        }

        hasNext = currentHasNext;

        if (currentData && currentData.length > 0) {
          // 첫 번째 페이지에서만 헤더 생성
          if (currentPage === 1) {
            // 컬럼 폭 설정
            excelColumnMappingSorted.forEach((colDef, idx) => {
              if (colDef.width) {
                worksheet.getColumn(idx + 1).width = (colDef.width - 5) / 7;
              }
            });

            // 헤더 행 추가
            const header = excelColumnMappingSorted.map((col) => col.value);
            worksheet.addRow(header).commit();
          }

          // 현재 페이지 데이터 처리
          for (const row of currentData) {
            if (!row) continue;

            const processedRow = excelColumnMappingSorted.reduce(
              (acc: { [key: string]: any }, cal) => {
                if (!cal || !cal.key) return acc;

                if (cal.key === 'no') {
                  acc['No'] = no;
                  no--;
                  return acc;
                }

                const keys = cal.key.split('.');
                let current = row;

                try {
                  for (const key of keys) {
                    if (current === null || current === undefined) {
                      current = null;
                      break;
                    }
                    current = current[key];
                  }
                } catch (error) {
                  current = null;
                }

                acc[cal.value] = current;
                return acc;
              },
              {}
            );

            // 행 데이터를 엑셀에 쓰기
            worksheet.addRow(Object.values(processedRow)).commit();
          }
        }

        // 메모리 해제를 위해 현재 페이지 데이터 참조 제거
        currentData.length = 0;

        // 다음 페이지로
        currentPage++;
      }

      await workbook.commit();

      const file = this.objectStorageUploadService.convertLocalFileToMulterFile(
        `${tempDir}/${excelId}.xlsx`
      );

      const result = await this.objectStorageUploadService.uploadFile({
        file: file,
        fileName: this.objectStorageUploadService.randomFileKeyGenerate(),
        uploader: metadata?.uploader ?? 'UNKNOWN',
        uploaderDetail: metadata?.uploaderDetail ?? 'UNKNOWN',
        isTenantUser: metadata?.isTenantUser ?? false,
        uploaderIp: metadata?.uploaderIp ?? 'UNKNOWN',
        description: metadata?.description ?? 'UNKNOWN',
      });

      return IDefaultOutputDto.success({
        storageName: result.data?.uploadEntityResult.storageName ?? '',
        deleteTempFiles: async () => {
          try {
            await fs.unlinkSync(`${tempDir}/${excelId}.xlsx`);
          } catch (error) {
            /* empty */
          }
        },
      });
    } catch (error: any) {
      this.logMxProvider.errorNoMetadata(
        `Excel 다운로드 실패: ${error?.message ?? 'UNKNOWN'}`
      );

      throw CommonError.createByErrorCode(EXCEL_ERROR_LIST.EXCEL_ERROR_001);
    }
  }
}
