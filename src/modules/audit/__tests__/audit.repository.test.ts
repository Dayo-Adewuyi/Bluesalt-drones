import { AuditRepository } from '../audit.repository';
import { AuditEventType } from '../audit.types';
import { resetDatabase, closeDatabase } from '../../../../tests/helpers/db';

const repo = new AuditRepository();

describe('AuditRepository', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('creates and finds logs', async () => {
    await repo.create({
      droneId: 1,
      serialNumber: 'SN1',
      eventType: AuditEventType.STATE_CHANGE,
      details: { a: 1 },
    });

    const byDrone = await repo.findByDroneId(1);
    const byEvent = await repo.findByEventType(AuditEventType.STATE_CHANGE);

    expect(byDrone.length).toBe(1);
    expect(byEvent.length).toBe(1);
  });

  it('bulk creates', async () => {
    const logs = await repo.createBulk([
      { droneId: 1, serialNumber: 'SN1', eventType: AuditEventType.BATTERY_CHECK, details: { b: 1 } },
    ]);
    expect(logs.length).toBe(1);
  });
});
