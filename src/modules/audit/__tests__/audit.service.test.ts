import { AuditService } from '../audit.service';
import { AuditEventType } from '../audit.types';

const repo: any = {
  create: jest.fn().mockResolvedValue({ id: 1 }),
  createBulk: jest.fn().mockResolvedValue([{ id: 1 }]),
  findByDroneId: jest.fn().mockResolvedValue([]),
};

describe('AuditService', () => {
  it('logs event', async () => {
    const service = new AuditService(repo);
    const log = await service.logEvent(1, 'SN1', AuditEventType.STATE_CHANGE, { a: 1 });
    expect(log).toEqual({ id: 1 });
  });

  it('logs battery checks', async () => {
    const service = new AuditService(repo);
    const logs = await service.logBatteryChecks([
      { droneId: 1, serialNumber: 'SN1', eventType: AuditEventType.BATTERY_CHECK, details: { a: 1 } },
    ]);
    expect(logs.length).toBe(1);
  });

  it('gets audit history', async () => {
    const service = new AuditService(repo);
    const logs = await service.getAuditHistory(1);
    expect(logs).toEqual([]);
  });
});
