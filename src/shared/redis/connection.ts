import Redis from 'ioredis';
import {
  REDIS_DB,
  REDIS_ENABLED,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_TLS,
} from '../utils/constants';
import { logger } from '../utils/logger';

const useTls = String(REDIS_TLS).toLowerCase() === 'true';

export const redisConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  db: REDIS_DB,
  tls: useTls ? {} : undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
} as const;

export const redisBullmqConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  db: REDIS_DB,
  tls: useTls ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} as const;

let redisAvailable = false;

function createRedisClient(): Redis | null {
  if (!REDIS_ENABLED) {
    logger.info('Redis disabled via REDIS_ENABLED=false, caching and BullMQ queues will be skipped');
    return null;
  }

  const client = new Redis({
    ...redisConnectionOptions,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries, running without Redis');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('error', (error) => {
    if (redisAvailable) {
      logger.error('Redis error', { error: error.message });
    }
    redisAvailable = false;
  });

  client.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis connected');
  });

  client.on('close', () => {
    redisAvailable = false;
  });

  client.connect().catch(() => {
    redisAvailable = false;
    logger.warn('Redis unavailable, running without caching and BullMQ queues');
  });

  return client;
}

export const redis: Redis | null = createRedisClient();

export function isRedisAvailable(): boolean {
  return REDIS_ENABLED && redisAvailable && redis !== null;
}
