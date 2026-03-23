import { Router } from 'express';

import { authRouter } from './auth.routes';
import { dashboardRouter } from './dashboard.routes';
import { financingRouter } from './financing.routes';
import { healthRouter } from './health.routes';
import { invoicesRouter } from './invoices.routes';
import { ordersRouter } from './orders.routes';
import { profileRouter } from './profile.routes';
import { transactionsRouter } from './transactions.routes';

export const appRouter = Router();

appRouter.use('/health', healthRouter);
appRouter.use('/auth', authRouter);
appRouter.use('/dashboard', dashboardRouter);
appRouter.use('/financing', financingRouter);
appRouter.use('/orders', ordersRouter);
appRouter.use('/invoices', invoicesRouter);
appRouter.use('/profile', profileRouter);
appRouter.use('/transactions', transactionsRouter);
