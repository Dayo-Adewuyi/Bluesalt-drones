import { createMedicationSchema } from '../medication.validator';

describe('medication validator', () => {
  it('validates create schema', () => {
    const result = createMedicationSchema.safeParse({
      body: { name: 'Med_1', weight: 10, code: 'MED_1' },
    });
    expect(result.success).toBe(true);
  });
});
