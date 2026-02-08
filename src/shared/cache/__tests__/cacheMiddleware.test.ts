import { cacheResponse } from '../cacheMiddleware';
import { setCache } from '../cache';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.statusCode = 200;
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('cacheResponse', () => {
  it('returns cached response when present', async () => {
    await setCache('test:/path', { ok: true }, 10);

    const req: any = { originalUrl: '/path' };
    const res = mockRes();
    const next = jest.fn();

    await cacheResponse(10, 'test')(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('caches response when not present', async () => {
    const req: any = { originalUrl: '/miss' };
    const res = mockRes();
    const next = jest.fn();

    await cacheResponse(10, 'test')(req, res, next);

    res.json({ data: 1 });
    expect(next).toHaveBeenCalled();
  });

  it('does not cache non-2xx responses', async () => {
    const req: any = { originalUrl: '/error' };
    const res: any = { statusCode: 500, json: jest.fn().mockReturnValue({}) };
    const next = jest.fn();

    await cacheResponse(10, 'test')(req, res, next);
    res.json({ error: true });

    expect(next).toHaveBeenCalled();
  });
});
