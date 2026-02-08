import 'dotenv/config';
import cron from 'node-cron';
import { app } from './app';
import { DEFAULT_PORT, BATTERY_CHECK_CRON } from './shared/utils/constants';
import { logger } from './shared/utils/logger';
import { syncAndSeed } from './shared/database/sync';
import { isRedisAvailable } from './shared/redis/connection';
import './modules/medication/medication.model';
import './modules/drone/drone.model';
import './modules/audit/audit.model';
import { AuditRepository } from './modules/audit/audit.repository';
import { AuditService } from './modules/audit/audit.service';
import { registerAuditSubscribers } from './modules/audit/audit.subscriber';
import { DroneRepository } from './modules/drone/drone.repository';
import { scheduleBatteryAudit, runBatteryAudit } from './modules/audit/audit.job';
import { registerBatteryAuditWorker } from './shared/queue/workers';

async function bootstrap(): Promise<void> {
  try {
    await syncAndSeed(false);

    const auditRepository = new AuditRepository();
    const auditService = new AuditService(auditRepository);
    const droneRepository = new DroneRepository();

    registerAuditSubscribers(auditService);

    const auditHandler = () => runBatteryAudit(droneRepository, auditService);

    let queueStarted = false;
    if (isRedisAvailable()) {
      try {
        registerBatteryAuditWorker(auditHandler);
        await scheduleBatteryAudit();
        queueStarted = true;
      } catch (queueError) {
        logger.warn('BullMQ queue initialization failed, falling back to node-cron', {
          error: queueError,
        });
      }
    }

    if (!queueStarted) {
      cron.schedule(BATTERY_CHECK_CRON, async () => {
        try {
          await auditHandler();
          logger.info('Battery audit completed via node-cron');
        } catch (err) {
          logger.error('Battery audit via node-cron failed', { error: err });
        }
      });
      logger.info(
        `Battery audit scheduled via node-cron (Redis unavailable): ${BATTERY_CHECK_CRON}`,
      );
    }

    app.listen(DEFAULT_PORT, () => {
      logger.info(`Server listening on port ${DEFAULT_PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

void bootstrap();
