
describe('server bootstrap', () => {
  const originalExit = process.exit;

  afterEach(() => {
    process.exit = originalExit;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('starts server on success', async () => {
    const listen = jest.fn((_port: number, cb: () => void) => cb());

    jest.doMock('../app', () => ({ app: { listen } }));
    jest.doMock('../shared/database/sync', () => ({ syncDatabase: jest.fn().mockResolvedValue(undefined) }));
    jest.doMock('../shared/redis/connection', () => ({ isRedisAvailable: jest.fn().mockReturnValue(false) }));
    jest.doMock('../modules/audit/audit.repository', () => ({ AuditRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.service', () => ({ AuditService: jest.fn() }));
    jest.doMock('../modules/audit/audit.subscriber', () => ({ registerAuditSubscribers: jest.fn() }));
    jest.doMock('../modules/drone/drone.repository', () => ({ DroneRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.job', () => ({
      scheduleBatteryAudit: jest.fn().mockResolvedValue(undefined),
      runBatteryAudit: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../shared/queue/workers', () => ({
      registerBatteryAuditWorker: jest.fn(),
    }));
    jest.doMock('node-cron', () => ({ schedule: jest.fn() }));

    await import('../server');
    await new Promise((r) => setImmediate(r));

    expect(listen).toHaveBeenCalled();
  });

  it('uses bullmq when redis available', async () => {
    const listen = jest.fn((_port: number, cb: () => void) => cb());
    const registerBatteryAuditWorker = jest.fn();
    const scheduleBatteryAudit = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../app', () => ({ app: { listen } }));
    jest.doMock('../shared/database/sync', () => ({ syncDatabase: jest.fn().mockResolvedValue(undefined) }));
    jest.doMock('../shared/redis/connection', () => ({ isRedisAvailable: jest.fn().mockReturnValue(true) }));
    jest.doMock('../modules/audit/audit.repository', () => ({ AuditRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.service', () => ({ AuditService: jest.fn() }));
    jest.doMock('../modules/audit/audit.subscriber', () => ({ registerAuditSubscribers: jest.fn() }));
    jest.doMock('../modules/drone/drone.repository', () => ({ DroneRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.job', () => ({
      scheduleBatteryAudit,
      runBatteryAudit: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../shared/queue/workers', () => ({ registerBatteryAuditWorker }));
    jest.doMock('node-cron', () => ({ schedule: jest.fn() }));

    await import('../server');
    await new Promise((r) => setImmediate(r));

    expect(registerBatteryAuditWorker).toHaveBeenCalled();
    expect(scheduleBatteryAudit).toHaveBeenCalled();
  });

  it('exits on failure', async () => {
    const listen = jest.fn();
    process.exit = jest.fn() as any;

    jest.doMock('../app', () => ({ app: { listen } }));
    jest.doMock('../shared/database/sync', () => ({ syncDatabase: jest.fn().mockRejectedValue(new Error('fail')) }));
    jest.doMock('../shared/redis/connection', () => ({ isRedisAvailable: jest.fn().mockReturnValue(false) }));
    jest.doMock('../modules/audit/audit.repository', () => ({ AuditRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.service', () => ({ AuditService: jest.fn() }));
    jest.doMock('../modules/audit/audit.subscriber', () => ({ registerAuditSubscribers: jest.fn() }));
    jest.doMock('../modules/drone/drone.repository', () => ({ DroneRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.job', () => ({
      scheduleBatteryAudit: jest.fn().mockResolvedValue(undefined),
      runBatteryAudit: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../shared/queue/workers', () => ({
      registerBatteryAuditWorker: jest.fn(),
    }));
    jest.doMock('node-cron', () => ({ schedule: jest.fn() }));

    await import('../server');
    await new Promise((r) => setImmediate(r));

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('falls back to node-cron when bullmq fails', async () => {
    const listen = jest.fn((_port: number, cb: () => void) => cb());
    const cronSchedule = jest.fn();
    const loggerWarn = jest.fn();

    jest.doMock('../shared/utils/logger', () => ({ logger: { info: jest.fn(), warn: loggerWarn, error: jest.fn() } }));
    jest.doMock('../app', () => ({ app: { listen } }));
    jest.doMock('../shared/database/sync', () => ({ syncDatabase: jest.fn().mockResolvedValue(undefined) }));
    jest.doMock('../shared/redis/connection', () => ({ isRedisAvailable: jest.fn().mockReturnValue(true) }));
    jest.doMock('../modules/audit/audit.repository', () => ({ AuditRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.service', () => ({ AuditService: jest.fn() }));
    jest.doMock('../modules/audit/audit.subscriber', () => ({ registerAuditSubscribers: jest.fn() }));
    jest.doMock('../modules/drone/drone.repository', () => ({ DroneRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.job', () => ({
      scheduleBatteryAudit: jest.fn().mockRejectedValue(new Error('queue fail')),
      runBatteryAudit: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../shared/queue/workers', () => ({
      registerBatteryAuditWorker: jest.fn(),
    }));
    jest.doMock('node-cron', () => ({ schedule: cronSchedule }));

    await import('../server');
    await new Promise((r) => setImmediate(r));

    expect(loggerWarn).toHaveBeenCalledWith(
      'BullMQ queue initialization failed, falling back to node-cron',
      expect.any(Object),
    );
    expect(cronSchedule).toHaveBeenCalled();
  });

  it('uses node-cron when redis unavailable', async () => {
    const listen = jest.fn((_port: number, cb: () => void) => cb());
    const cronSchedule = jest.fn();

    jest.doMock('../app', () => ({ app: { listen } }));
    jest.doMock('../shared/database/sync', () => ({ syncDatabase: jest.fn().mockResolvedValue(undefined) }));
    jest.doMock('../shared/redis/connection', () => ({ isRedisAvailable: jest.fn().mockReturnValue(false) }));
    jest.doMock('../modules/audit/audit.repository', () => ({ AuditRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.service', () => ({ AuditService: jest.fn() }));
    jest.doMock('../modules/audit/audit.subscriber', () => ({ registerAuditSubscribers: jest.fn() }));
    jest.doMock('../modules/drone/drone.repository', () => ({ DroneRepository: jest.fn() }));
    jest.doMock('../modules/audit/audit.job', () => ({
      scheduleBatteryAudit: jest.fn().mockResolvedValue(undefined),
      runBatteryAudit: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../shared/queue/workers', () => ({
      registerBatteryAuditWorker: jest.fn(),
    }));
    jest.doMock('node-cron', () => ({ schedule: cronSchedule }));

    await import('../server');
    await new Promise((r) => setImmediate(r));

    expect(cronSchedule).toHaveBeenCalled();
  });
});
