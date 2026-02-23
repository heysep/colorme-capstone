import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import {
  getRedisClientConfig,
  getRedisClusterClientConfig,
  RedisClientConfig,
} from '../redis-env-loader.utils';

@Injectable()
export class GlbRedisCoreService {
  private readonly logger = new Logger(GlbRedisCoreService.name);
  public static readonly CHECK_SUM_KEY = `${GlbRedisCoreService.name}:CHECK_SUM`;
  private readonly redis: Cluster | Redis | null;

  constructor(
    @Inject('GlbRedisCoreModule.RootConfig')
    private readonly redisClientConfig: RedisClientConfig
  ) {
    this.logger.log(
      `RedisClientConfig: ${JSON.stringify({
        ...this.redisClientConfig,
        password: this.redisClientConfig?.password
          ? this.redisClientConfig?.password.slice(0, 3) +
            '***' +
            this.redisClientConfig?.password.slice(-3)
          : null,
        nodes: (this.redisClientConfig?.nodes ?? []).map((node) => ({
          ...node,
          password: node?.password
            ? node?.password.slice(0, 3) + '***' + node?.password.slice(-3)
            : null,
        })),
      })}`
    );

    if (this.redisClientConfig.isDev) {
      this.redis = getRedisClientConfig(this.redisClientConfig);
    } else {
      this.redis = getRedisClusterClientConfig(this.redisClientConfig);
    }

    if (this.redisClientConfig.readyLog) {
      this.redis?.on('connect', () => {
        this.logger.log('Redis connecting...');
      });

      this.redis?.on('ready', () => {
        this.logger.log('Redis is ready');
      });

      this.redis?.on('error', (error) => {
        this.logger.error(
          'Redis error',
          error?.message ?? JSON.stringify(error)
        );
      });

      this.redis?.on('close', () => {
        this.logger.log('Redis connection closed');
      });

      this.redis?.on('reconnecting', () => {
        this.logger.log('Redis reconnecting...');
      });
    }
  }

  getRedis(): Cluster | Redis {
    if (!this.redis || this.redis === null) {
      throw new Error('GlbRedisCoreService - Redis is not connected');
    }

    return this.redis;
  }

  getCheckSumKey(): string {
    return GlbRedisCoreService.CHECK_SUM_KEY;
  }
}
