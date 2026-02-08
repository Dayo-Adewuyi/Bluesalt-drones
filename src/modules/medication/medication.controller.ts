import { Request, Response, NextFunction } from 'express';
import { created, ok } from '../../shared/utils/response';
import { MedicationService } from './medication.service';
import { delCacheByPrefix } from '../../shared/cache/cache';

export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medication = await this.medicationService.createMedication(req.body, req.file);
      await delCacheByPrefix('medications:list');
      return created(res, medication, 'medication created');
    } catch (error) {
      return next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query || {}) as Record<string, string | undefined>;
      const { search, name, code, minWeight, maxWeight, limit, offset } = query;
      const result = await this.medicationService.getAllMedications({
        search,
        name,
        code,
        minWeight: minWeight ? Number(minWeight) : undefined,
        maxWeight: maxWeight ? Number(maxWeight) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      return ok(res, {
        items: result.rows,
        meta: {
          total: result.total,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          currentPage:
            limit && offset ? Math.floor(Number(offset) / Number(limit)) + 1 : undefined,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medication = await this.medicationService.getMedicationById(Number(req.params.id));
      return ok(res, medication);
    } catch (error) {
      return next(error);
    }
  };
}
