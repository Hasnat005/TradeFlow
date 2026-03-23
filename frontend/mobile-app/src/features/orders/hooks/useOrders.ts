import { useMutation, useQuery } from '@tanstack/react-query';

import {
  convertOrderToInvoice,
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatus,
  type ApiOrder,
  type CreateOrderPayload,
  type ListOrdersQuery,
  type UpdateOrderPayload,
} from '../../../services/ordersApi';
import { queryClient } from '../../../services/queryClient';
import { PurchaseOrder, PurchaseOrderStatus } from '../types';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

const WORKFLOW: PurchaseOrderStatus[] = ['Draft', 'Sent', 'Accepted', 'Delivered', 'Completed'];

export const ordersQueryKeys = {
  all: ['orders'] as const,
  list: (query?: ListOrdersQuery) => ['orders', 'list', query ?? {}] as const,
  detail: (orderId: string) => ['orders', 'detail', orderId] as const,
};

function mapOrder(order: ApiOrder): PurchaseOrder {
  const reachedIndex = Math.max(0, WORKFLOW.indexOf(order.status));
  const timeline = WORKFLOW.slice(0, reachedIndex + 1).map((status) => ({
    status,
    timestamp: status === 'Draft' ? order.created_at.slice(0, 10) : order.updated_at.slice(0, 10),
  }));

  if (order.status === 'Rejected') {
    timeline.push({
      status: 'Rejected',
      timestamp: order.updated_at.slice(0, 10),
    });
  }

  return {
    id: order.id,
    poNumber: order.po_number,
    companyId: order.company_id,
    supplierName: order.supplier_name,
    totalAmount: order.total_amount,
    status: order.status,
    orderDate: order.created_at.slice(0, 10),
    expectedDeliveryDate: order.expected_delivery_date,
    notes: order.notes ?? undefined,
    items: order.items.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    timeline,
    linkedInvoiceId: order.linked_invoice_id ?? undefined,
  };
}

export function useOrdersListQuery(query?: ListOrdersQuery) {
  return useQuery({
    queryKey: ordersQueryKeys.list(query),
    queryFn: async () => {
      const response = (await getOrders(query)) as ApiSuccessResponse<ApiOrder[]>;
      return response.data.map(mapOrder);
    },
  });
}

export function useOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: ordersQueryKeys.detail(orderId),
    queryFn: async () => {
      const response = (await getOrderById(orderId)) as ApiSuccessResponse<ApiOrder>;
      return mapOrder(response.data);
    },
    enabled: orderId.length > 0,
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = (await createOrder(payload)) as ApiSuccessResponse<ApiOrder>;
      return mapOrder(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrderMutation(orderId: string) {
  return useMutation({
    mutationFn: async (payload: UpdateOrderPayload) => {
      const response = (await updateOrder(orderId, payload)) as ApiSuccessResponse<ApiOrder>;
      return mapOrder(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrderStatusMutation(orderId: string) {
  return useMutation({
    mutationFn: async (status: PurchaseOrderStatus) => {
      const response = (await updateOrderStatus(orderId, status)) as ApiSuccessResponse<ApiOrder>;
      return mapOrder(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useConvertOrderToInvoiceMutation(orderId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = (await convertOrderToInvoice(orderId)) as ApiSuccessResponse<{ orderId: string; invoiceId: string }>;
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
