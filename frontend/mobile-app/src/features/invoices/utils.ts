import { InvoiceLineItem, InvoiceStatus } from './types';

export function calculateInvoiceTotal(items: InvoiceLineItem[]) {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function normalizeDate(dateText: string) {
  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function inferInvoiceStatus(dueDate: string, status: InvoiceStatus) {
  if (status === 'Paid' || status === 'Financed') {
    return status;
  }

  const now = new Date();
  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    return status;
  }

  return due < now ? 'Overdue' : status;
}
