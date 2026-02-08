import { redis, isRedisAvailable, redisBullmqConnectionOptions, redisConnectionOptions } from '../connection';

jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

describe('redis connection', () => {
  it('has separate options for cache and bullmq', () => {
    expect(redisConnectionOptions).toBeDefined();
    expect(redisBullmqConnectionOptions).toBeDefined();
    expect(redisBullmqConnectionOptions.maxRetriesPerRequest).toBeNull();
  });

  it('creates redis client when enabled', () => {
    expect(redis).not.toBeNull();
  });

  it('emits events', () => {
    redis!.emit('error', new Error('fail'));
    redis!.emit('connect');
  });

  it('exports isRedisAvailable', () => {
    expect(typeof isRedisAvailable).toBe('function');
  });

  it('sets tls when REDIS_TLS is true', async () => {
    jest.resetModules();
    process.env.REDIS_TLS = 'true';
    const { redisConnectionOptions: opts } = await import('../connection');
    expect(opts.tls).toBeDefined();
  });
});
