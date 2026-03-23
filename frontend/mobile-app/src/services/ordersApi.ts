import { apiClient } from './apiClient';

type OrderStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Completed';

export type OrderItemPayload = {
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type CreateOrderPayload = {
  supplier_name: string;
  expected_delivery_date: string;
  notes?: string;
  status: OrderStatus;
  items: OrderItemPayload[];
};

export type UpdateOrderPayload = Partial<{
  supplier_name: string;
  expected_delivery_date: string;
  notes: string;
  items: OrderItemPayload[];
}>;

export type ListOrdersQuery = {
  status?: OrderStatus;
  search?: string;
  from?: string;
  to?: string;
};

export type ApiOrderItem = {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type ApiOrder = {
  id: string;
  company_id: string;
  po_number: string;
  supplier_name: string;
  total_amount: number;
  status: OrderStatus;
  expected_delivery_date: string;
  notes?: string | null;
  linked_invoice_id?: string | null;
  created_at: string;
  updated_at: string;
  items: ApiOrderItem[];
};

export async function createOrder(payload: CreateOrderPayload) {
  const response = await apiClient.post('/orders', payload);

  return response.data;
}

export async function getOrders(query?: ListOrdersQuery) {
  const response = await apiClient.get('/orders', {
    params: query,
  });

  return response.data;
}

export async function getOrderById(id: string) {
  const response = await apiClient.get(`/orders/${id}`);

  return response.data;
}

export async function updateOrder(id: string, payload: UpdateOrderPayload) {
  const response = await apiClient.patch(`/orders/${id}`, payload);

  return response.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });

  return response.data;
}

export async function convertOrderToInvoice(orderId: string) {
  const response = await apiClient.post('/invoices/from-order', { orderId });

  return response.data;
}
