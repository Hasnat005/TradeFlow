import { apiClient } from './apiClient';

type FinancingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid';

export type FinancingRequestPayload = {
  invoiceId: string;
  requestedAmount: number;
  invoiceAmount: number;
};

export type UpdateFinancingStatusPayload = {
  status: FinancingStatus;
};

export async function createFinancingRequest(payload: FinancingRequestPayload, token: string) {
  const response = await apiClient.post('/financing/request', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getFinancingRequests(token: string) {
  const response = await apiClient.get('/financing', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getFinancingRequestById(id: string, token: string) {
  const response = await apiClient.get(`/financing/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateFinancingStatus(
  id: string,
  payload: UpdateFinancingStatusPayload,
  token: string,
) {
  const response = await apiClient.patch(`/financing/${id}/status`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
