import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '../utils/constants';

export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
