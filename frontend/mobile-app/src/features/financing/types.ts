export type FinancingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid';

export type FinancingRequest = {
  id: string;
  invoiceId: string;
  buyerName: string;
  requestedAmount: number;
  approvedAmount?: number;
  interestRate?: number;
  repaymentAmount: number;
  amountPaid: number;
  status: FinancingStatus;
  requestedAt: string;
  updatedAt: string;
};

export type CreditInsights = {
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  repaidAmount: number;
};

export type FinancingAlert = {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
};
