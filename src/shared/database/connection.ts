import { Sequelize } from 'sequelize';
import {
  DB_DIALECT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_STORAGE,
  DB_USER,
} from '../utils/constants';
import { logger } from '../utils/logger';

const isSqlite = DB_DIALECT === 'sqlite';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: isSqlite ? 'sqlite' : 'postgres',
  host: isSqlite ? undefined : DB_HOST,
  port: isSqlite ? undefined : DB_PORT,
  storage: isSqlite ? DB_STORAGE : undefined,
  logging: (msg) => logger.debug(msg),
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
});
