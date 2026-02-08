import { requestLogger } from '../requestLogger';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn() },
}));

function mockRes() {
  const handlers: Record<string, () => void> = {};
  const res: any = {
    statusCode: 200,
    on: jest.fn((event: string, cb: () => void) => {
      handlers[event] = cb;
    }),
  };
  return { res, handlers };
}

describe('requestLogger', () => {
  it('logs on finish', () => {
    const req: any = { method: 'GET', originalUrl: '/x', ip: '1.1.1.1' };
    const { res, handlers } = mockRes();
    const next = jest.fn();

    requestLogger(req, res, next);
    handlers.finish();

    expect(next).toHaveBeenCalled();
  });
});
