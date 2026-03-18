export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Completed';

export type PurchaseOrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type PurchaseOrderTimelineEntry = {
  status: PurchaseOrderStatus;
  timestamp: string;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  companyId: string;
  supplierName: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  notes?: string;
  items: PurchaseOrderItem[];
  timeline: PurchaseOrderTimelineEntry[];
  linkedInvoiceId?: string;
};

export type OrdersStatusFilter = 'All' | 'Draft' | 'Sent' | 'Completed';

export type OrdersDateRange = {
  from?: string;
  to?: string;
};
