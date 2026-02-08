import { MedicationController } from '../medication.controller';

function mockRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('MedicationController', () => {
  const service: any = {
    createMedication: jest.fn().mockResolvedValue({ id: 1 }),
    getAllMedications: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], total: 1 }),
    getMedicationById: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const controller = new MedicationController(service);

  it('creates', async () => {
    const res = mockRes();
    await controller.create({ body: { a: 1 } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('gets all with pagination meta', async () => {
    const res = mockRes();
    const req: any = { query: { limit: '10', offset: '0' } };
    await controller.getAll(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meta: { total: 1, limit: 10, offset: 0, currentPage: 1 },
        }),
      }),
    );
  });

  it('gets all without pagination params', async () => {
    const res = mockRes();
    const req: any = { query: {} };
    await controller.getAll(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meta: { total: 1, limit: undefined, offset: undefined, currentPage: undefined },
        }),
      }),
    );
  });

  it('parses weight filters', async () => {
    const res = mockRes();
    const req: any = { query: { minWeight: '10', maxWeight: '100' } };
    await controller.getAll(req, res, jest.fn());
    expect(service.getAllMedications).toHaveBeenCalledWith(
      expect.objectContaining({ minWeight: 10, maxWeight: 100 }),
    );
  });

  it('gets by id', async () => {
    const res = mockRes();
    await controller.getById({ params: { id: '1' } } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('passes errors to next', async () => {
    const errorService: any = {
      createMedication: jest.fn().mockRejectedValue(new Error('fail')),
      getAllMedications: jest.fn().mockRejectedValue(new Error('fail')),
      getMedicationById: jest.fn().mockRejectedValue(new Error('fail')),
    };
    const errorController = new MedicationController(errorService);
    const next = jest.fn();
    await errorController.create({ body: {} } as any, mockRes(), next);
    await errorController.getAll({} as any, mockRes(), next);
    await errorController.getById({ params: { id: '1' } } as any, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
