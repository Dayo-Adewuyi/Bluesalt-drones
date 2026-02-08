import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { MedicationController } from './medication.controller';
import { MedicationRepository } from './medication.repository';
import { MedicationService } from './medication.service';
import { createMedicationSchema, listMedicationsSchema } from './medication.validator';

const repository = new MedicationRepository();
const service = new MedicationService(repository);
const controller = new MedicationController(service);

export const medicationRoutes = Router();

medicationRoutes.post(
  '/medications',
  validate(createMedicationSchema),
  controller.create,
);

medicationRoutes.get('/medications', validate(listMedicationsSchema), controller.getAll);
medicationRoutes.get('/medications/:id', controller.getById);
