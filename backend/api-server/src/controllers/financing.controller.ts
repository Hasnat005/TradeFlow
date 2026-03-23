import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { FinancingService } from '../services/financing.service';
import { FinancingStatus } from '../repositories/financing.repository';

export class FinancingController {
  constructor(private readonly financingService: FinancingService) {}

  async createRequest(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as {
      invoiceId?: string;
      invoice_id?: string;
      requestedAmount?: number;
      requested_amount?: number;
    };

    const created = await this.financingService.createRequest(
      {
        invoiceId: body.invoiceId ?? body.invoice_id ?? '',
        requestedAmount: body.requestedAmount ?? body.requested_amount ?? 0,
      },
      auth,
    );

    res.status(201).json({
      success: true,
      data: created,
    });
  }

  async listRequests(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const query = req.query as { status?: FinancingStatus; search?: string };

    const data = await this.financingService.listRequests(auth, {
      status: query.status,
      search: query.search,
    });

    res.status(200).json({
      success: true,
      data,
    });
  }

  async listInvoices(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const query = req.query as { search?: string };

    const data = await this.financingService.listInvoices(auth, query.search);

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
