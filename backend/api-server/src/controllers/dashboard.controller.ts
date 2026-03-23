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
    const query = req.query as { limit?: number };
    const data = await this.dashboardService.getRecentTransactions(auth, Number(query.limit ?? 10));

    res.status(200).json({
      success: true,
      data,
    });
  }
}
