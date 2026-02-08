import { errorHandler } from '../errorHandler';
import { AppError } from '../../errors/AppError';

jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('handles AppError', () => {
    const err = new AppError('bad', 400, 'BAD', { a: 1 });
    const res = mockRes();

    errorHandler(err, {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'bad',
      error: { code: 'BAD', details: { a: 1 } },
    });
  });

  it('handles unknown error', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      error: { code: 'INTERNAL_ERROR' },
    });
  });

  it('handles invalid JSON', () => {
    const res = mockRes();
    const err: any = new SyntaxError('Unexpected token ]');
    err.type = 'entity.parse.failed';
    errorHandler(err, {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid JSON payload. Please check your request body.',
      error: { code: 'INVALID_JSON' },
    });
  });
});
