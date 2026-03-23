export type AlertTone = 'urgent' | 'warning' | 'good';

export type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  tone: AlertTone;
};

export type DashboardSummary = {
  available_balance: number;
  outstanding_invoices_amount: number;
  active_financing_amount: number;
  pending_payments_amount: number;
  total_transactions: number;
  credit_limit: number;
  used_credit: number;
  available_credit: number;
  used_credit_percent: number;
  pending_invoices_count: number;
  active_facilities_count: number;
  pending_payments_count: number;
  overdue_invoices_count: number;
  payments_due_today_count: number;
  alerts: DashboardAlert[];
};

export type ActivityStatus = 'success' | 'warning' | 'danger' | 'info';

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: ActivityStatus;
  source: 'transaction' | 'invoice' | 'financing';
};
