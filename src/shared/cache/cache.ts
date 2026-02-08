import { redis, isRedisAvailable } from '../redis/connection';
import { logger } from '../utils/logger';

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  try {
    const value = await redis!.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logger.warn('Cache get failed', { key, error });
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis!.set(key, payload, 'EX', ttlSeconds);
    } else {
      await redis!.set(key, payload);
    }
  } catch (error) {
    logger.warn('Cache set failed', { key, error });
  }
}

export async function delCache(key: string): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    await redis!.del(key);
  } catch (error) {
    logger.warn('Cache del failed', { key, error });
  }
}

export async function delCacheByPrefix(prefix: string): Promise<void> {
  if (!isRedisAvailable()) return;
  const pattern = `${prefix}:*`;
  let cursor = '0';

  try {
    do {
      const [nextCursor, keys] = await redis!.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis!.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.warn('Cache prefix delete failed', { prefix, error });
  }
}
