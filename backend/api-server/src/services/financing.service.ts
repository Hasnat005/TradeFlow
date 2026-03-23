import { AppError } from '../utils/app-error';
import { FinancingRepository, FinancingStatus } from '../repositories/financing.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

type CreateRequestInput = {
  invoiceId: string;
  requestedAmount: number;
};

type ListFilter = {
  status?: FinancingStatus;
  search?: string;
};

const WORKFLOW: FinancingStatus[] = ['Pending', 'Under Review', 'Approved', 'Disbursed', 'Repaid'];

export class FinancingService {
  constructor(private readonly financingRepository: FinancingRepository) {}

  async createRequest(input: CreateRequestInput, auth: AuthContext) {
    const invoice = await this.financingRepository.findInvoiceById(input.invoiceId, auth.companyId);

    if (!invoice) {
      throw new AppError(404, 'Invoice not found for this company', 'INVOICE_NOT_FOUND');
    }

    if (input.requestedAmount > invoice.amount) {
      throw new AppError(400, 'Requested amount cannot exceed invoice amount', 'INVALID_REQUESTED_AMOUNT');
    }

    const alreadyRequested = await this.financingRepository.hasActiveRequestForInvoice(input.invoiceId, auth.companyId);
    if (alreadyRequested) {
      throw new AppError(409, 'An active financing request already exists for this invoice', 'DUPLICATE_FINANCING_REQUEST');
    }

    const interestRate = 2.8;
    const repaymentAmount = Number((input.requestedAmount * (1 + interestRate / 100)).toFixed(2));

    const created = await this.financingRepository.create({
      companyId: auth.companyId,
      invoiceId: input.invoiceId,
      buyerName: invoice.buyer_name,
      requestedAmount: input.requestedAmount,
      repaymentAmount,
      status: 'Pending',
    });

    return created;
  }

  async listRequests(auth: AuthContext, filter: ListFilter = {}) {
    const requests = await this.financingRepository.findAllByCompany(auth.companyId, filter);
    const creditLimit = await this.financingRepository.getCompanyCreditLimit(auth.companyId);

    const usedCredit = requests
      .filter((request) => ['Approved', 'Disbursed'].includes(request.status))
      .reduce((sum, request) => sum + (request.approved_amount ?? request.requested_amount), 0);

    const availableCredit = Math.max(0, creditLimit - usedCredit);

    const approvedAlerts = requests
      .filter((request) => request.status === 'Approved')
      .slice(0, 2)
      .map((request) => ({
        id: `approved-${request.id}`,
        title: `Financing approved for Invoice ${request.invoice_id}`,
        description: `Approved amount ${request.approved_amount?.toFixed(2) ?? request.requested_amount.toFixed(2)}`,
        tone: 'success' as const,
      }));

    const dueAlerts = requests
      .filter((request) => request.status === 'Disbursed' && request.repayment_due_date)
      .map((request) => {
        const due = new Date(request.repayment_due_date as string).getTime();
        const days = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          request,
          days,
        };
      })
      .filter((entry) => entry.days >= 0 && entry.days <= 3)
      .slice(0, 2)
      .map((entry) => ({
        id: `due-${entry.request.id}`,
        title: `Repayment due in ${entry.days} day${entry.days === 1 ? '' : 's'}`,
        description: `Invoice ${entry.request.invoice_id} requires repayment soon`,
        tone: 'warning' as const,
      }));

    const utilization = creditLimit > 0 ? Math.round((usedCredit / creditLimit) * 100) : 0;
    const utilizationAlert = utilization >= 90
      ? [
          {
            id: 'credit-limit-high',
            title: 'Credit limit reached',
            description: `${utilization}% of credit limit used`,
            tone: 'danger' as const,
          },
        ]
      : [];

    return {
      requests,
      creditInsights: {
        totalLimit: creditLimit,
        usedLimit: usedCredit,
        availableLimit: availableCredit,
      },
      alerts: [...approvedAlerts, ...dueAlerts, ...utilizationAlert],
    };
  }

  async listInvoices(auth: AuthContext, search?: string) {
    return this.financingRepository.listInvoicesByCompany(auth.companyId, search);
  }

  async getRequestById(id: string, auth: AuthContext) {
    const record = await this.financingRepository.findById(id, auth.companyId);

    if (!record) {
      throw new AppError(404, 'Financing request not found', 'FINANCING_REQUEST_NOT_FOUND');
    }

    const invoice = await this.financingRepository.findInvoiceById(record.invoice_id, auth.companyId);
    const timelineRaw = await this.financingRepository.getTimeline(record.id);
    const timeline = WORKFLOW.map((status) => {
      const match = timelineRaw.find((event) => event.status === status);
      return {
        status,
        timestamp: match?.changed_at ?? null,
        completed: Boolean(match),
      };
    });

    if (record.status === 'Rejected') {
      const rejectedEvent = timelineRaw.find((event) => event.status === 'Rejected');
      timeline.push({
        status: 'Rejected',
        timestamp: rejectedEvent?.changed_at ?? record.updated_at,
        completed: true,
      });
    }

    const remainingBalance = Math.max(0, record.repayment_amount - record.amount_paid);
    const repaymentPercent = record.repayment_amount > 0
      ? Math.min(100, Math.round((record.amount_paid / record.repayment_amount) * 100))
      : 0;

    return {
      ...record,
      invoice,
      timeline,
      repayment: {
        total: record.repayment_amount,
        paid: record.amount_paid,
        remaining: remainingBalance,
        percentage: repaymentPercent,
      },
    };
  }

  async updateStatus(id: string, status: FinancingStatus, auth: AuthContext) {
    const existing = await this.getRequestById(id, auth);

    const validTransitions: Record<FinancingStatus, FinancingStatus[]> = {
      Pending: ['Under Review', 'Rejected'],
      'Under Review': ['Approved', 'Rejected'],
      Approved: ['Disbursed', 'Rejected'],
      Rejected: [],
      Disbursed: ['Repaid'],
      Repaid: [],
    };

    if (!validTransitions[existing.status].includes(status) && existing.status !== status) {
      throw new AppError(
        409,
        `Cannot change status from ${existing.status} to ${status}`,
        'INVALID_FINANCING_STATUS_TRANSITION',
      );
    }

    const approvedAmount =
      status === 'Approved' && !existing.approved_amount
        ? Number((existing.requested_amount * 0.92).toFixed(2))
        : undefined;

    const interestRate = status === 'Approved' && !existing.interest_rate ? 2.5 : undefined;

    const repaymentAmount =
      approvedAmount && interestRate !== undefined
        ? Number((approvedAmount * (1 + interestRate / 100)).toFixed(2))
        : undefined;

    const disbursementDate = status === 'Disbursed' ? new Date().toISOString().slice(0, 10) : undefined;
    const repaymentDueDate =
      status === 'Disbursed'
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
        : undefined;

    const amountPaid = status === 'Repaid' ? (existing.repayment_amount ?? repaymentAmount ?? 0) : undefined;
    const financierOrgId = ['Approved', 'Disbursed', 'Repaid'].includes(status)
      ? auth.companyId
      : undefined;

    const updated = await this.financingRepository.updateStatus({
      id,
      companyId: auth.companyId,
      status,
      approvedAmount,
      interestRate,
      repaymentAmount,
      disbursementDate,
      repaymentDueDate,
      amountPaid,
      financierOrgId,
    });

    if (!updated) {
      throw new AppError(404, 'Financing request not found', 'FINANCING_REQUEST_NOT_FOUND');
    }

    return updated;
  }
}
