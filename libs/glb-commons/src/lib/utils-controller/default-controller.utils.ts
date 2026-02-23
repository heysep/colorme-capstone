import { CrudRequest } from '@dataui/crud';
import {
  SCondition,
  SConditionAND,
  SConditionNOT,
  SFields,
} from '@dataui/crud-request';
import { rnDayjs } from '../utils-dayjs/utils-dayjs.util';

function parseBoolean(value?: boolean | string): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

export function applyDateAndUseYnFilter({
  applyDateFilter,
  useYnFilter,
  req,
}: {
  applyDateFilter?: boolean | string;
  useYnFilter?: boolean | string;
  req: CrudRequest;
}) {
  type cType = SFields | SConditionAND | SConditionNOT;
  const makeCondition: cType[] = [];

  // applyDateFilter가 명시적으로 true일 때만 날짜 필터 추가
  if (parseBoolean(applyDateFilter)) {
    makeCondition.push({
      applyDate: { $lte: rnDayjs().endOf('day').toDate() },
    });
  }

  // useYnFilter가 명시적으로 true일 때만 useYn 필터 추가
  if (parseBoolean(useYnFilter)) {
    makeCondition.push({
      useYn: { $eq: true },
    });
  }

  // 필터 조건이 있을 때만 조건 추가
  if (makeCondition.length > 0) {
    // req.parsed가 없으면 초기화
    if (!req.parsed) {
      req.parsed = {} as CrudRequest['parsed'];
    }

    const condition: SCondition = {
      ...(req.parsed.search ?? {}),
      $and: [...(req.parsed.search?.$and ?? []), ...makeCondition],
    } as SCondition;

    req.parsed.search = condition;
  }

  return req;
}
