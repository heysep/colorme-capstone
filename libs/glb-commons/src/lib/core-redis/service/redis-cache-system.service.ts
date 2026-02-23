import { Injectable } from '@nestjs/common';
import { GlbRedisCoreService } from './redis-root.service';

@Injectable()
export class GlbRedisCacheSystemService {
  public static readonly DEFAULT_TTL = 60 * 10;

  constructor(private readonly redis: GlbRedisCoreService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(key: string): Promise<any> {
    const data = await this.redis.getRedis().get(key);
    return data ? JSON.parse(data) : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.getRedis().set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.getRedis().del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.getRedis().exists(key)) === 1;
  }
}
