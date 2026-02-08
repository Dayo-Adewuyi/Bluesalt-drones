
describe('constants', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('uses defaults when env not set', async () => {
    delete process.env.PORT;
    delete process.env.DB_DIALECT;
    delete process.env.DB_STORAGE;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.BATTERY_CHECK_CRON;
    delete process.env.UPLOAD_DIR;
    delete process.env.MAX_FILE_SIZE;
    delete process.env.LOG_LEVEL;
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
    delete process.env.REDIS_DB;
    delete process.env.REDIS_TLS;
    delete process.env.QUEUE_PREFIX;

    const constants = await import('../constants');
    expect(constants.DEFAULT_PORT).toBe(3000);
    expect(constants.DB_DIALECT).toBe('sqlite');
  });

  it('uses env values when set', async () => {
    process.env.PORT = '4000';
    process.env.DB_DIALECT = 'postgres';
    process.env.DB_STORAGE = './db.sqlite';
    process.env.DB_HOST = 'db';
    process.env.DB_PORT = '5433';
    process.env.DB_NAME = 'testdb';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.BATTERY_CHECK_CRON = '*/2 * * * *';
    process.env.UPLOAD_DIR = './uploads';
    process.env.MAX_FILE_SIZE = '123';
    process.env.LOG_LEVEL = 'debug';
    process.env.RATE_LIMIT_WINDOW_MS = '1000';
    process.env.RATE_LIMIT_MAX = '5';
    process.env.REDIS_HOST = 'redis';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'secret';
    process.env.REDIS_DB = '2';
    process.env.REDIS_TLS = 'true';
    process.env.QUEUE_PREFIX = 'test-queue';

    const constants = await import('../constants');
    expect(constants.DEFAULT_PORT).toBe(4000);
    expect(constants.DB_DIALECT).toBe('postgres');
    expect(constants.REDIS_TLS).toBe('true');
  });
});
