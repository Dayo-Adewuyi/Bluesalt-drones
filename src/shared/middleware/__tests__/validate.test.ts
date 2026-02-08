import { validate } from '../validate';
import { z } from 'zod';
import { ValidationError } from '../../errors/AppError';

function mockReq(body: any = {}, params: any = {}, query: any = {}) {
  return { body, params, query } as any;
}

function mockRes() {
  return {} as any;
}

describe('validate middleware', () => {
  it('passes when schema validates', () => {
    const schema = z.object({ body: z.object({ name: z.string() }) });
    const req = mockReq({ name: 'ok' });
    const next = jest.fn();

    validate(schema)(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('throws ValidationError when schema fails', () => {
    const schema = z.object({ body: z.object({ name: z.string().min(3) }) });
    const req = mockReq({ name: 'x' });
    const next = jest.fn();

    validate(schema)(req, mockRes(), next);

    const err = next.mock.calls[0][0] as ValidationError;
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.details).toBeDefined();
  });
});
