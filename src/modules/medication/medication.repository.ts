import { Op } from 'sequelize';
import { IMedication } from './medication.types';
import { MedicationModel } from './medication.model';

export class MedicationRepository {
  async create(data: Omit<IMedication, 'id' | 'createdAt' | 'updatedAt'>): Promise<IMedication> {
    const medication = await MedicationModel.create(data as any);
    return medication.get({ plain: true }) as IMedication;
  }

  async findById(id: number): Promise<IMedication | null> {
    const medication = await MedicationModel.findByPk(id);
    return medication ? (medication.get({ plain: true }) as IMedication) : null;
  }

  async findByIds(ids: number[]): Promise<IMedication[]> {
    const medications = await MedicationModel.findAll({ where: { id: ids } });
    return medications.map((m) => m.get({ plain: true }) as IMedication);
  }

  async findByCode(code: string): Promise<IMedication | null> {
    const medication = await MedicationModel.findOne({ where: { code } });
    return medication ? (medication.get({ plain: true }) as IMedication) : null;
  }

  async findAll(filters: {
    search?: string;
    name?: string;
    code?: string;
    minWeight?: number;
    maxWeight?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: IMedication[]; total: number }> {
    const where: any = {};

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { code: { [Op.like]: `%${filters.search}%` } },
      ];
    }
    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.code) {
      where.code = { [Op.like]: `%${filters.code}%` };
    }
    if (filters.minWeight || filters.maxWeight) {
      where.weight = {};
      if (filters.minWeight !== undefined) where.weight[Op.gte] = filters.minWeight;
      if (filters.maxWeight !== undefined) where.weight[Op.lte] = filters.maxWeight;
    }

    const result = await MedicationModel.findAndCountAll({
      where,
      limit: filters.limit,
      offset: filters.offset,
      order: [['id', 'ASC']],
    });
    return {
      rows: result.rows.map((m) => m.get({ plain: true }) as IMedication),
      total: result.count,
    };
  }
}
