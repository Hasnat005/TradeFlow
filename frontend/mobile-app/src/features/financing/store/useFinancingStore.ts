import { create } from 'zustand';

import { useInvoicesStore } from '../../invoices/store/useInvoicesStore';
import { initialFinancingRequests } from '../data';
import { FinancingRequest } from '../types';
import { calculateRepayment } from '../utils';

type RequestFinancingInput = {
  invoiceId: string;
  requestedAmount: number;
};

type FinancingState = {
  requests: FinancingRequest[];
  requestFinancing: (input: RequestFinancingInput) => FinancingRequest;
  acceptOffer: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  markAsRepaid: (requestId: string) => void;
};

function generateRequestId(requests: FinancingRequest[]) {
  const ids = requests
    .map((request) => Number.parseInt(request.id.replace('FIN-', ''), 10))
    .filter((value) => Number.isFinite(value));
  const max = ids.length ? Math.max(...ids) : 9000;
  return `FIN-${max + 1}`;
}

export const useFinancingStore = create<FinancingState>((set) => ({
  requests: initialFinancingRequests,
  requestFinancing: ({ invoiceId, requestedAmount }) => {
    const invoice = useInvoicesStore.getState().invoices.find((item) => item.id === invoiceId);

    if (!invoice) {
      throw new Error('Invoice not found for financing request');
    }

    if (requestedAmount <= 0 || requestedAmount > invoice.amount) {
      throw new Error('Requested amount must be greater than zero and not exceed invoice amount');
    }

    const created: FinancingRequest = {
      id: '',
      invoiceId: invoice.id,
      buyerName: invoice.buyerName,
      requestedAmount,
      approvedAmount: undefined,
      interestRate: undefined,
      repaymentAmount: calculateRepayment(requestedAmount, 2.8),
      amountPaid: 0,
      status: 'Pending',
      requestedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    set((state) => {
      const id = generateRequestId(state.requests);
      created.id = id;

      return {
        requests: [{ ...created }, ...state.requests],
      };
    });

    useInvoicesStore.getState().requestFinancing(invoice.id);

    return created;
  },
  acceptOffer: (requestId) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId && request.status === 'Approved'
          ? { ...request, status: 'Disbursed', updatedAt: new Date().toISOString().slice(0, 10) }
          : request,
      ),
    }));
  },
  cancelRequest: (requestId) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId && request.status === 'Pending'
          ? { ...request, status: 'Rejected', updatedAt: new Date().toISOString().slice(0, 10) }
          : request,
      ),
    }));
  },
  markAsRepaid: (requestId) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'Repaid',
              amountPaid: request.repaymentAmount,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : request,
      ),
    }));
  },
}));
