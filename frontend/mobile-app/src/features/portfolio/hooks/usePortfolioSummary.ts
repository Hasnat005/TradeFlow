import { useQuery } from '@tanstack/react-query';

import { getPortfolioSummary } from '../api/getPortfolioSummary';

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: getPortfolioSummary,
  });
}
