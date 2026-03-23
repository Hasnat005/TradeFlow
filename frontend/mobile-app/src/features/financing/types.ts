export type FinancingStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid';

export type FinancingTone = 'info' | 'warning' | 'danger' | 'success';

export type FinancingInvoice = {
  id: string;
  buyerName: string;
  amount: number;
  dueDate?: string;
  status: string;
};

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
  disbursementDate?: string;
  repaymentDueDate?: string;
  requestedAt: string;
  updatedAt: string;
};

export type FinancingTimelineStep = {
  status: FinancingStatus;
  timestamp?: string | null;
  completed: boolean;
};

export type FinancingDetail = FinancingRequest & {
  invoice?: FinancingInvoice | null;
  timeline: FinancingTimelineStep[];
  repayment: {
    total: number;
    paid: number;
    remaining: number;
    percentage: number;
  };
};

export type CreditInsights = {
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
};

export type FinancingAlert = {
  id: string;
  title: string;
  description: string;
  tone: FinancingTone;
};

export type FinancingListResponse = {
  requests: FinancingRequest[];
  creditInsights: CreditInsights;
  alerts: FinancingAlert[];
};
