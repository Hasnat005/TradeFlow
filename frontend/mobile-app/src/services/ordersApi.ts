import { apiClient } from './apiClient';

type OrderStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Completed';

type OrderItemPayload = {
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderPayload = {
  supplierName: string;
  expectedDeliveryDate: string;
  notes?: string;
  status: OrderStatus;
  items: OrderItemPayload[];
};

export type UpdateOrderPayload = Partial<{
  supplierName: string;
  expectedDeliveryDate: string;
  notes: string;
  items: OrderItemPayload[];
}>;

export async function createOrder(payload: CreateOrderPayload, token: string) {
  const response = await apiClient.post('/orders', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getOrders(token: string) {
  const response = await apiClient.get('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getOrderById(id: string, token: string) {
  const response = await apiClient.get(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateOrder(id: string, payload: UpdateOrderPayload, token: string) {
  const response = await apiClient.patch(`/orders/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus, token: string) {
  const response = await apiClient.patch(
    `/orders/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}
