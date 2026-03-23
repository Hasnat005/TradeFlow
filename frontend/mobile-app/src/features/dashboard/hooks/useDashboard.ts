import { useMutation, useQuery } from '@tanstack/react-query';

import { getDashboardSummary, getRecentTransactions } from '../../../services/dashboardApi';
import { queryClient } from '../../../services/queryClient';
import { DashboardActivity, DashboardSummary } from '../types';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
  activity: (limit: number) => ['dashboard', 'activity', limit] as const,
};

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: async () => {
      const response = await getDashboardSummary();
      return response.data as DashboardSummary;
    },
  });
}

export function useRecentTransactionsQuery(limit = 12) {
  return useQuery({
    queryKey: dashboardQueryKeys.activity(limit),
    queryFn: async () => {
      const response = await getRecentTransactions(limit);
      return response.data as DashboardActivity[];
    },
  });
}

export function useRefreshDashboardMutation(limit = 12) {
  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.activity(limit) }),
      ]);
    },
  });
}
