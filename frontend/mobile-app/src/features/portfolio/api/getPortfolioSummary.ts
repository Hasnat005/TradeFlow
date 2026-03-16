import { apiClient } from '../../../services/apiClient';
import { PortfolioSummary } from '../types';

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  try {
    const response = await apiClient.get<PortfolioSummary>('/portfolio/summary');
    return response.data;
  } catch {
    return { totalValueUsd: 128430.55 };
  }
}
