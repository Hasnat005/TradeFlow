import { apiClient } from './apiClient';

import { DashboardActivity, DashboardSummary } from '../features/dashboard/types';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export async function getDashboardSummary() {
  const response = await apiClient.get<ApiSuccessResponse<DashboardSummary>>('/dashboard/summary');
  return response.data;
}

export async function getRecentTransactions(limit = 12) {
  const response = await apiClient.get<ApiSuccessResponse<DashboardActivity[]>>('/transactions/recent', {
    params: { limit },
  });
  return response.data;
}
