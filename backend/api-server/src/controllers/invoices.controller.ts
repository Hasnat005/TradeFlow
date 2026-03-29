import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { InvoiceStatus } from '../repositories/invoices.repository';
import { InvoicesService } from '../services/invoices.service';

export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  async listInvoices(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const rawStatus = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
    const rawSearch = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
    const rawFrom = Array.isArray(req.query.from) ? req.query.from[0] : req.query.from;
    const rawTo = Array.isArray(req.query.to) ? req.query.to[0] : req.query.to;

    const allowedStatuses: InvoiceStatus[] = ['Draft', 'Sent', 'Financed', 'Paid', 'Overdue'];
    const status =
      typeof rawStatus === 'string' && allowedStatuses.includes(rawStatus as InvoiceStatus)
        ? (rawStatus as InvoiceStatus)
        : undefined;

    const data = await this.invoicesService.listInvoices(auth, {
      status,
      search: typeof rawSearch === 'string' ? rawSearch : undefined,
      from: typeof rawFrom === 'string' ? rawFrom : undefined,
      to: typeof rawTo === 'string' ? rawTo : undefined,
    });

    res.status(200).json({ success: true, data });
  }

  async createInvoice(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as {
      buyerName?: string;
      buyer_name?: string;
      purchaseOrderId?: string;
      purchase_order_id?: string;
      dueDate?: string;
      due_date?: string;
      totalAmount?: number;
      total_amount?: number;
      status?: 'Draft' | 'Sent';
      items: Array<{
        itemName?: string;
        item_name?: string;
        quantity: number;
        unitPrice?: number;
        unit_price?: number;
      }>;
    };

    const data = await this.invoicesService.createInvoice(
      {
        buyerName: body.buyerName ?? body.buyer_name ?? '',
        purchaseOrderId: body.purchaseOrderId ?? body.purchase_order_id,
        dueDate: body.dueDate ?? body.due_date ?? '',
        totalAmount: body.totalAmount ?? body.total_amount ?? 0,
        status: body.status ?? 'Draft',
        items: body.items.map((item) => ({
          itemName: item.itemName ?? item.item_name ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? item.unit_price ?? 0,
        })),
      },
      auth,
    );

    res.status(201).json({ success: true, data });
  }

  async createFromOrder(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as { orderId?: string; order_id?: string };

    const data = await this.invoicesService.createFromOrder(body.orderId ?? body.order_id ?? '', auth);

    res.status(200).json({ success: true, data });
  }

  async getInvoiceById(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };

    const data = await this.invoicesService.getInvoiceById(params.id, auth);

    res.status(200).json({ success: true, data });
  }

  async updateStatus(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };
    const body = req.body as {
      status: InvoiceStatus;
      paymentAmount?: number;
      payment_amount?: number;
    };

    const data = await this.invoicesService.updateStatus(
      params.id,
      {
        status: body.status,
        paymentAmount: body.paymentAmount ?? body.payment_amount,
      },
      auth,
    );

    res.status(200).json({ success: true, data });
  }
}
