import { PaginationQuery } from '../types';

describe('shared types', () => {
  it('allows pagination shape', () => {
    const q: PaginationQuery = { limit: 10, offset: 0 };
    expect(q.limit).toBe(10);
  });
});
