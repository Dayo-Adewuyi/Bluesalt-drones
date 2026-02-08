import { scheduleBatteryAudit, runBatteryAudit } from '../audit.job';
import { getBatteryAuditQueue } from '../../../shared/queue/queues';
import { AuditEventType } from '../audit.types';

const droneRepository: any = {
  findAll: jest.fn().mockResolvedValue([
    { id: 1, serialNumber: 'SN1', batteryCapacity: 80, state: 'IDLE' },
  ]),
};

const auditService: any = {
  logBatteryChecks: jest.fn().mockResolvedValue([]),
};

describe('audit job', () => {
  it('schedules battery audit', async () => {
    await scheduleBatteryAudit('*/5 * * * *');
    expect(getBatteryAuditQueue().add).toHaveBeenCalled();
  });

  it('schedules battery audit with default cron', async () => {
    await scheduleBatteryAudit();
    expect(getBatteryAuditQueue().add).toHaveBeenCalled();
  });

  it('runs battery audit', async () => {
    await runBatteryAudit(droneRepository, auditService);
    expect(auditService.logBatteryChecks).toHaveBeenCalledWith([
      {
        droneId: 1,
        serialNumber: 'SN1',
        eventType: AuditEventType.BATTERY_CHECK,
        details: { batteryCapacity: 80, state: 'IDLE' },
      },
    ]);
  });

  it('skips when no drones', async () => {
    const emptyRepo: any = { findAll: jest.fn().mockResolvedValue([]) };
    const svc: any = { logBatteryChecks: jest.fn() };
    await runBatteryAudit(emptyRepo, svc);
    expect(svc.logBatteryChecks).not.toHaveBeenCalled();
  });
});
