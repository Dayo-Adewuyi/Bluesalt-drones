export const APP_NAME = 'Blusalt Drone Dispatch Controller';

export const MAX_FLEET_SIZE = 10;
export const MIN_BATTERY_FOR_LOADING = 25;

export const DEFAULT_PORT = Number(process.env.PORT || 3000);

export const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
export const DB_STORAGE = process.env.DB_STORAGE || './database.sqlite';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = Number(process.env.DB_PORT || 5432);
export const DB_NAME = process.env.DB_NAME || 'drones';
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

export const BATTERY_CHECK_CRON = process.env.BATTERY_CHECK_CRON || '*/1 * * * *';

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './src/uploads';
export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024);
export const ALLOWED_UPLOAD_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);

export const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
export const REDIS_DB = Number(process.env.REDIS_DB || 0);
export const REDIS_TLS = process.env.REDIS_TLS || 'false';

export const QUEUE_PREFIX = process.env.QUEUE_PREFIX || 'drone-dispatch';
