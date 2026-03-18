import { AppError } from '../utils/app-error';
import { FinancingRepository, FinancingStatus } from '../repositories/financing.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

type CreateRequestInput = {
  invoiceId: string;
  requestedAmount: number;
  invoiceAmount: number;
  buyerName?: string;
};

export class FinancingService {
  constructor(private readonly financingRepository: FinancingRepository) {}

  async createRequest(input: CreateRequestInput, auth: AuthContext) {
    if (input.requestedAmount > input.invoiceAmount) {
      throw new AppError(400, 'Requested amount cannot exceed invoice amount', 'INVALID_REQUESTED_AMOUNT');
    }

    const interestRate = 2.8;
    const repaymentAmount = Number((input.requestedAmount * (1 + interestRate / 100)).toFixed(2));

    return this.financingRepository.create({
      companyId: auth.companyId,
      invoiceId: input.invoiceId,
      buyerName: input.buyerName?.trim() || 'Linked Invoice Buyer',
      requestedAmount: input.requestedAmount,
      repaymentAmount,
    });
  }

  async listRequests(auth: AuthContext, status?: FinancingStatus) {
    return this.financingRepository.findAllByCompany(auth.companyId, status);
  }

  async getRequestById(id: string, auth: AuthContext) {
    const record = await this.financingRepository.findById(id, auth.companyId);

    if (!record) {
      throw new AppError(404, 'Financing request not found', 'FINANCING_REQUEST_NOT_FOUND');
    }

    return record;
  }

  async updateStatus(id: string, status: FinancingStatus, auth: AuthContext) {
    const existing = await this.getRequestById(id, auth);

    const validTransitions: Record<FinancingStatus, FinancingStatus[]> = {
      Pending: ['Approved', 'Rejected'],
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

    const updated = await this.financingRepository.updateStatus({
      id,
      companyId: auth.companyId,
      status,
      approvedAmount,
      interestRate,
      repaymentAmount,
    });

    if (!updated) {
      throw new AppError(404, 'Financing request not found', 'FINANCING_REQUEST_NOT_FOUND');
    }

    return updated;
  }
}
