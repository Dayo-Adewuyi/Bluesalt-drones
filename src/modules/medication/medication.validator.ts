import { z } from 'zod';

export const createMedicationSchema = z.object({
  body: z.object({
    name: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Only letters, numbers, - and _ allowed'),
    weight: z.number().positive(),
    code: z.string().regex(/^[A-Z0-9_]+$/, 'Only uppercase letters, numbers and _ allowed'),
    image: z.string().url('Must be a valid URL').optional(),
  }),
});

export const listMedicationsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    name: z.string().optional(),
    code: z.string().optional(),
    minWeight: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    maxWeight: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }),
});
