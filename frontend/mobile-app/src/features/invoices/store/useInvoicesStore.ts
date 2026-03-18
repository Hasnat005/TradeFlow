import { create } from 'zustand';

import { initialInvoices } from '../data';
import { Invoice, InvoiceLineItem } from '../types';
import { calculateInvoiceTotal, inferInvoiceStatus } from '../utils';

type CreateInvoiceInput = {
  buyerName: string;
  dueDate: string;
  description: string;
  lineItems: InvoiceLineItem[];
};

type CreateInvoiceFromPurchaseOrderInput = CreateInvoiceInput & {
  purchaseOrderId: string;
};

type InvoicesState = {
  invoices: Invoice[];
  createInvoice: (input: CreateInvoiceInput) => string;
  createInvoiceFromPurchaseOrder: (input: CreateInvoiceFromPurchaseOrderInput) => string;
  markAsPaid: (invoiceId: string) => void;
  requestFinancing: (invoiceId: string) => void;
};

function generateInvoiceId(invoices: Invoice[]) {
  const invoiceNumbers = invoices
    .map((invoice) => Number.parseInt(invoice.id.replace('INV-', ''), 10))
    .filter((value) => Number.isFinite(value));

  const max = invoiceNumbers.length ? Math.max(...invoiceNumbers) : 2000;
  return `INV-${max + 1}`;
}

function getBuyerEmail(name: string) {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '.');
  return `${normalized}@buyer-mail.com`;
}

export const useInvoicesStore = create<InvoicesState>((set) => ({
  invoices: initialInvoices,
  createInvoice: (input) => {
    let createdInvoiceId = '';

    set((state) => {
      const invoiceId = generateInvoiceId(state.invoices);
      createdInvoiceId = invoiceId;

      const amount = calculateInvoiceTotal(input.lineItems);
      const baseStatus = 'Pending' as const;

      const invoice: Invoice = {
        id: invoiceId,
        buyerName: input.buyerName,
        buyerEmail: getBuyerEmail(input.buyerName),
        buyerCompany: input.buyerName,
        amount,
        dueDate: input.dueDate,
        description: input.description,
        status: inferInvoiceStatus(input.dueDate, baseStatus),
        financingStatus: 'Not Requested',
        lineItems: input.lineItems,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      return {
        invoices: [invoice, ...state.invoices],
      };
    });

    return createdInvoiceId;
  },
  createInvoiceFromPurchaseOrder: (input) => {
    let createdInvoiceId = '';

    set((state) => {
      const invoiceId = generateInvoiceId(state.invoices);
      createdInvoiceId = invoiceId;

      const amount = calculateInvoiceTotal(input.lineItems);

      const invoice: Invoice = {
        id: invoiceId,
        buyerName: input.buyerName,
        buyerEmail: getBuyerEmail(input.buyerName),
        buyerCompany: input.buyerName,
        amount,
        dueDate: input.dueDate,
        description: input.description,
        status: inferInvoiceStatus(input.dueDate, 'Pending'),
        financingStatus: 'Not Requested',
        lineItems: input.lineItems,
        createdAt: new Date().toISOString().slice(0, 10),
        purchaseOrderId: input.purchaseOrderId,
      };

      return {
        invoices: [invoice, ...state.invoices],
      };
    });

    return createdInvoiceId;
  },
  markAsPaid: (invoiceId) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: 'Paid', financingStatus: 'Not Requested' } : invoice,
      ),
    }));
  },
  requestFinancing: (invoiceId) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              financingStatus: invoice.financingStatus === 'Approved' ? 'Approved' : 'Requested',
              status: invoice.status === 'Paid' ? 'Paid' : 'Pending',
            }
          : invoice,
      ),
    }));
  },
}));
