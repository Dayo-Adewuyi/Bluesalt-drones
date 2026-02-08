import { droneIdParamSchema, loadDroneSchema, registerDroneSchema } from '../drone.validator';
import { DroneModel } from '../drone.types';

describe('drone validators', () => {
  it('validates register schema', () => {
    const result = registerDroneSchema.safeParse({
      body: { serialNumber: 'SN', model: DroneModel.LIGHTWEIGHT, weightLimit: 100, batteryCapacity: 50 },
    });
    expect(result.success).toBe(true);
  });

  it('validates load schema', () => {
    const result = loadDroneSchema.safeParse({ params: { droneId: '1' }, body: { medicationIds: [1] } });
    expect(result.success).toBe(true);
  });

  it('validates id schema', () => {
    const result = droneIdParamSchema.safeParse({ params: { droneId: '1' } });
    expect(result.success).toBe(true);
  });
});
