import { medicationRoutes } from '../medication.routes';

describe('medication routes', () => {
  it('exports router', () => {
    expect(medicationRoutes).toBeDefined();
  });
});
