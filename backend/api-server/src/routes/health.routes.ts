import { Router } from 'express';

import { HealthController } from '../controllers/health.controller';
import { validateRequest } from '../middlewares/validate-request';
import { HealthRepository } from '../repositories/health.repository';
import { HealthService } from '../services/health.service';
import { asyncHandler } from '../utils/async-handler';
import { readinessQuerySchema } from '../modules/health';

const healthRepository = new HealthRepository();
const healthService = new HealthService(healthRepository);
const healthController = new HealthController(healthService);

export const healthRouter = Router();

healthRouter.get('/', (req, res) => healthController.getHealth(req, res));
healthRouter.get(
  '/readiness',
  validateRequest({ query: readinessQuerySchema }),
  asyncHandler((req, res) => healthController.getReadiness(req, res)),
);
