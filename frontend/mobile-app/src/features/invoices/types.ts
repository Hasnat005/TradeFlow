export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Financed';

export type FinancingStatus = 'Not Requested' | 'Requested' | 'Approved' | 'Rejected';

export type InvoiceLineItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  amount: number;
  dueDate: string;
  description: string;
  status: InvoiceStatus;
  financingStatus: FinancingStatus;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  purchaseOrderId?: string;
};

export type InvoiceStatusFilter = 'All' | 'Pending' | 'Paid' | 'Overdue';

export type InvoiceDateRange = {
  from?: string;
  to?: string;
};
