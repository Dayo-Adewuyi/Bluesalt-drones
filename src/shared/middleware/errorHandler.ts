import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const anyErr = err as any;
  if (err instanceof SyntaxError && anyErr?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload. Please check your request body.',
      error: { code: 'INVALID_JSON' },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.errorCode,
        details: err.details,
      },
    });
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: { code: 'INTERNAL_ERROR' },
  });
}
