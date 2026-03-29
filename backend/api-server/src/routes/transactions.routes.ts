import { Router } from 'express';

import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/async-handler';

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

export const transactionsRouter = Router();

transactionsRouter.use(authenticateJwt);

transactionsRouter.get(
  '/recent',
  asyncHandler((req, res) => dashboardController.getRecentTransactions(req, res)),
);
