import { Request, Response, NextFunction } from 'express';
import { created, ok } from '../../shared/utils/response';
import { DroneService } from './drone.service';
import { delCacheByPrefix } from '../../shared/cache/cache';

export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const drone = await this.droneService.registerDrone(req.body);
      await delCacheByPrefix('drones:available');
      return created(res, drone, 'drone registered');
    } catch (error) {
      return next(error);
    }
  };

  loadMedications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const droneId = Number(req.params.droneId);
      const drone = await this.droneService.loadDrone(droneId, req.body.medicationIds);
      await delCacheByPrefix('drones:available');
      await delCacheByPrefix('drones:battery');
      return ok(res, drone, 'drone loaded');
    } catch (error) {
      return next(error);
    }
  };

  getLoadedMedications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const droneId = Number(req.params.droneId);
      const medications = await this.droneService.getLoadedMedications(droneId);
      return ok(res, medications);
    } catch (error) {
      return next(error);
    }
  };

  getAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query || {}) as Record<string, string | undefined>;
      const { model, minBattery, search, limit, offset } = query;
      const result = await this.droneService.getAvailableDrones({
        model,
        search,
        minBattery: minBattery ? Number(minBattery) : undefined,
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

  getBatteryLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const droneId = Number(req.params.droneId);
      const level = await this.droneService.getBatteryLevel(droneId);
      return ok(res, level);
    } catch (error) {
      return next(error);
    }
  };
}
