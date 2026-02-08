import { Op } from 'sequelize';
import { CreateDroneDTO, DroneState, IDrone } from './drone.types';
import { DroneModel } from './drone.model';
import { DroneLoadModel, MedicationModel } from '../medication/medication.model';
import { MIN_BATTERY_FOR_LOADING } from '../../shared/utils/constants';

export class DroneRepository {
  async create(data: CreateDroneDTO & { state?: DroneState }): Promise<IDrone> {
    const drone = await DroneModel.create(data as any);
    return drone.get({ plain: true });
  }

  async count(): Promise<number> {
    return DroneModel.count();
  }

  async findById(id: number): Promise<IDrone | null> {
    const drone = await DroneModel.findByPk(id);
    return drone ? drone.get({ plain: true }) : null;
  }

  async findBySerialNumber(sn: string): Promise<IDrone | null> {
    const drone = await DroneModel.findOne({ where: { serialNumber: sn } });
    return drone ? drone.get({ plain: true }) : null;
  }

  async findAvailable(filters: {
    model?: string;
    minBattery?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: IDrone[]; total: number }> {
    const where: any = {
      state: DroneState.IDLE,
      batteryCapacity: { [Op.gte]: MIN_BATTERY_FOR_LOADING },
    };

    if (filters.model) {
      where.model = filters.model;
    }
    if (filters.minBattery !== undefined) {
      where.batteryCapacity = { [Op.gte]: filters.minBattery };
    }
    if (filters.search) {
      where.serialNumber = { [Op.like]: `%${filters.search}%` };
    }

    const result = await DroneModel.findAndCountAll({
      where,
      limit: filters.limit,
      offset: filters.offset,
      order: [['id', 'ASC']],
    });
    return {
      rows: result.rows.map((d) => d.get({ plain: true })),
      total: result.count,
    };
  }

  async updateState(id: number, state: DroneState): Promise<IDrone> {
    const drone = await DroneModel.findByPk(id);
    if (!drone) {
      throw new Error('Drone not found');
    }
    drone.state = state;
    await drone.save();
    return drone.get({ plain: true });
  }

  async findAll(): Promise<IDrone[]> {
    const drones = await DroneModel.findAll();
    return drones.map((d) => d.get({ plain: true }));
  }

  async getCurrentLoad(droneId: number): Promise<number> {
    const rows = await DroneLoadModel.findAll({
      where: { droneId },
      include: [{ model: MedicationModel, attributes: ['weight'] }],
    });

    return rows.reduce((sum, row: any) => sum + (row.MedicationModel?.weight ?? 0), 0);
  }

  async addMedications(droneId: number, medicationIds: number[]): Promise<void> {
    const rows = medicationIds.map((medicationId) => ({ droneId, medicationId }));
    await DroneLoadModel.bulkCreate(rows);
  }

  async getLoadedMedications(droneId: number): Promise<any[]> {
    const drone = await DroneModel.findByPk(droneId, {
      include: [{ model: MedicationModel, as: 'medications' }],
    });
    return drone ? (drone as any).medications || [] : [];
  }
}
