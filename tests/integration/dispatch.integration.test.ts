import { DroneRepository } from '../../src/modules/drone/drone.repository';
import { MedicationRepository } from '../../src/modules/medication/medication.repository';
import { DroneService } from '../../src/modules/drone/drone.service';
import { MedicationService } from '../../src/modules/medication/medication.service';
import { DroneModel } from '../../src/modules/drone/drone.types';
import { resetDatabase, closeDatabase } from '../helpers/db';

const droneRepo = new DroneRepository();
const medicationRepo = new MedicationRepository();
const medicationService = new MedicationService(medicationRepo);
const droneService = new DroneService(droneRepo, medicationRepo);

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Dispatch integration (service + repository + DB)', () => {
  it('registers, loads, and queries drone', async () => {
    const med = await medicationService.createMedication({ name: 'Med1', weight: 50, code: 'MED_1' });

    const drone = await droneService.registerDrone({
      serialNumber: 'SN1',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    const loaded = await droneService.loadDrone(drone.id, [med.id]);
    expect(loaded.id).toBe(drone.id);

    const meds = await droneService.getLoadedMedications(drone.id);
    expect(meds.length).toBe(1);

    const available = await droneService.getAvailableDrones({ limit: 10, offset: 0 });
    expect(available.rows.length).toBe(0);
    expect(available.total).toBe(0);

    const battery = await droneService.getBatteryLevel(drone.id);
    expect(battery.serialNumber).toBe('SN1');
  });

  it('rejects weight limit', async () => {
    const med = await medicationService.createMedication({ name: 'Med2', weight: 300, code: 'MED_2' });

    const drone = await droneService.registerDrone({
      serialNumber: 'SN2',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 100,
      batteryCapacity: 80,
    });

    await expect(droneService.loadDrone(drone.id, [med.id])).rejects.toThrow('Weight limit exceeded');
  });
});
