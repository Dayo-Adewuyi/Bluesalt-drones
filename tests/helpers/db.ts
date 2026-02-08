import { sequelize } from '../../src/shared/database/connection';
import '../../src/modules/medication/medication.model';
import '../../src/modules/drone/drone.model';
import '../../src/modules/audit/audit.model';

export async function resetDatabase(): Promise<void> {
  await sequelize.sync({ force: true });
}

export async function closeDatabase(): Promise<void> {
  await sequelize.close();
}
