import { DashboardRepository } from '../repositories/dashboard.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getSummary(auth: AuthContext) {
    const summary = await this.dashboardRepository.getSummary(auth.companyId);

    const availableCredit = Math.max(0, summary.credit_limit - summary.used_credit);
    const usedPercent = summary.credit_limit > 0 ? Math.round((summary.used_credit / summary.credit_limit) * 100) : 0;

    const alerts: Array<{
      id: string;
      title: string;
      description: string;
      tone: 'urgent' | 'warning' | 'good';
    }> = [];

    if (summary.overdue_invoices_count > 0) {
      alerts.push({
        id: 'overdue',
        title: `${summary.overdue_invoices_count} invoices overdue`,
        description: 'Immediate follow-up required to protect cash flow.',
        tone: 'urgent',
      });
    }

    if (summary.payments_due_today_count > 0) {
      alerts.push({
        id: 'due-today',
        title: 'Payments due today',
        description: `${summary.payments_due_today_count} invoice payments are due today.`,
        tone: 'warning',
      });
    }

    if (usedPercent >= 85) {
      alerts.push({
        id: 'credit-limit',
        title: 'Credit limit almost reached',
        description: `${usedPercent}% of credit line is currently utilized.`,
        tone: 'urgent',
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'healthy',
        title: 'Cashflow looks healthy',
        description: 'No urgent risk signals detected right now.',
        tone: 'good',
      });
    }

    return {
      ...summary,
      available_credit: availableCredit,
      used_credit_percent: usedPercent,
      alerts,
    };
  }

  async getRecentTransactions(auth: AuthContext, limit: number) {
    return this.dashboardRepository.getRecentTransactions(auth.companyId, limit);
  }
}
