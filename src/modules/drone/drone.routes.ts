import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { cacheResponse } from '../../shared/cache/cacheMiddleware';
import { DroneController } from './drone.controller';
import { DroneRepository } from './drone.repository';
import { DroneService } from './drone.service';
import {
  droneIdParamSchema,
  listAvailableDronesSchema,
  loadDroneSchema,
  registerDroneSchema,
} from './drone.validator';
import { MedicationRepository } from '../medication/medication.repository';

const droneRepository = new DroneRepository();
const medicationRepository = new MedicationRepository();
const service = new DroneService(droneRepository, medicationRepository);
const controller = new DroneController(service);

export const droneRoutes = Router();

droneRoutes.post('/drones', validate(registerDroneSchema), controller.register);

droneRoutes.post('/drones/:droneId/load', validate(loadDroneSchema), controller.loadMedications);

droneRoutes.get(
  '/drones/:droneId/medications',
  validate(droneIdParamSchema),
  controller.getLoadedMedications,
);

droneRoutes.get(
  '/drones/available',
  validate(listAvailableDronesSchema),
  cacheResponse(30, 'drones:available'),
  controller.getAvailable,
);

droneRoutes.get(
  '/drones/:droneId/battery',
  validate(droneIdParamSchema),
  cacheResponse(30, 'drones:battery'),
  controller.getBatteryLevel,
);
