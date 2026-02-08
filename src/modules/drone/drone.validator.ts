import { z } from 'zod';
import { DroneModel } from './drone.types';

export const registerDroneSchema = z.object({
  body: z.object({
    serialNumber: z.string().min(1).max(100),
    model: z.nativeEnum(DroneModel),
    weightLimit: z.number().positive().max(500),
    batteryCapacity: z.number().int().min(0).max(100),
  }),
});

export const loadDroneSchema = z.object({
  params: z.object({
    droneId: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    medicationIds: z.array(z.number().int().positive()).min(1),
  }),
});

export const droneIdParamSchema = z.object({
  params: z.object({
    droneId: z.string().regex(/^\d+$/),
  }),
});

export const listAvailableDronesSchema = z.object({
  query: z.object({
    model: z.string().optional(),
    minBattery: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }),
});
