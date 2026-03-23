import { apiClient } from './apiClient';

import { FinancingStatus } from '../features/financing/types';

export type FinancingListQuery = {
  status?: FinancingStatus;
  search?: string;
};

export type RequestFinancingPayload = {
  invoice_id: string;
  requested_amount: number;
};

export type FinancingInvoiceApi = {
  id: string;
  company_id: string;
  buyer_name: string;
  amount: number;
  due_date?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FinancingTimelineApi = {
  status: FinancingStatus;
  timestamp?: string | null;
  completed: boolean;
};

export type FinancingRequestApi = {
  id: string;
  company_id: string;
  invoice_id: string;
  buyer_name: string;
  requested_amount: number;
  approved_amount?: number | null;
  interest_rate?: number | null;
  repayment_amount: number;
  amount_paid: number;
  status: FinancingStatus;
  disbursement_date?: string | null;
  repayment_due_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancingDetailApi = FinancingRequestApi & {
  invoice?: FinancingInvoiceApi | null;
  timeline: FinancingTimelineApi[];
  repayment: {
    total: number;
    paid: number;
    remaining: number;
    percentage: number;
  };
};

export type FinancingListApiResponse = {
  requests: FinancingRequestApi[];
  creditInsights: {
    totalLimit: number;
    usedLimit: number;
    availableLimit: number;
  };
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    tone: 'info' | 'warning' | 'danger' | 'success';
  }>;
};

export async function requestFinancing(payload: RequestFinancingPayload) {
  const response = await apiClient.post('/financing/request', payload);

  return response.data;
}

export async function getFinancingRequests(query?: FinancingListQuery) {
  const response = await apiClient.get('/financing', { params: query });

  return response.data;
}

export async function getFinancingRequestById(id: string) {
  const response = await apiClient.get(`/financing/${id}`);

  return response.data;
}

export async function updateFinancingStatus(id: string, status: FinancingStatus) {
  const response = await apiClient.patch(`/financing/${id}/status`, { status });

  return response.data;
}

export async function getFinancingInvoices(search?: string) {
  const response = await apiClient.get('/financing/invoices', { params: { search } });

  return response.data;
}
