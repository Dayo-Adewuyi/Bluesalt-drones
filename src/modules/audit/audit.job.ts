import { getBatteryAuditQueue } from '../../shared/queue/queues';
import { BATTERY_CHECK_CRON } from '../../shared/utils/constants';
import { logger } from '../../shared/utils/logger';
import { DroneRepository } from '../drone/drone.repository';
import { AuditService } from './audit.service';
import { AuditEventType, CreateAuditDTO } from './audit.types';

export async function scheduleBatteryAudit(cron: string = BATTERY_CHECK_CRON): Promise<void> {
  const queue = getBatteryAuditQueue();
  await queue.add(
    'battery-audit',
    {},
    {
      repeat: { pattern: cron },
      jobId: 'battery-audit-cron',
    },
  );

  logger.info(`Battery audit scheduled via BullMQ: ${cron}`);
}

export async function runBatteryAudit(
  droneRepository: DroneRepository,
  auditService: AuditService,
): Promise<void> {
  const drones = await droneRepository.findAll();
  const entries: CreateAuditDTO[] = drones.map((drone) => ({
    droneId: drone.id,
    serialNumber: drone.serialNumber,
    eventType: AuditEventType.BATTERY_CHECK,
    details: {
      batteryCapacity: drone.batteryCapacity,
      state: drone.state,
    },
  }));
  if (entries.length > 0) {
    await auditService.logBatteryChecks(entries);
  }
}
