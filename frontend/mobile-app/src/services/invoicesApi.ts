import { apiClient } from './apiClient';

import { InvoiceStatus } from '../features/invoices/types';

export type InvoicesListQuery = {
  status?: InvoiceStatus;
  search?: string;
  from?: string;
  to?: string;
};

export type InvoiceItemApi = {
  id: string;
  invoice_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceApi = {
  id: string;
  company_id: string;
  buyer_name: string;
  purchase_order_id?: string | null;
  po_number?: string | null;
  total_amount: number;
  paid_amount: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  items?: InvoiceItemApi[];
};

export type InvoiceDetailApi = InvoiceApi & {
  items: InvoiceItemApi[];
  timeline: Array<{
    status: InvoiceStatus;
    timestamp?: string | null;
    completed: boolean;
  }>;
};

export type InvoiceListApiResponse = {
  invoices: InvoiceApi[];
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    tone: 'info' | 'warning' | 'danger' | 'success';
  }>;
};

export async function getInvoices(query?: InvoicesListQuery) {
  const response = await apiClient.get('/invoices', { params: query });
  return response.data;
}

export async function getInvoiceById(id: string) {
  const response = await apiClient.get(`/invoices/${id}`);
  return response.data;
}

export async function createInvoice(payload: {
  buyer_name: string;
  purchase_order_id?: string;
  items: Array<{ item_name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  due_date: string;
  status?: 'Draft' | 'Sent';
}) {
  const response = await apiClient.post('/invoices', payload);
  return response.data;
}

export async function updateInvoiceStatus(
  id: string,
  payload: { status: InvoiceStatus; payment_amount?: number },
) {
  const response = await apiClient.patch(`/invoices/${id}/status`, payload);
  return response.data;
}

export async function createInvoiceFromOrder(orderId: string) {
  const response = await apiClient.post('/invoices/from-order', { order_id: orderId });
  return response.data;
}
