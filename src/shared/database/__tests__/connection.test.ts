
describe('database connection config', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('uses sqlite config when DB_DIALECT is sqlite', async () => {
    process.env.DB_DIALECT = 'sqlite';
    process.env.DB_STORAGE = ':memory:';

    const Sequelize = jest.fn().mockImplementation(() => ({ getDialect: () => 'sqlite' }));
    jest.doMock('sequelize', () => ({ Sequelize }));

    const { sequelize } = await import('../connection');
    expect(sequelize.getDialect()).toBe('sqlite');
  });

  it('uses postgres config when DB_DIALECT is postgres', async () => {
    process.env.DB_DIALECT = 'postgres';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'db';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';

    const Sequelize = jest.fn().mockImplementation(() => ({ getDialect: () => 'postgres' }));
    jest.doMock('sequelize', () => ({ Sequelize }));

    const { sequelize } = await import('../connection');
    expect(sequelize.getDialect()).toBe('postgres');
  });
});
