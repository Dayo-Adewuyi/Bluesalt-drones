import { Worker } from 'bullmq';
import { redisBullmqConnectionOptions } from '../redis/connection';
import { QUEUE_PREFIX } from '../utils/constants';
import { logger } from '../utils/logger';

export function registerBatteryAuditWorker(
  handler: () => Promise<void>,
): Worker {
  const worker = new Worker(
    'battery-audit',
    async () => {
      await handler();
    },
    {
      connection: redisBullmqConnectionOptions,
      prefix: QUEUE_PREFIX,
      concurrency: 1,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error('Battery audit job failed', { jobId: job?.id, error: err });
  });

  worker.on('completed', (job) => {
    logger.info('Battery audit job completed', { jobId: job.id });
  });

  return worker;
}
