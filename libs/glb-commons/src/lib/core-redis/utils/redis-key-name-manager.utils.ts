export class RedisKeyNameManager {
  public static getRedisKeyName(key: REDIS_KEY, ...options: string[]): string {
    return key.replace(/{(\d+)}/g, (match, number) => {
      return options[number] || match;
    });
  }
}

export const REDIS_KEY = {
  GLOBAL_TABLE_RELATIONS_INFO: 'GLOBAL_TABLE_RELATIONS_INFO',
  CACHE_VALUE: 'CACHE_VALUE:{0}:{1}',
  DELAYED_UPLOAD_FILE: 'DELAYED_UPLOAD_FILE:{0}',
} as const;

export type REDIS_KEY = (typeof REDIS_KEY)[keyof typeof REDIS_KEY];
