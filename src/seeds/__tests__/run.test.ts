
describe('seed runner', () => {
  const originalExit = process.exit;

  afterEach(() => {
    process.exit = originalExit;
    jest.resetModules();
  });

  it('runs successfully', async () => {
    jest.doMock('../../shared/database/connection', () => ({
      sequelize: { close: jest.fn().mockResolvedValue(undefined) },
    }));
    jest.doMock('../../shared/database/sync', () => ({
      syncDatabase: jest.fn().mockResolvedValue(undefined),
      seedDatabase: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../../shared/utils/logger', () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

    await import('../run');
  });

  it('handles failure', async () => {
    process.exit = jest.fn() as any;

    jest.doMock('../../shared/database/connection', () => ({
      sequelize: { close: jest.fn().mockResolvedValue(undefined) },
    }));
    jest.doMock('../../shared/database/sync', () => ({
      syncDatabase: jest.fn().mockRejectedValue(new Error('fail')),
      seedDatabase: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../../shared/utils/logger', () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

    await import('../run');

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
