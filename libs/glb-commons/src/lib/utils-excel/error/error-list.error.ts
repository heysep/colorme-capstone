import { HttpStatus } from '@nestjs/common';

export const EXCEL_ERROR_LIST = {
  EXCEL_ERROR_001: {
    // Excel 파일 생성 실패
    code: 'EXCEL_ERROR_001',
    message: 'Excel 파일 생성 실패',
    detail: 'Excel 파일 생성 실패',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  EXCEL_ERROR_002: {
    // between 조건이 필요합니다.
    code: 'EXCEL_ERROR_002',
    message:
      'between 조건이 필요합니다. 엑셀 다운로드의 경우 필수 입력 항목입니다. (예시: 2025-01-01,2025-01-02)',
    detail:
      'between 조건이 필요합니다. 엑셀 다운로드의 경우 필수 입력 항목입니다. (예시: 2025-01-01,2025-01-02)',
    status: HttpStatus.BAD_REQUEST,
  },
  EXCEL_ERROR_003: {
    // 엑셀 다운로드 날짜 범위가 EXCEL_DOWNLOAD_MAX_DATE_RANGE_YEAR 년을 초과할 수 없습니다.
    code: 'EXCEL_ERROR_003',
    message: `엑셀 다운로드 날짜 범위가 ${
      process.env?.['EXCEL_DOWNLOAD_MAX_DATE_RANGE_YEAR'] ?? 5
    }년을 초과할 수 없습니다.`,
    detail: `엑셀 다운로드 날짜 범위가 ${
      process.env?.['EXCEL_DOWNLOAD_MAX_DATE_RANGE_YEAR'] ?? 5
    }년을 초과할 수 없습니다.`,
    status: HttpStatus.BAD_REQUEST,
  },
};
