import { MedicationService } from '../medication.service';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

const medication = { id: 1, name: 'Med', weight: 1, code: 'MED_1', image: null, createdAt: new Date(), updatedAt: new Date() };

describe('MedicationService', () => {
  it('creates medication', async () => {
    const repo: any = {
      findByCode: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(medication),
    };
    const service = new MedicationService(repo);
    const created = await service.createMedication({ name: 'Med', weight: 1, code: 'MED_1' });
    expect(created.code).toBe('MED_1');
  });

  it('rejects duplicate code', async () => {
    const repo: any = {
      findByCode: jest.fn().mockResolvedValue(medication),
    };
    const service = new MedicationService(repo);
    await expect(service.createMedication({ name: 'Med', weight: 1, code: 'MED_1' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('gets medication by id', async () => {
    const repo: any = { findById: jest.fn().mockResolvedValue(medication) };
    const service = new MedicationService(repo);
    const found = await service.getMedicationById(1);
    expect(found.id).toBe(1);
  });

  it('throws on missing medication', async () => {
    const repo: any = { findById: jest.fn().mockResolvedValue(null) };
    const service = new MedicationService(repo);
    await expect(service.getMedicationById(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('gets medications by ids', async () => {
    const repo: any = { findByIds: jest.fn().mockResolvedValue([medication]) };
    const service = new MedicationService(repo);
    const meds = await service.getMedicationsByIds([1]);
    expect(meds.length).toBe(1);
  });

  it('throws when any medication missing', async () => {
    const repo: any = { findByIds: jest.fn().mockResolvedValue([]) };
    const service = new MedicationService(repo);
    await expect(service.getMedicationsByIds([1, 2])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws when some medication missing', async () => {
    const repo: any = { findByIds: jest.fn().mockResolvedValue([medication]) };
    const service = new MedicationService(repo);
    await expect(service.getMedicationsByIds([1, 2])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('gets all medications', async () => {
    const repo: any = { findAll: jest.fn().mockResolvedValue({ rows: [medication], total: 1 }) };
    const service = new MedicationService(repo);
    const all = await service.getAllMedications();
    expect(all.rows.length).toBe(1);
  });
});
