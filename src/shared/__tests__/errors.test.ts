import { AppError, ConflictError, NotFoundError, ValidationError } from '../errors/AppError';

describe('AppError classes', () => {
  it('creates AppError with metadata', () => {
    const err = new AppError('msg', 400, 'CODE', { a: 1 });
    expect(err.message).toBe('msg');
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('CODE');
    expect(err.details).toEqual({ a: 1 });
  });

  it('creates NotFoundError', () => {
    const err = new NotFoundError('drone', 1);
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('DRONE_NOT_FOUND');
  });

  it('creates ConflictError', () => {
    const err = new ConflictError('conflict', 'CONFLICT');
    expect(err.statusCode).toBe(409);
    expect(err.errorCode).toBe('CONFLICT');
  });

  it('creates ValidationError', () => {
    const err = new ValidationError('invalid', { field: 'x' });
    expect(err.statusCode).toBe(422);
    expect(err.errorCode).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual({ field: 'x' });
  });
});
