import { delCache, delCacheByPrefix, getCache, setCache } from '../cache';
import { redis } from '../../redis/connection';

describe('cache helpers', () => {
  beforeEach(() => {
    (redis as any).store?.clear();
  });

  it('set and get cache', async () => {
    await setCache('k1', { a: 1 }, 10);
    const value = await getCache<{ a: number }>('k1');
    expect(value).toEqual({ a: 1 });
  });

  it('del cache', async () => {
    await setCache('k2', { b: 2 }, 10);
    await delCache('k2');
    const value = await getCache('k2');
    expect(value).toBeNull();
  });

  it('del cache by prefix', async () => {
    await setCache('pref:1', { a: 1 }, 10);
    await setCache('pref:2', { a: 2 }, 10);
    await setCache('other:1', { a: 3 }, 10);

    await delCacheByPrefix('pref');

    const v1 = await getCache('pref:1');
    const v2 = await getCache('pref:2');
    const v3 = await getCache('other:1');

    expect(v1).toBeNull();
    expect(v2).toBeNull();
    expect(v3).toEqual({ a: 3 });
  });

  it('handles cache errors', async () => {
    const originalGet = (redis as any).get;
    const originalSet = (redis as any).set;
    const originalDel = (redis as any).del;
    const originalScan = (redis as any).scan;

    (redis as any).get = jest.fn(async () => {
      throw new Error('fail');
    });
    (redis as any).set = jest.fn(async () => {
      throw new Error('fail');
    });
    (redis as any).del = jest.fn(async () => {
      throw new Error('fail');
    });
    (redis as any).scan = jest.fn(async () => {
      throw new Error('fail');
    });

    await expect(getCache('x')).resolves.toBeNull();
    await expect(setCache('x', { a: 1 }, 0)).resolves.toBeUndefined();
    await expect(delCache('x')).resolves.toBeUndefined();
    await expect(delCacheByPrefix('x')).resolves.toBeUndefined();

    (redis as any).get = originalGet;
    (redis as any).set = originalSet;
    (redis as any).del = originalDel;
    (redis as any).scan = originalScan;
  });
});
