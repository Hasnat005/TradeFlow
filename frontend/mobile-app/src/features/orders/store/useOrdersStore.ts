import { create } from 'zustand';

import { createInvoiceFromOrder } from '../../../services/invoicesApi';
import { initialPurchaseOrders } from '../data';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../types';
import { calculateOrderTotal } from '../utils';

type CreateOrderInput = {
  supplierName: string;
  expectedDeliveryDate: string;
  notes?: string;
  items: PurchaseOrderItem[];
  submit: boolean;
};

type OrdersState = {
  orders: PurchaseOrder[];
  createOrder: (input: CreateOrderInput) => string;
  updateOrder: (orderId: string, patch: Partial<Pick<PurchaseOrder, 'supplierName' | 'expectedDeliveryDate' | 'notes' | 'items'>>) => void;
  updateStatus: (orderId: string, status: PurchaseOrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  convertToInvoice: (orderId: string) => Promise<string>;
};

function nextPoNumber(orders: PurchaseOrder[]) {
  const max = orders
    .map((order) => Number.parseInt(order.poNumber.replace('PO-', ''), 10))
    .filter((value) => Number.isFinite(value))
    .reduce((highest, current) => Math.max(highest, current), 1020);

  return `PO-${max + 1}`;
}

function appendTimeline(order: PurchaseOrder, status: PurchaseOrderStatus) {
  const exists = order.timeline.some((entry) => entry.status === status);
  if (exists) {
    return order.timeline;
  }

  return [...order.timeline, { status, timestamp: new Date().toISOString().slice(0, 10) }];
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: initialPurchaseOrders,
  createOrder: (input) => {
    let createdId = '';

    set((state) => {
      const poNumber = nextPoNumber(state.orders);
      const id = `PO-ID-${poNumber.replace('PO-', '')}`;
      createdId = id;

      const status: PurchaseOrderStatus = input.submit ? 'Sent' : 'Draft';
      const now = new Date().toISOString().slice(0, 10);

      const order: PurchaseOrder = {
        id,
        poNumber,
        companyId: 'cmp-1',
        supplierName: input.supplierName,
        totalAmount: calculateOrderTotal(input.items),
        status,
        orderDate: now,
        expectedDeliveryDate: input.expectedDeliveryDate,
        notes: input.notes,
        items: input.items,
        timeline: [
          { status: 'Draft', timestamp: now },
          ...(status === 'Sent' ? [{ status: 'Sent' as const, timestamp: now }] : []),
        ],
      };

      return {
        orders: [order, ...state.orders],
      };
    });

    return createdId;
  },
  updateOrder: (orderId, patch) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId || order.status !== 'Draft') {
          return order;
        }

        const items = patch.items ?? order.items;

        return {
          ...order,
          ...patch,
          items,
          totalAmount: calculateOrderTotal(items),
        };
      }),
    }));
  },
  updateStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              timeline: appendTimeline(order, status),
            }
          : order,
      ),
    }));
  },
  cancelOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Rejected',
              timeline: appendTimeline(order, 'Rejected'),
            }
          : order,
      ),
    }));
  },
  convertToInvoice: async (orderId) => {
    const order = get().orders.find((entry) => entry.id === orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.linkedInvoiceId) {
      return order.linkedInvoiceId;
    }

    const response = await createInvoiceFromOrder(order.id);
    const invoiceId = response?.data?.id as string;

    if (!invoiceId) {
      throw new Error('Unable to convert order to invoice');
    }

    set((state) => ({
      orders: state.orders.map((entry) =>
        entry.id === orderId
          ? {
              ...entry,
              linkedInvoiceId: invoiceId,
            }
          : entry,
      ),
    }));

    return invoiceId;
  },
}));
