import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { FinancingService } from '../services/financing.service';
import { FinancingStatus } from '../repositories/financing.repository';

export class FinancingController {
  constructor(private readonly financingService: FinancingService) {}

  async createRequest(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as {
      invoiceId: string;
      requestedAmount: number;
      invoiceAmount: number;
      buyerName?: string;
    };

    const created = await this.financingService.createRequest(body, auth);

    res.status(201).json({
      success: true,
      data: created,
    });
  }

  async listRequests(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const query = req.query as { status?: FinancingStatus };

    const data = await this.financingService.listRequests(auth, query.status);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getRequestById(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };

    const data = await this.financingService.getRequestById(params.id, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async updateStatus(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };
    const body = req.body as { status: FinancingStatus };

    const data = await this.financingService.updateStatus(params.id, body.status, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }
}
