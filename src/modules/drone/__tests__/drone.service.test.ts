import { DroneService } from '../drone.service';
import { DroneState, DroneModel, IDrone } from '../drone.types';
import { ConflictError, ValidationError, NotFoundError } from '../../../shared/errors/AppError';

const baseDrone: IDrone = {
  id: 1,
  serialNumber: 'SN1',
  model: DroneModel.LIGHTWEIGHT,
  weightLimit: 200,
  batteryCapacity: 80,
  state: DroneState.IDLE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DroneService', () => {
  it('registers drone', async () => {
    const droneRepo: any = {
      count: jest.fn().mockResolvedValue(0),
      findBySerialNumber: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(baseDrone),
    };
    const medRepo: any = {};

    const service = new DroneService(droneRepo, medRepo);
    const drone = await service.registerDrone({
      serialNumber: 'SN1',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
    });

    expect(drone.serialNumber).toBe('SN1');
  });

  it('rejects fleet limit', async () => {
    const droneRepo: any = {
      count: jest.fn().mockResolvedValue(10),
      findBySerialNumber: jest.fn(),
      create: jest.fn(),
    };
    const service = new DroneService(droneRepo, {} as any);

    await expect(
      service.registerDrone({
        serialNumber: 'SN2',
        model: DroneModel.LIGHTWEIGHT,
        weightLimit: 200,
        batteryCapacity: 80,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects duplicate serial', async () => {
    const droneRepo: any = {
      count: jest.fn().mockResolvedValue(1),
      findBySerialNumber: jest.fn().mockResolvedValue(baseDrone),
      create: jest.fn(),
    };
    const service = new DroneService(droneRepo, {} as any);

    await expect(
      service.registerDrone({
        serialNumber: 'SN1',
        model: DroneModel.LIGHTWEIGHT,
        weightLimit: 200,
        batteryCapacity: 80,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('loads drone successfully', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue({ ...baseDrone, state: DroneState.IDLE }),
      getCurrentLoad: jest.fn().mockResolvedValue(0),
      addMedications: jest.fn(),
      updateState: jest.fn().mockImplementation((_id: number, state: DroneState) => {
        return { ...baseDrone, state };
      }),
    };
    const medRepo: any = {
      findByIds: jest.fn().mockResolvedValue([{ id: 1, weight: 50 }]),
    };
    const service = new DroneService(droneRepo, medRepo);

    const drone = await service.loadDrone(1, [1]);
    expect(drone.state).toBe(DroneState.LOADED);
  });

  it('rejects invalid drone state', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue({ ...baseDrone, state: DroneState.DELIVERING }),
    };
    const service = new DroneService(droneRepo, {} as any);

    await expect(service.loadDrone(1, [1])).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects low battery', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue({ ...baseDrone, batteryCapacity: 10 }),
    };
    const service = new DroneService(droneRepo, {} as any);

    await expect(service.loadDrone(1, [1])).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects missing medication', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue(baseDrone),
    };
    const medRepo: any = { findByIds: jest.fn().mockResolvedValue([]) };
    const service = new DroneService(droneRepo, medRepo);

    await expect(service.loadDrone(1, [1])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects when some medications missing', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue(baseDrone),
    };
    const medRepo: any = { findByIds: jest.fn().mockResolvedValue([{ id: 1, weight: 10 }]) };
    const service = new DroneService(droneRepo, medRepo);

    await expect(service.loadDrone(1, [1, 2])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects when drone not found', async () => {
    const droneRepo: any = { findById: jest.fn().mockResolvedValue(null) };
    const service = new DroneService(droneRepo, {} as any);
    await expect(service.loadDrone(99, [1])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects when loaded medications requested for missing drone', async () => {
    const droneRepo: any = { findById: jest.fn().mockResolvedValue(null) };
    const service = new DroneService(droneRepo, {} as any);
    await expect(service.getLoadedMedications(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects weight limit exceeded', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue(baseDrone),
      getCurrentLoad: jest.fn().mockResolvedValue(190),
    };
    const medRepo: any = { findByIds: jest.fn().mockResolvedValue([{ id: 1, weight: 20 }]) };
    const service = new DroneService(droneRepo, medRepo);

    await expect(service.loadDrone(1, [1])).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects invalid state transition', async () => {
    const droneRepo: any = { updateState: jest.fn() };
    const service = new DroneService(droneRepo, {} as any);
    const drone = { ...baseDrone, state: DroneState.LOADED };
    await expect((service as any).transitionState(drone, DroneState.IDLE)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('rejects transition when battery low', async () => {
    const droneRepo: any = { updateState: jest.fn() };
    const service = new DroneService(droneRepo, {} as any);
    const drone = { ...baseDrone, state: DroneState.IDLE, batteryCapacity: 10 };
    await expect((service as any).transitionState(drone, DroneState.LOADING)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('gets available drones', async () => {
    const droneRepo: any = { findAvailable: jest.fn().mockResolvedValue({ rows: [baseDrone], total: 1 }) };
    const service = new DroneService(droneRepo, {} as any);
    const drones = await service.getAvailableDrones();
    expect(drones.rows.length).toBe(1);
  });

  it('gets battery level', async () => {
    const droneRepo: any = { findById: jest.fn().mockResolvedValue(baseDrone) };
    const service = new DroneService(droneRepo, {} as any);
    const battery = await service.getBatteryLevel(1);
    expect(battery.serialNumber).toBe('SN1');
  });

  it('throws when battery drone not found', async () => {
    const droneRepo: any = { findById: jest.fn().mockResolvedValue(null) };
    const service = new DroneService(droneRepo, {} as any);
    await expect(service.getBatteryLevel(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('gets loaded medications', async () => {
    const droneRepo: any = {
      findById: jest.fn().mockResolvedValue(baseDrone),
      getLoadedMedications: jest.fn().mockResolvedValue([{ id: 1 }]),
    };
    const service = new DroneService(droneRepo, {} as any);
    const meds = await service.getLoadedMedications(1);
    expect(meds.length).toBe(1);
  });
});
