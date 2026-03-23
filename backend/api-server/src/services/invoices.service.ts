import { AppError } from '../utils/app-error';
import {
  InvoiceAlert,
  InvoiceRecord,
  InvoicesRepository,
  InvoiceStatus,
} from '../repositories/invoices.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

type ListFilter = {
  status?: InvoiceStatus;
  search?: string;
  from?: string;
  to?: string;
};

type CreateInvoiceInput = {
  buyerName: string;
  purchaseOrderId?: string;
  dueDate: string;
  totalAmount: number;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
  status: 'Draft' | 'Sent';
};

const TIMELINE_STEPS: Array<'Draft' | 'Sent' | 'Financed' | 'Paid'> = ['Draft', 'Sent', 'Financed', 'Paid'];

function calculateTotal(items: CreateInvoiceInput['items']) {
  return Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));
}

function buildAlerts(invoices: Array<Pick<InvoiceRecord, 'status' | 'due_date' | 'total_amount'>>): InvoiceAlert[] {
  const alerts: InvoiceAlert[] = [];

  const overdueCount = invoices.filter((invoice) => invoice.status === 'Overdue').length;
  if (overdueCount > 0) {
    alerts.push({
      id: 'overdue-count',
      title: `${overdueCount} invoice${overdueCount === 1 ? '' : 's'} overdue`,
      description: 'Follow up with buyers to avoid cashflow delays.',
      tone: 'danger',
    });
  }

  const weekAhead = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const dueThisWeekAmount = invoices
    .filter((invoice) => {
      const due = new Date(invoice.due_date).getTime();
      return !Number.isNaN(due) && due >= Date.now() && due <= weekAhead && invoice.status !== 'Paid';
    })
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  if (dueThisWeekAmount > 0) {
    alerts.push({
      id: 'due-this-week',
      title: `Payments worth ${dueThisWeekAmount.toFixed(2)} due this week`,
      description: 'Monitor receivables due soon.',
      tone: 'warning',
    });
  }

  const financedCount = invoices.filter((invoice) => invoice.status === 'Financed').length;
  if (financedCount > 0) {
    alerts.push({
      id: 'financed-count',
      title: `${financedCount} invoice${financedCount === 1 ? '' : 's'} financed`,
      description: 'You can track disbursement and repayments in Financing.',
      tone: 'info',
    });
  }

  return alerts;
}

export class InvoicesService {
  constructor(private readonly invoicesRepository: InvoicesRepository) {}

  async listInvoices(auth: AuthContext, filter: ListFilter = {}) {
    await this.invoicesRepository.markOverdueByCompany(auth.companyId);
    const invoices = await this.invoicesRepository.findAllByCompany(auth.companyId, filter);

    return {
      invoices,
      alerts: buildAlerts(invoices),
    };
  }

  async createInvoice(input: CreateInvoiceInput, auth: AuthContext) {
    const computedTotal = calculateTotal(input.items);
    if (Math.abs(computedTotal - input.totalAmount) > 0.01) {
      throw new AppError(400, 'totalAmount does not match line items total', 'INVALID_INVOICE_TOTAL');
    }

    if (input.purchaseOrderId) {
      const belongsToCompany = await this.invoicesRepository.findOrderById(input.purchaseOrderId, auth.companyId);
      if (!belongsToCompany) {
        throw new AppError(404, 'Linked purchase order not found', 'ORDER_NOT_FOUND');
      }

      const duplicate = await this.invoicesRepository.hasDuplicateForPurchaseOrder(auth.companyId, input.purchaseOrderId);
      if (duplicate) {
        throw new AppError(409, 'Invoice already exists for this purchase order', 'DUPLICATE_ORDER_INVOICE');
      }
    }

    const created = await this.invoicesRepository.create({
      companyId: auth.companyId,
      buyerName: input.buyerName,
      purchaseOrderId: input.purchaseOrderId,
      totalAmount: input.totalAmount,
      dueDate: input.dueDate,
      issueDate: new Date().toISOString().slice(0, 10),
      status: input.status,
      items: input.items,
    });

    return created;
  }

  async createFromOrder(orderId: string, auth: AuthContext) {
    const order = await this.invoicesRepository.findOrderById(orderId, auth.companyId);
    if (!order) {
      throw new AppError(404, 'Purchase order not found', 'ORDER_NOT_FOUND');
    }

    const duplicate = await this.invoicesRepository.hasDuplicateForPurchaseOrder(auth.companyId, orderId);
    if (duplicate) {
      const existing = (await this.invoicesRepository.findAllByCompany(auth.companyId)).find(
        (invoice) => invoice.purchase_order_id === orderId,
      );

      if (!existing) {
        throw new AppError(409, 'Invoice already exists for this purchase order', 'DUPLICATE_ORDER_INVOICE');
      }

      return {
        orderId,
        invoiceId: existing.id,
      };
    }

    const items = order.items.map((item) => ({
      itemName: item.item_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    }));

    const totalAmount = calculateTotal(items);

    const created = await this.invoicesRepository.create({
      companyId: auth.companyId,
      buyerName: order.supplier_name,
      purchaseOrderId: order.id,
      totalAmount,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      items,
    });

    await this.invoicesRepository.linkOrderToInvoice(order.id, auth.companyId, created.id);

    return {
      orderId,
      invoiceId: created.id,
    };
  }

  async getInvoiceById(id: string, auth: AuthContext) {
    await this.invoicesRepository.markOverdueByCompany(auth.companyId);

    const invoice = await this.invoicesRepository.findById(id, auth.companyId);
    if (!invoice) {
      throw new AppError(404, 'Invoice not found', 'INVOICE_NOT_FOUND');
    }

    const timelineEvents = await this.invoicesRepository.getTimeline(invoice.id);

    const timeline: Array<{
      status: InvoiceStatus;
      timestamp: string | null;
      completed: boolean;
    }> = TIMELINE_STEPS.map((status) => {
      const match = timelineEvents.find((event) => event.status === status);
      return {
        status,
        timestamp: match?.changed_at ?? null,
        completed: Boolean(match),
      };
    });

    if (invoice.status === 'Overdue') {
      const overdueMatch = timelineEvents.find((event) => event.status === 'Overdue');
      timeline.push({
        status: 'Overdue',
        timestamp: overdueMatch?.changed_at ?? invoice.updated_at,
        completed: true,
      });
    }

    return {
      ...invoice,
      timeline,
    };
  }

  async updateStatus(
    id: string,
    input: {
      status: InvoiceStatus;
      paymentAmount?: number;
    },
    auth: AuthContext,
  ) {
    const existing = await this.getInvoiceById(id, auth);

    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      Draft: ['Sent'],
      Sent: ['Financed', 'Paid'],
      Financed: ['Paid'],
      Paid: [],
      Overdue: ['Financed', 'Paid'],
    };

    if (!validTransitions[existing.status].includes(input.status) && existing.status !== input.status) {
      throw new AppError(
        409,
        `Cannot change status from ${existing.status} to ${input.status}`,
        'INVALID_INVOICE_STATUS_TRANSITION',
      );
    }

    const paidAmount =
      input.status === 'Paid'
        ? existing.total_amount
        : input.paymentAmount
          ? Math.min(existing.total_amount, Number((existing.paid_amount + input.paymentAmount).toFixed(2)))
          : undefined;

    const nextStatus = paidAmount && paidAmount >= existing.total_amount ? 'Paid' : input.status;

    const updated = await this.invoicesRepository.updateStatus({
      id,
      companyId: auth.companyId,
      status: nextStatus,
      paidAmount,
    });

    if (!updated) {
      throw new AppError(404, 'Invoice not found', 'INVOICE_NOT_FOUND');
    }

    return updated;
  }
}
