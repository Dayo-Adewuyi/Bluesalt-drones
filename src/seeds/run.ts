import { sequelize } from '../shared/database/connection';
import { seedDatabase, syncDatabase } from '../shared/database/sync';
import { logger } from '../shared/utils/logger';

async function run(): Promise<void> {
  try {
    await syncDatabase(true);
    await seedDatabase();

    logger.info('Seeds applied successfully');
  } catch (error) {
    logger.error('Seed failed', { error });
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

void run();
