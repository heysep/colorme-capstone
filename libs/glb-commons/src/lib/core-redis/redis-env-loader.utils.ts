/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Redis, { Cluster } from 'ioredis';

/**
 * 환경변수 로드 시 사용하는 타입
 */
export interface RedisClientConfig {
  isDev: boolean;
  readyLog: boolean;
  host: string | null;
  port: number | null;
  password?: string;
  nodes?:
    | {
        host: string;
        port: number;
        password?: string;
      }[]
    | null;
}

/**
 * 환경변수 로드
 */
export function loadRedisEnv() {
  const readyLog = process.env?.['REDIS_READY_LOG'] || null;
  const clusterNodes = process.env?.['REDIS_CLUSTER_NODES'] || null;
  const password = process.env?.['REDIS_PASSWORD'] || null;

  if (!clusterNodes) {
    throw new Error('Redis cluster nodes configuration is not valid');
  }

  if (!readyLog || !password) {
    throw new Error('GlbRedisCoreModule Redis configuration is not valid');
  }

  // 개발 환경인지 확인
  const isDev = clusterNodes.toLocaleUpperCase().includes('__DEV__');

  // 만약 개발 환경이 아니라면 클러스터 모드 사용
  const nodes =
    isDev === false
      ? clusterNodes.split(',').map((node) => {
          const [host, port] = node.split(':');
          return {
            host,
            port: parseInt(port, 10),
            password,
          };
        })
      : null;

  return {
    isDev,
    readyLog: readyLog === 'Y' ? true : false,
    host: isDev ? 'localhost' : null,
    port: isDev ? 6379 : null,
    password,
    nodes: isDev ? null : nodes,
  };
}

/**
 * 싱글 모드 사용 시 사용
 */
export function getRedisClientConfig(
  redisClientConfig: RedisClientConfig
): Redis {
  return new Redis({
    host: redisClientConfig.host!,
    port: redisClientConfig.port!,
    password: redisClientConfig.password!,
  });
}

/**
 * 클러스터 모드 사용 시 사용
 */
export function getRedisClusterClientConfig(
  redisClientConfig: RedisClientConfig
): Cluster {
  return new Cluster(redisClientConfig.nodes!, {
    maxRedirections: 16,
    scaleReads: 'master',
    slotsRefreshInterval: 2000,
    enableReadyCheck: true,
    lazyConnect: false,
    redisOptions: {
      password: redisClientConfig.password!,
    },
  });
}
