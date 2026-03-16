import { Router } from 'express';

import { healthRouter } from './health.routes';

export const appRouter = Router();

appRouter.use('/health', healthRouter);
