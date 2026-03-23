export type InvoiceStatus = 'Draft' | 'Sent' | 'Financed' | 'Paid' | 'Overdue';

export type InvoiceLineItem = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTimelineEntry = {
  status: InvoiceStatus;
  timestamp?: string;
  completed: boolean;
};

export type Invoice = {
  id: string;
  buyerName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  totalAmount: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  updatedAt: string;
};

export type InvoiceDetail = Invoice & {
  timeline: InvoiceTimelineEntry[];
};

export type InvoiceAlert = {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
};

export type InvoicesListResponse = {
  invoices: Invoice[];
  alerts: InvoiceAlert[];
};

export type InvoiceStatusFilter = 'All' | InvoiceStatus;

export type InvoiceDateRange = {
  from?: string;
  to?: string;
};
