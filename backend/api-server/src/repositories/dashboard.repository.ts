import { pgPool } from '../config/postgres';

type DashboardSummaryRow = {
  available_balance: number;
  outstanding_invoices_amount: number;
  active_financing_amount: number;
  pending_payments_amount: number;
  total_transactions: number;
  credit_limit: number;
  used_credit: number;
  pending_invoices_count: number;
  active_facilities_count: number;
  pending_payments_count: number;
  overdue_invoices_count: number;
  payments_due_today_count: number;
};

export type DashboardSummary = {
  available_balance: number;
  outstanding_invoices_amount: number;
  active_financing_amount: number;
  pending_payments_amount: number;
  total_transactions: number;
  credit_limit: number;
  used_credit: number;
  pending_invoices_count: number;
  active_facilities_count: number;
  pending_payments_count: number;
  overdue_invoices_count: number;
  payments_due_today_count: number;
};

export type RecentTransaction = {
  id: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  source: 'transaction' | 'invoice' | 'financing';
};

const emptySummary: DashboardSummary = {
  available_balance: 0,
  outstanding_invoices_amount: 0,
  active_financing_amount: 0,
  pending_payments_amount: 0,
  total_transactions: 0,
  credit_limit: 0,
  used_credit: 0,
  pending_invoices_count: 0,
  active_facilities_count: 0,
  pending_payments_count: 0,
  overdue_invoices_count: 0,
  payments_due_today_count: 0,
};

export class DashboardRepository {
  async getSummary(companyId: string): Promise<DashboardSummary> {
    if (!pgPool) {
      return emptySummary;
    }

    const result = await pgPool.query<DashboardSummaryRow>(
      `
      with ledger_stats as (
        select coalesce(sum(case when entry_type = 'credit' then amount else -amount end), 0)::float8 as available_balance
        from ledger_entries
        where company_id = $1
      ),
      invoice_stats as (
        select
          coalesce(sum(greatest(total_amount - paid_amount, 0)) filter (where status in ('Draft', 'Sent', 'Overdue')), 0)::float8 as outstanding_invoices_amount,
          coalesce(sum(greatest(total_amount - paid_amount, 0)) filter (where status = 'Overdue' or due_date <= current_date), 0)::float8 as pending_payments_amount,
          count(*) filter (where status in ('Draft', 'Sent', 'Overdue'))::int as pending_invoices_count,
          count(*) filter (where status = 'Overdue')::int as overdue_invoices_count,
          count(*) filter (where due_date = current_date and status <> 'Paid')::int as payments_due_today_count,
          count(*) filter (where (status = 'Overdue' or due_date <= current_date) and status <> 'Paid')::int as pending_payments_count
        from invoices
        where company_id = $1
      ),
      financing_stats as (
        select
          coalesce(sum(greatest(coalesce(approved_amount, requested_amount) - amount_paid, 0)) filter (where status in ('Approved', 'Disbursed')), 0)::float8 as active_financing_amount,
          coalesce(sum(greatest(coalesce(approved_amount, requested_amount) - amount_paid, 0)) filter (where status in ('Approved', 'Disbursed')), 0)::float8 as used_credit,
          count(*) filter (where status in ('Approved', 'Disbursed'))::int as active_facilities_count
        from financing_requests
        where company_id = $1
      ),
      transaction_stats as (
        select count(*)::int as total_transactions
        from transactions
        where company_id = $1
      ),
      company_stats as (
        select coalesce(credit_limit, 0)::float8 as credit_limit
        from companies
        where id = $1
        limit 1
      )
      select
        coalesce((select available_balance from ledger_stats), 0)::float8 as available_balance,
        coalesce((select outstanding_invoices_amount from invoice_stats), 0)::float8 as outstanding_invoices_amount,
        coalesce((select active_financing_amount from financing_stats), 0)::float8 as active_financing_amount,
        coalesce((select pending_payments_amount from invoice_stats), 0)::float8 as pending_payments_amount,
        coalesce((select total_transactions from transaction_stats), 0)::int as total_transactions,
        coalesce((select credit_limit from company_stats), 0)::float8 as credit_limit,
        coalesce((select used_credit from financing_stats), 0)::float8 as used_credit,
        coalesce((select pending_invoices_count from invoice_stats), 0)::int as pending_invoices_count,
        coalesce((select active_facilities_count from financing_stats), 0)::int as active_facilities_count,
        coalesce((select pending_payments_count from invoice_stats), 0)::int as pending_payments_count,
        coalesce((select overdue_invoices_count from invoice_stats), 0)::int as overdue_invoices_count,
        coalesce((select payments_due_today_count from invoice_stats), 0)::int as payments_due_today_count
      `,
      [companyId],
    );

    return result.rows[0] ?? emptySummary;
  }

  async getRecentTransactions(companyId: string, limit: number): Promise<RecentTransaction[]> {
    if (!pgPool) {
      return [];
    }

    const result = await pgPool.query<RecentTransaction>(
      `
      with transaction_feed as (
        select
          'tx-' || t.id::text as id,
          coalesce(t.title, 'Transaction update') as title,
          coalesce(t.description, 'A transaction was recorded') as description,
          t.amount::float8 as amount,
          t.created_at::text as timestamp,
          case
            when t.status in ('failed', 'reversed') then 'danger'
            when t.status in ('pending') then 'warning'
            when t.status in ('settled', 'completed') then 'success'
            else 'info'
          end as status,
          'transaction'::text as source
        from transactions t
        where t.company_id = $1
      ),
      invoice_feed as (
        select
          'inv-' || ise.id::text as id,
          'Invoice ' || i.id || ' updated' as title,
          'Status changed to ' || ise.status as description,
          greatest(i.total_amount - i.paid_amount, 0)::float8 as amount,
          ise.changed_at::text as timestamp,
          case
            when ise.status = 'Overdue' then 'danger'
            when ise.status = 'Paid' then 'success'
            else 'info'
          end as status,
          'invoice'::text as source
        from invoice_status_events ise
        join invoices i on i.id = ise.invoice_id
        where i.company_id = $1
      ),
      financing_feed as (
        select
          'fin-' || fse.id::text as id,
          'Financing request updated' as title,
          'Request ' || fr.id::text || ' moved to ' || fse.status as description,
          coalesce(fr.approved_amount, fr.requested_amount)::float8 as amount,
          fse.changed_at::text as timestamp,
          case
            when fse.status = 'Rejected' then 'danger'
            when fse.status in ('Pending', 'Under Review') then 'warning'
            when fse.status in ('Approved', 'Disbursed', 'Repaid') then 'success'
            else 'info'
          end as status,
          'financing'::text as source
        from financing_status_events fse
        join financing_requests fr on fr.id = fse.financing_request_id
        where fr.company_id = $1
      )
      select
        feed.id,
        feed.title,
        feed.description,
        feed.amount,
        feed.timestamp,
        feed.status::text as status,
        feed.source::text as source
      from (
        select * from transaction_feed
        union all
        select * from invoice_feed
        union all
        select * from financing_feed
      ) feed
      order by feed.timestamp desc
      limit $2
      `,
      [companyId, limit],
    );

    return result.rows.map((entry) => ({
      ...entry,
      amount: entry.amount ?? undefined,
      status: entry.status as RecentTransaction['status'],
      source: entry.source as RecentTransaction['source'],
    }));
  }
}
