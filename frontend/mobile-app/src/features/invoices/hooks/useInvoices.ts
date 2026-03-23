import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoiceStatus,
  type InvoiceApi,
  type InvoiceDetailApi,
  type InvoiceItemApi,
  type InvoiceListApiResponse,
  type InvoicesListQuery,
} from '../../../services/invoicesApi';
import { queryClient } from '../../../services/queryClient';
import { Invoice, InvoiceDetail, InvoiceLineItem, InvoicesListResponse, InvoiceStatus } from '../types';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const invoicesQueryKeys = {
  all: ['invoices'] as const,
  list: (query?: InvoicesListQuery) => ['invoices', 'list', query ?? {}] as const,
  detail: (id: string) => ['invoices', 'detail', id] as const,
};

function mapItem(item: InvoiceItemApi): InvoiceLineItem {
  return {
    id: item.id,
    itemName: item.item_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
  };
}

function mapInvoice(value: InvoiceApi): Invoice {
  return {
    id: value.id,
    buyerName: value.buyer_name,
    purchaseOrderId: value.purchase_order_id ?? undefined,
    poNumber: value.po_number ?? undefined,
    totalAmount: value.total_amount,
    paidAmount: value.paid_amount,
    issueDate: value.issue_date,
    dueDate: value.due_date,
    status: value.status,
    lineItems: (value.items ?? []).map(mapItem),
    updatedAt: value.updated_at,
  };
}

function mapDetail(value: InvoiceDetailApi): InvoiceDetail {
  return {
    ...mapInvoice(value),
    lineItems: value.items.map(mapItem),
    timeline: value.timeline.map((entry) => ({
      status: entry.status,
      timestamp: entry.timestamp ?? undefined,
      completed: entry.completed,
    })),
  };
}

function mapList(value: InvoiceListApiResponse): InvoicesListResponse {
  return {
    invoices: value.invoices.map(mapInvoice),
    alerts: value.alerts,
  };
}

export function useInvoicesListQuery(query?: InvoicesListQuery) {
  return useQuery({
    queryKey: invoicesQueryKeys.list(query),
    queryFn: async () => {
      const response = (await getInvoices(query)) as ApiSuccessResponse<InvoiceListApiResponse>;
      return mapList(response.data);
    },
  });
}

export function useInvoiceDetailQuery(id: string) {
  return useQuery({
    queryKey: invoicesQueryKeys.detail(id),
    queryFn: async () => {
      const response = (await getInvoiceById(id)) as ApiSuccessResponse<InvoiceDetailApi>;
      return mapDetail(response.data);
    },
    enabled: id.length > 0,
  });
}

export function useCreateInvoiceMutation() {
  return useMutation({
    mutationFn: async (payload: {
      buyerName: string;
      purchaseOrderId?: string;
      dueDate: string;
      totalAmount: number;
      status?: 'Draft' | 'Sent';
      items: InvoiceLineItem[];
    }) => {
      const response = (await createInvoice({
        buyer_name: payload.buyerName,
        purchase_order_id: payload.purchaseOrderId,
        due_date: payload.dueDate,
        total_amount: payload.totalAmount,
        status: payload.status,
        items: payload.items.map((item) => ({
          item_name: item.itemName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      })) as ApiSuccessResponse<InvoiceApi>;

      return mapInvoice(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInvoiceStatusMutation(id: string) {
  return useMutation({
    mutationFn: async (payload: { status: InvoiceStatus; paymentAmount?: number }) => {
      const response = (await updateInvoiceStatus(id, {
        status: payload.status,
        payment_amount: payload.paymentAmount,
      })) as ApiSuccessResponse<InvoiceApi>;

      return mapInvoice(response.data);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: invoicesQueryKeys.detail(id) });
      const previous = queryClient.getQueryData<InvoiceDetail>(invoicesQueryKeys.detail(id));

      if (previous) {
        queryClient.setQueryData<InvoiceDetail>(invoicesQueryKeys.detail(id), {
          ...previous,
          status: payload.status,
          paidAmount: payload.status === 'Paid' ? previous.totalAmount : previous.paidAmount,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(invoicesQueryKeys.detail(id), context.previous);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
