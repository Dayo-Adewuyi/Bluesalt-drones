import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { errorHandler } from './shared/middleware/errorHandler';
import { rateLimiter } from './shared/middleware/rateLimiter';
import { requestLogger } from './shared/middleware/requestLogger';
import { droneRoutes } from './modules/drone/drone.routes';
import { medicationRoutes } from './modules/medication/medication.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/docs/swagger';

export const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(cors());
app.use(hpp());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimiter);
app.use(requestLogger);

app.get('/api/v1/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', droneRoutes);
app.use('/api/v1', medicationRoutes);

app.use(errorHandler);
