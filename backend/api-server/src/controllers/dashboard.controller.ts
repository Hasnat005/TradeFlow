import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getSummary(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const data = await this.dashboardService.getSummary(auth);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getRecentTransactions(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const parsedLimit = Number(rawLimit ?? 10);
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(50, Math.trunc(parsedLimit))) : 10;
    const data = await this.dashboardService.getRecentTransactions(auth, limit);

    res.status(200).json({
      success: true,
      data,
    });
  }
}
