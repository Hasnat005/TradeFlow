import { useMutation, useQuery } from '@tanstack/react-query';

import {
  getFinancingInvoices,
  getFinancingRequestById,
  getFinancingRequests,
  requestFinancing,
  updateFinancingStatus,
  type FinancingDetailApi,
  type FinancingInvoiceApi,
  type FinancingListApiResponse,
  type FinancingListQuery,
  type FinancingRequestApi,
} from '../../../services/financingApi';
import { queryClient } from '../../../services/queryClient';
import {
  FinancingAlert,
  FinancingDetail,
  FinancingInvoice,
  FinancingListResponse,
  FinancingRequest,
  FinancingStatus,
} from '../types';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const financingQueryKeys = {
  all: ['financing'] as const,
  list: (query?: FinancingListQuery) => ['financing', 'list', query ?? {}] as const,
  detail: (id: string) => ['financing', 'detail', id] as const,
  invoices: (search?: string) => ['financing', 'invoices', search ?? ''] as const,
};

function mapRequest(value: FinancingRequestApi): FinancingRequest {
  return {
    id: value.id,
    invoiceId: value.invoice_id,
    buyerName: value.buyer_name,
    requestedAmount: value.requested_amount,
    approvedAmount: value.approved_amount ?? undefined,
    interestRate: value.interest_rate ?? undefined,
    repaymentAmount: value.repayment_amount,
    amountPaid: value.amount_paid,
    status: value.status,
    disbursementDate: value.disbursement_date ?? undefined,
    repaymentDueDate: value.repayment_due_date ?? undefined,
    requestedAt: value.created_at.slice(0, 10),
    updatedAt: value.updated_at.slice(0, 10),
  };
}

function mapInvoice(value: FinancingInvoiceApi): FinancingInvoice {
  return {
    id: value.id,
    buyerName: value.buyer_name,
    amount: value.amount,
    dueDate: value.due_date ?? undefined,
    status: value.status,
  };
}

function mapList(value: FinancingListApiResponse): FinancingListResponse {
  return {
    requests: value.requests.map(mapRequest),
    creditInsights: {
      totalLimit: value.creditInsights.totalLimit,
      usedLimit: value.creditInsights.usedLimit,
      availableLimit: value.creditInsights.availableLimit,
    },
    alerts: value.alerts.map(
      (alert): FinancingAlert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        tone: alert.tone,
      }),
    ),
  };
}

function mapDetail(value: FinancingDetailApi): FinancingDetail {
  return {
    ...mapRequest(value),
    invoice: value.invoice ? mapInvoice(value.invoice) : undefined,
    timeline: value.timeline.map((step) => ({
      status: step.status,
      timestamp: step.timestamp ?? undefined,
      completed: step.completed,
    })),
    repayment: value.repayment,
  };
}

export function useFinancingListQuery(query?: FinancingListQuery) {
  return useQuery({
    queryKey: financingQueryKeys.list(query),
    queryFn: async () => {
      const response = (await getFinancingRequests(query)) as ApiSuccessResponse<FinancingListApiResponse>;
      return mapList(response.data);
    },
  });
}

export function useFinancingDetailQuery(id: string) {
  return useQuery({
    queryKey: financingQueryKeys.detail(id),
    queryFn: async () => {
      const response = (await getFinancingRequestById(id)) as ApiSuccessResponse<FinancingDetailApi>;
      return mapDetail(response.data);
    },
    enabled: id.length > 0,
  });
}

export function useFinancingInvoicesQuery(search?: string) {
  return useQuery({
    queryKey: financingQueryKeys.invoices(search),
    queryFn: async () => {
      const response = (await getFinancingInvoices(search)) as ApiSuccessResponse<FinancingInvoiceApi[]>;
      return response.data.map(mapInvoice);
    },
  });
}

export function useRequestFinancingMutation() {
  return useMutation({
    mutationFn: async (payload: { invoiceId: string; requestedAmount: number }) => {
      const response = (await requestFinancing({
        invoice_id: payload.invoiceId,
        requested_amount: payload.requestedAmount,
      })) as ApiSuccessResponse<FinancingRequestApi>;

      return mapRequest(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financingQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFinancingStatusMutation(id: string) {
  return useMutation({
    mutationFn: async (status: FinancingStatus) => {
      const response = (await updateFinancingStatus(id, status)) as ApiSuccessResponse<FinancingRequestApi>;
      return mapRequest(response.data);
    },
    onMutate: async (nextStatus) => {
      await queryClient.cancelQueries({ queryKey: financingQueryKeys.detail(id) });
      const previous = queryClient.getQueryData<FinancingDetail>(financingQueryKeys.detail(id));

      if (previous) {
        queryClient.setQueryData<FinancingDetail>(financingQueryKeys.detail(id), {
          ...previous,
          status: nextStatus,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(financingQueryKeys.detail(id), context.previous);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financingQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: financingQueryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
