import { getBatteryAuditQueue } from '../queues';
import { registerBatteryAuditWorker } from '../workers';

jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

describe('bullmq wrappers', () => {
  it('creates queue', () => {
    expect(getBatteryAuditQueue().name).toBe('battery-audit');
  });

  it('creates worker', () => {
    const worker = registerBatteryAuditWorker(async () => undefined);
    expect(worker.name).toBe('battery-audit');
    return (worker as any).processor().then(() => {
      (worker as any).emit('failed', { id: '1' }, new Error('fail'));
      (worker as any).emit('completed', { id: '1' });
    });
  });
});
