import { sequelize } from './connection';
import { logger } from '../utils/logger';
import { DroneModel } from '../../modules/drone/drone.model';
import { MedicationModel } from '../../modules/medication/medication.model';
import { droneSeedData } from '../../seeds/drones.seed';
import { medicationSeedData } from '../../seeds/medications.seed';

export async function syncDatabase(force: boolean = false): Promise<void> {
  await sequelize.sync({ force });
  logger.info('Database synced', { force });
}

export async function seedDatabase(): Promise<void> {
  const droneCount = await DroneModel.count();
  if (droneCount === 0) {
    await sequelize.transaction(async (transaction) => {
      await DroneModel.bulkCreate(droneSeedData, { transaction });
      await MedicationModel.bulkCreate(medicationSeedData, { transaction });
    });
    logger.info('Database seeded successfully');
  }
}

export async function syncAndSeed(force: boolean = false): Promise<void> {
  await sequelize.sync({ force });
  await seedDatabase();
}
