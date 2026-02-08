import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { CreateMedicationDTO, IMedication } from './medication.types';
import { MedicationRepository } from './medication.repository';

export class MedicationService {
  constructor(private readonly medicationRepository: MedicationRepository) {}

  async createMedication(dto: CreateMedicationDTO): Promise<IMedication> {
    const existing = await this.medicationRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError('Medication code already exists', 'MEDICATION_CODE_EXISTS');
    }

    return this.medicationRepository.create({ ...dto, image: dto.image ?? null });
  }

  async getMedicationById(id: number): Promise<IMedication> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundError('medication', id);
    }
    return medication;
  }

  async getMedicationsByIds(ids: number[]): Promise<IMedication[]> {
    const medications = await this.medicationRepository.findByIds(ids);
    if (medications.length !== ids.length) {
      const foundIds = new Set(medications.map((m) => m.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundError('medication', missing.join(','));
    }
    return medications;
  }

  async getAllMedications(filters: {
    search?: string;
    name?: string;
    code?: string;
    minWeight?: number;
    maxWeight?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: IMedication[]; total: number }> {
    return this.medicationRepository.findAll(filters);
  }
}
