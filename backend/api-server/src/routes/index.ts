import { Router } from 'express';

import { authRouter } from './auth.routes';
import { financingRouter } from './financing.routes';
import { healthRouter } from './health.routes';
import { ordersRouter } from './orders.routes';
import { profileRouter } from './profile.routes';

export const appRouter = Router();

appRouter.use('/health', healthRouter);
appRouter.use('/auth', authRouter);
appRouter.use('/financing', financingRouter);
appRouter.use('/orders', ordersRouter);
appRouter.use('/profile', profileRouter);
