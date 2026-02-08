import { rateLimiter } from '../rateLimiter';

describe('rateLimiter', () => {
  it('exports middleware', () => {
    expect(typeof rateLimiter).toBe('function');
  });
});
