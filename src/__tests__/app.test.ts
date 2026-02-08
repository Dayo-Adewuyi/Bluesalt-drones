import { app } from '../app';

describe('app', () => {
  it('health route returns ok', () => {
    const layer = (app as any)._router.stack.find((l: any) => l.route?.path === '/api/v1/health');
    const handler = layer.route.stack[0].handle;

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    handler({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
