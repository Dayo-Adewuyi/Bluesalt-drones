import winston from 'winston';
import { LOG_LEVEL } from './constants';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${level}: ${message}${metaString}`;
});

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [new winston.transports.Console()],
});

if (process.env.NODE_ENV !== 'production') {
  logger.format = combine(colorize(), timestamp(), errors({ stack: true }), devFormat);
}
