import { Queue } from 'bullmq';
import { redisBullmqConnectionOptions } from '../redis/connection';
import { QUEUE_PREFIX } from '../utils/constants';

let _batteryAuditQueue: Queue | null = null;

export function getBatteryAuditQueue(): Queue {
  if (!_batteryAuditQueue) {
    _batteryAuditQueue = new Queue('battery-audit', {
      connection: redisBullmqConnectionOptions,
      prefix: QUEUE_PREFIX,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    });
  }
  return _batteryAuditQueue;
}
