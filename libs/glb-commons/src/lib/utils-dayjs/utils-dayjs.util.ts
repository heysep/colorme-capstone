import { Dayjs } from 'dayjs';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

export const rnDayjs = dayjs;

export function toDateOnly(date: Date) {
  if (!date) {
    return null;
  }
  return rnDayjs(date).format('YYYY-MM-DD');
}

export function toDateTime(date: Date) {
  if (!date) {
    return null;
  }
  return rnDayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function getTzDayjs(dayjs: any): Dayjs {
  return dayjs.tz();
}
