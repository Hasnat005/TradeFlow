import { Router } from 'express';

import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/async-handler';

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

export const dashboardRouter = Router();

dashboardRouter.use(authenticateJwt);

dashboardRouter.get('/summary', asyncHandler((req, res) => dashboardController.getSummary(req, res)));
