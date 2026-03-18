import { FinancingRequest, FinancingStatus } from './types';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateEstimatedInterest(amount: number, ratePercent: number) {
  return amount * (ratePercent / 100);
}

export function calculateRepayment(amount: number, ratePercent: number) {
  return amount + calculateEstimatedInterest(amount, ratePercent);
}

export function getStatusSortWeight(status: FinancingStatus) {
  const order: Record<FinancingStatus, number> = {
    Pending: 0,
    Approved: 1,
    Disbursed: 2,
    Repaid: 3,
    Rejected: 4,
  };

  return order[status];
}

export function getRepaymentProgress(request: FinancingRequest) {
  if (request.repaymentAmount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((request.amountPaid / request.repaymentAmount) * 100));
}
