import { FinancingAlert, FinancingRequest } from './types';

export const initialFinancingRequests: FinancingRequest[] = [
  {
    id: 'FIN-9001',
    invoiceId: 'INV-2048',
    buyerName: 'Nexus Retail Group',
    requestedAmount: 10000,
    approvedAmount: 9200,
    interestRate: 2.5,
    repaymentAmount: 9430,
    amountPaid: 0,
    status: 'Approved',
    requestedAt: '2026-03-10',
    updatedAt: '2026-03-13',
  },
  {
    id: 'FIN-8998',
    invoiceId: 'INV-2035',
    buyerName: 'Zenith Construction',
    requestedAmount: 25000,
    approvedAmount: 24000,
    interestRate: 2.2,
    repaymentAmount: 24528,
    amountPaid: 12264,
    status: 'Disbursed',
    requestedAt: '2026-02-24',
    updatedAt: '2026-03-08',
  },
  {
    id: 'FIN-8991',
    invoiceId: 'INV-2041',
    buyerName: 'Apex Imports Ltd.',
    requestedAmount: 15000,
    approvedAmount: undefined,
    interestRate: undefined,
    repaymentAmount: 0,
    amountPaid: 0,
    status: 'Pending',
    requestedAt: '2026-03-15',
    updatedAt: '2026-03-15',
  },
];

export const sampleFinancingAlerts: FinancingAlert[] = [
  {
    id: 'AL-1',
    title: 'Financing request approved',
    description: 'FIN-9001 has been approved. Accept the offer to proceed to disbursement.',
    tone: 'success',
  },
  {
    id: 'AL-2',
    title: 'Repayment due in 2 days',
    description: 'Upcoming repayment for FIN-8998 is due in 2 days.',
    tone: 'warning',
  },
  {
    id: 'AL-3',
    title: 'Credit limit reached',
    description: '80% of your credit line is currently utilized.',
    tone: 'danger',
  },
];
