import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from './cache';

export function cacheResponse(ttlSeconds: number, keyPrefix: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${req.originalUrl}`;
    const cached = await getCache<unknown>(key);

    if (cached !== null) {
      return res.status(200).json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void setCache(key, body, ttlSeconds);
      }
      return originalJson(body);
    };

    return next();
  };
}
