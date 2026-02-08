import { DroneController } from '../drone.controller';

function mockRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('DroneController', () => {
  const service: any = {
    registerDrone: jest.fn().mockResolvedValue({ id: 1 }),
    loadDrone: jest.fn().mockResolvedValue({ id: 1 }),
    getLoadedMedications: jest.fn().mockResolvedValue([{ id: 1 }]),
    getAvailableDrones: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], total: 1 }),
    getBatteryLevel: jest.fn().mockResolvedValue({ serialNumber: 'SN1', batteryCapacity: 80 }),
  };
  const controller = new DroneController(service);

  it('registers', async () => {
    const res = mockRes();
    await controller.register({ body: { a: 1 } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('loads medications', async () => {
    const res = mockRes();
    await controller.loadMedications({ params: { droneId: '1' }, body: { medicationIds: [1] } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('gets loaded medications', async () => {
    const res = mockRes();
    await controller.getLoadedMedications({ params: { droneId: '1' } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('gets available with pagination meta', async () => {
    const res = mockRes();
    const req: any = { query: { limit: '10', offset: '0' } };
    await controller.getAvailable(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meta: { total: 1, limit: 10, offset: 0, currentPage: 1 },
        }),
      }),
    );
  });

  it('gets available without pagination params', async () => {
    const res = mockRes();
    const req: any = { query: {} };
    await controller.getAvailable(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meta: { total: 1, limit: undefined, offset: undefined, currentPage: undefined },
        }),
      }),
    );
  });

  it('parses minBattery query', async () => {
    const res = mockRes();
    const req: any = { query: { minBattery: '25' } };
    await controller.getAvailable(req, res, jest.fn());
    expect(service.getAvailableDrones).toHaveBeenCalledWith(
      expect.objectContaining({ minBattery: 25 }),
    );
  });

  it('gets battery level', async () => {
    const res = mockRes();
    await controller.getBatteryLevel({ params: { droneId: '1' } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('passes errors to next', async () => {
    const errorService: any = {
      registerDrone: jest.fn().mockRejectedValue(new Error('fail')),
      loadDrone: jest.fn().mockRejectedValue(new Error('fail')),
      getLoadedMedications: jest.fn().mockRejectedValue(new Error('fail')),
      getAvailableDrones: jest.fn().mockRejectedValue(new Error('fail')),
      getBatteryLevel: jest.fn().mockRejectedValue(new Error('fail')),
    };
    const errorController = new DroneController(errorService);
    const next = jest.fn();
    await errorController.register({ body: {} } as any, mockRes(), next);
    await errorController.loadMedications({ params: { droneId: '1' }, body: { medicationIds: [] } } as any, mockRes(), next);
    await errorController.getLoadedMedications({ params: { droneId: '1' } } as any, mockRes(), next);
    await errorController.getAvailable({} as any, mockRes(), next);
    await errorController.getBatteryLevel({ params: { droneId: '1' } } as any, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
