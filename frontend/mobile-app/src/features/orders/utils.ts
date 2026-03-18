import { PurchaseOrderItem, PurchaseOrderStatus } from './types';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateOrderTotal(items: PurchaseOrderItem[]) {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function normalizeDate(dateText: string) {
  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function getStatusSortWeight(status: PurchaseOrderStatus) {
  const order: Record<PurchaseOrderStatus, number> = {
    Draft: 0,
    Sent: 1,
    Accepted: 2,
    Delivered: 3,
    Completed: 4,
    Rejected: 5,
  };

  return order[status];
}
