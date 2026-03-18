import { PurchaseOrder } from './types';

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-ID-1001',
    poNumber: 'PO-1023',
    companyId: 'cmp-1',
    supplierName: 'Nexus Industrial Supplies',
    totalAmount: 14250,
    status: 'Sent',
    orderDate: '2026-03-10',
    expectedDeliveryDate: '2026-03-24',
    notes: 'Expedite if possible',
    items: [
      { id: 'POI-1', itemName: 'Steel Fasteners', quantity: 5000, unitPrice: 1.2 },
      { id: 'POI-2', itemName: 'Safety Gloves', quantity: 400, unitPrice: 2.1 },
      { id: 'POI-3', itemName: 'Freight', quantity: 1, unitPrice: 6600 },
    ],
    timeline: [
      { status: 'Draft', timestamp: '2026-03-08' },
      { status: 'Sent', timestamp: '2026-03-10' },
    ],
  },
  {
    id: 'PO-ID-1002',
    poNumber: 'PO-1024',
    companyId: 'cmp-1',
    supplierName: 'Apex Packaging Co.',
    totalAmount: 9800,
    status: 'Accepted',
    orderDate: '2026-03-04',
    expectedDeliveryDate: '2026-03-18',
    notes: 'Deliver to warehouse B',
    items: [
      { id: 'POI-1', itemName: 'Carton Boxes', quantity: 2400, unitPrice: 2.5 },
      { id: 'POI-2', itemName: 'Thermal Labels', quantity: 600, unitPrice: 1.5 },
    ],
    timeline: [
      { status: 'Draft', timestamp: '2026-03-02' },
      { status: 'Sent', timestamp: '2026-03-03' },
      { status: 'Accepted', timestamp: '2026-03-04' },
    ],
  },
  {
    id: 'PO-ID-1003',
    poNumber: 'PO-1025',
    companyId: 'cmp-1',
    supplierName: 'BlueHarbor Foods',
    totalAmount: 12600,
    status: 'Completed',
    orderDate: '2026-02-20',
    expectedDeliveryDate: '2026-03-02',
    items: [
      { id: 'POI-1', itemName: 'Insulated Containers', quantity: 200, unitPrice: 45 },
      { id: 'POI-2', itemName: 'Cooling Packs', quantity: 500, unitPrice: 7.2 },
    ],
    timeline: [
      { status: 'Draft', timestamp: '2026-02-18' },
      { status: 'Sent', timestamp: '2026-02-19' },
      { status: 'Accepted', timestamp: '2026-02-20' },
      { status: 'Delivered', timestamp: '2026-03-01' },
      { status: 'Completed', timestamp: '2026-03-02' },
    ],
  },
];
