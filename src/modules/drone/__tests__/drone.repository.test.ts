import { DroneRepository } from '../drone.repository';
import { MedicationRepository } from '../../medication/medication.repository';
import { DroneModel, DroneState } from '../drone.types';
import { resetDatabase, closeDatabase } from '../../../../tests/helpers/db';
import { DroneLoadModel } from '../../medication/medication.model';
import { DroneModel as DroneModelEntity } from '../drone.model';

const droneRepo = new DroneRepository();
const medRepo = new MedicationRepository();

describe('DroneRepository', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('creates and finds drone', async () => {
    const created = await droneRepo.create({
      serialNumber: 'SN1',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    const found = await droneRepo.findById(created.id);
    expect(found?.serialNumber).toBe('SN1');
  });

  it('returns null when drone not found', async () => {
    const found = await droneRepo.findById(999);
    expect(found).toBeNull();
  });

  it('finds by serial', async () => {
    await droneRepo.create({
      serialNumber: 'SN2',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    const found = await droneRepo.findBySerialNumber('SN2');
    expect(found).not.toBeNull();
  });

  it('finds available', async () => {
    await droneRepo.create({
      serialNumber: 'SN3',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    const available = await droneRepo.findAvailable();
    expect(available.rows.length).toBeGreaterThan(0);
    expect(available.total).toBeGreaterThan(0);
  });

  it('finds available with filters', async () => {
    await droneRepo.create({
      serialNumber: 'SNF-1',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 90,
    });
    await droneRepo.create({
      serialNumber: 'SNF-2',
      model: DroneModel.HEAVYWEIGHT,
      weightLimit: 500,
      batteryCapacity: 30,
    });

    const filtered = await droneRepo.findAvailable({
      model: DroneModel.LIGHTWEIGHT,
      minBattery: 50,
      search: 'SNF',
      limit: 10,
      offset: 0,
    });
    expect(filtered.rows.length).toBe(1);
    expect(filtered.total).toBe(1);
  });

  it('finds all', async () => {
    await droneRepo.create({
      serialNumber: 'SN6',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });
    const all = await droneRepo.findAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('updates state', async () => {
    const created = await droneRepo.create({
      serialNumber: 'SN4',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    const updated = await droneRepo.updateState(created.id, DroneState.LOADING);
    expect(updated.state).toBe(DroneState.LOADING);
  });

  it('throws when updating missing drone', async () => {
    await expect(droneRepo.updateState(999, DroneState.LOADING)).rejects.toThrow('Drone not found');
  });

  it('gets current load and loaded medications', async () => {
    const drone = await droneRepo.create({
      serialNumber: 'SN5',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });
    const med = await medRepo.create({ name: 'Med1', weight: 30, code: 'MED_1', image: null });

    await droneRepo.addMedications(drone.id, [med.id]);

    const load = await droneRepo.getCurrentLoad(drone.id);
    expect(load).toBe(30);

    const meds = await droneRepo.getLoadedMedications(drone.id);
    expect(meds.length).toBe(1);
  });

  it('returns empty loaded medications when missing', async () => {
    const meds = await droneRepo.getLoadedMedications(999);
    expect(meds.length).toBe(0);
  });

  it('returns empty when medications not attached', async () => {
    const spy = jest.spyOn(DroneModelEntity, 'findByPk').mockResolvedValueOnce({} as any);
    const meds = await droneRepo.getLoadedMedications(1);
    expect(meds.length).toBe(0);
    spy.mockRestore();
  });

  it('returns zero load when empty', async () => {
    const load = await droneRepo.getCurrentLoad(999);
    expect(load).toBe(0);
  });

  it('handles missing medication weights', async () => {
    const spy = jest.spyOn(DroneLoadModel, 'findAll').mockResolvedValueOnce([{ MedicationModel: null }] as any);
    const load = await droneRepo.getCurrentLoad(1);
    expect(load).toBe(0);
    spy.mockRestore();
  });
});
