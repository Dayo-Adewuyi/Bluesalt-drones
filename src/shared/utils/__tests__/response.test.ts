import { ok, created, noContent } from '../response';

describe('response helpers', () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  it('ok', () => {
    ok(res, { a: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('created', () => {
    created(res, { a: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('noContent', () => {
    noContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
