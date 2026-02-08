import { MedicationRepository } from '../medication.repository';
import { resetDatabase, closeDatabase } from '../../../../tests/helpers/db';

const repo = new MedicationRepository();

describe('MedicationRepository', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('creates and finds medication', async () => {
    const created = await repo.create({ name: 'Med', weight: 10, code: 'MED_1', image: null });
    const found = await repo.findById(created.id);
    expect(found?.code).toBe('MED_1');
  });

  it('returns null when medication not found', async () => {
    const found = await repo.findById(999);
    expect(found).toBeNull();
  });

  it('finds by code and ids', async () => {
    const created = await repo.create({ name: 'Med2', weight: 10, code: 'MED_2', image: null });
    const byCode = await repo.findByCode('MED_2');
    const byIds = await repo.findByIds([created.id]);

    expect(byCode?.id).toBe(created.id);
    expect(byIds.length).toBe(1);
  });

  it('finds all', async () => {
    await repo.create({ name: 'Med3', weight: 10, code: 'MED_3', image: null });
    const all = await repo.findAll();
    expect(all.rows.length).toBeGreaterThan(0);
    expect(all.total).toBeGreaterThan(0);
  });

  it('finds all with filters', async () => {
    await repo.create({ name: 'SearchMe', weight: 55, code: 'MED_S', image: null });
    await repo.create({ name: 'Other', weight: 200, code: 'MED_O', image: null });

    const filtered = await repo.findAll({
      search: 'Search',
      name: 'SearchMe',
      code: 'MED_S',
      minWeight: 50,
      maxWeight: 100,
      limit: 10,
      offset: 0,
    });

    expect(filtered.rows.length).toBe(1);
    expect(filtered.total).toBe(1);
  });
});
