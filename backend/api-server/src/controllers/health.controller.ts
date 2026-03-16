import { Request, Response } from 'express';

import { env } from '../config/env';
import { HealthService } from '../services/health.service';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth(_req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: {
        service: 'TradeFlow API',
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  }

  async getReadiness(req: Request, res: Response) {
    const query = req.query as { verbose?: string | boolean | number };
    const verboseValue = query.verbose;
    const verbose =
      verboseValue === true ||
      verboseValue === 1 ||
      (typeof verboseValue === 'string' && ['true', '1'].includes(verboseValue.toLowerCase()));

    const report = await this.healthService.getReadinessReport(verbose);

    res.status(report.ready ? 200 : 503).json({
      success: report.ready,
      data: report,
    });
  }
}
