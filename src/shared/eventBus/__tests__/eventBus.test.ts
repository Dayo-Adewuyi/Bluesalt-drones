import { eventBus } from '../eventBus';

jest.mock('../../utils/logger', () => ({
  logger: { debug: jest.fn(), error: jest.fn() },
}));

describe('eventBus', () => {
  it('emits and handles events', (done) => {
    eventBus.on('test:event', (payload) => {
      expect(payload).toEqual({ a: 1 });
      done();
    });

    eventBus.emit('test:event', { a: 1 });
  });

  it('handles handler errors', (done) => {
    eventBus.on('test:error', async () => {
      throw new Error('boom');
    });

    eventBus.emit('test:error', { a: 1 });
    setImmediate(() => done());
  });

  it('supports off', () => {
    const handler = jest.fn();
    eventBus.on('test:off', handler);
    eventBus.off('test:off', handler);
    eventBus.emit('test:off', { a: 1 });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
