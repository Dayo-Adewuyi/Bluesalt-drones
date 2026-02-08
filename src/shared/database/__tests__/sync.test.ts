import { seedDatabase, syncAndSeed, syncDatabase } from '../sync';
import { sequelize } from '../connection';
import { DroneModel } from '../../../modules/drone/drone.model';
import { MedicationModel } from '../../../modules/medication/medication.model';
import { resetDatabase, closeDatabase } from '../../../../tests/helpers/db';

describe('database sync', () => {
  afterAll(async () => {
    await closeDatabase();
  });

  it('syncDatabase works', async () => {
    await syncDatabase(true);
    const tables = await sequelize.getQueryInterface().showAllTables();
    expect(tables.length).toBeGreaterThan(0);
  });

  it('syncDatabase works with default force=false', async () => {
    await syncDatabase(false);
    const tables = await sequelize.getQueryInterface().showAllTables();
    expect(tables.length).toBeGreaterThan(0);
  });

  it('syncDatabase works with no args', async () => {
    await syncDatabase();
    const tables = await sequelize.getQueryInterface().showAllTables();
    expect(tables.length).toBeGreaterThan(0);
  });

  it('syncAndSeed seeds when empty', async () => {
    await resetDatabase();
    await syncAndSeed(false);

    const droneCount = await DroneModel.count();
    const medicationCount = await MedicationModel.count();

    expect(droneCount).toBeGreaterThan(0);
    expect(medicationCount).toBeGreaterThan(0);
  });

  it('syncAndSeed works with no args', async () => {
    await resetDatabase();
    await expect(syncAndSeed()).resolves.toBeUndefined();
  });

  it('syncAndSeed works with force=true', async () => {
    await resetDatabase();
    await expect(syncAndSeed(true)).resolves.toBeUndefined();
  });

  it('seedDatabase works with no args', async () => {
    await resetDatabase();
    await expect(seedDatabase()).resolves.toBeUndefined();
  });

  it('seedDatabase is idempotent when already seeded', async () => {
    await resetDatabase();
    await seedDatabase();
    await seedDatabase();
    const droneCount = await DroneModel.count();
    expect(droneCount).toBeGreaterThan(0);
  });

  it('seedDatabase skips when drones already exist', async () => {
    await resetDatabase();
    await DroneModel.create({
      serialNumber: 'SN-SEED-1',
      model: 'Lightweight',
      weightLimit: 100,
      batteryCapacity: 50,
    } as any);
    const before = await DroneModel.count();
    await seedDatabase();
    const after = await DroneModel.count();
    expect(after).toBe(before);
  });
});
