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
  private async getAvailableTables(tableNames: string[]) {
    if (!pgPool || tableNames.length === 0) {
      return new Set<string>();
    }

    const result = await pgPool.query<{ table_name: string }>(
      `
      select table_name
      from unnest($1::text[]) as table_name
      where to_regclass(table_name) is not null
      `,
      [tableNames],
    );

    return new Set(result.rows.map((row) => row.table_name));
  }

  private async getAvailableColumns(tableName: string, columnNames: string[]) {
    if (!pgPool || !tableName || columnNames.length === 0) {
      return new Set<string>();
    }

    const result = await pgPool.query<{ column_name: string }>(
      `
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
        and column_name = any($2::text[])
      `,
      [tableName, columnNames],
    );

    return new Set(result.rows.map((row) => row.column_name));
  }

  async getSummary(companyId: string): Promise<DashboardSummary> {
    if (!pgPool) {
      return emptySummary;
    }

    const tables = await this.getAvailableTables([
      'ledger_entries',
      'invoices',
      'financing_requests',
      'transactions',
      'companies',
    ]);

    const hasLedgerEntries = tables.has('ledger_entries');
    const hasInvoices = tables.has('invoices');
    const hasFinancingRequests = tables.has('financing_requests');
    const hasTransactions = tables.has('transactions');
    const hasCompanies = tables.has('companies');

    const invoiceColumns = hasInvoices
      ? await this.getAvailableColumns('invoices', ['amount', 'total_amount', 'paid_amount', 'status', 'due_date'])
      : new Set<string>();
    const financingColumns = hasFinancingRequests
      ? await this.getAvailableColumns('financing_requests', ['approved_amount', 'requested_amount', 'amount_paid', 'status'])
      : new Set<string>();
    const companyColumns = hasCompanies
      ? await this.getAvailableColumns('companies', ['credit_limit'])
      : new Set<string>();

    const hasInvoiceAmount = invoiceColumns.has('amount');
    const hasInvoiceTotalAmount = invoiceColumns.has('total_amount');
    const hasInvoicePaidAmount = invoiceColumns.has('paid_amount');
    const hasInvoiceStatus = invoiceColumns.has('status');
    const hasInvoiceDueDate = invoiceColumns.has('due_date');

    const invoiceAmountExpr = hasInvoiceTotalAmount
      ? hasInvoicePaidAmount
        ? `greatest(coalesce(total_amount, 0) - coalesce(paid_amount, 0), 0)`
        : `coalesce(total_amount, 0)`
      : hasInvoiceAmount
        ? `coalesce(amount, 0)`
        : `0`;

    const invoicePendingFilter = hasInvoiceStatus
      ? `status in ('Draft', 'Sent', 'Overdue', 'Pending')`
      : `true`;
    const invoiceOverdueFilter = hasInvoiceStatus ? `status = 'Overdue'` : `false`;
    const invoicePendingPaymentsFilter = hasInvoiceDueDate
      ? hasInvoiceStatus
        ? `(status = 'Overdue' or due_date <= current_date)`
        : `(due_date <= current_date)`
      : `false`;
    const invoiceDueTodayFilter = hasInvoiceDueDate
      ? hasInvoiceStatus
        ? `(due_date = current_date and status <> 'Paid')`
        : `(due_date = current_date)`
      : `false`;
    const invoiceUnpaidFilter = hasInvoiceStatus ? `status <> 'Paid'` : `true`;

    const hasApprovedAmount = financingColumns.has('approved_amount');
    const hasRequestedAmount = financingColumns.has('requested_amount');
    const hasAmountPaid = financingColumns.has('amount_paid');
    const hasFinancingStatus = financingColumns.has('status');

    const financingPrincipalExpr = hasApprovedAmount && hasRequestedAmount
      ? `coalesce(approved_amount, requested_amount, 0)`
      : hasApprovedAmount
        ? `coalesce(approved_amount, 0)`
        : hasRequestedAmount
          ? `coalesce(requested_amount, 0)`
          : `0`;
    const financingOpenAmountExpr = hasAmountPaid
      ? `greatest(${financingPrincipalExpr} - coalesce(amount_paid, 0), 0)`
      : financingPrincipalExpr;
    const financingActiveFilter = hasFinancingStatus
      ? `status in ('Approved', 'Disbursed')`
      : `true`;

    const companyCreditLimitExpr = companyColumns.has('credit_limit')
      ? `coalesce(credit_limit, 0)::float8`
      : `0::float8`;

    const result = await pgPool.query<DashboardSummaryRow>(
      `
      with ledger_stats as (
        ${
          hasLedgerEntries
            ? `select coalesce(sum(case when entry_type = 'credit' then amount else -amount end), 0)::float8 as available_balance
               from ledger_entries
               where company_id = $1`
            : `select 0::float8 as available_balance`
        }
      ),
      invoice_stats as (
        ${
          hasInvoices
            ? `select
                 coalesce(sum(${invoiceAmountExpr}) filter (where ${invoicePendingFilter}), 0)::float8 as outstanding_invoices_amount,
                 coalesce(sum(${invoiceAmountExpr}) filter (where ${invoicePendingPaymentsFilter}), 0)::float8 as pending_payments_amount,
                 count(*) filter (where ${invoicePendingFilter})::int as pending_invoices_count,
                 count(*) filter (where ${invoiceOverdueFilter})::int as overdue_invoices_count,
                 count(*) filter (where ${invoiceDueTodayFilter})::int as payments_due_today_count,
                 count(*) filter (where ${invoicePendingPaymentsFilter} and ${invoiceUnpaidFilter})::int as pending_payments_count
               from invoices
               where company_id = $1`
            : `select
                 0::float8 as outstanding_invoices_amount,
                 0::float8 as pending_payments_amount,
                 0::int as pending_invoices_count,
                 0::int as overdue_invoices_count,
                 0::int as payments_due_today_count,
                 0::int as pending_payments_count`
        }
      ),
      financing_stats as (
        ${
          hasFinancingRequests
            ? `select
                 coalesce(sum(${financingOpenAmountExpr}) filter (where ${financingActiveFilter}), 0)::float8 as active_financing_amount,
                 coalesce(sum(${financingOpenAmountExpr}) filter (where ${financingActiveFilter}), 0)::float8 as used_credit,
                 count(*) filter (where ${financingActiveFilter})::int as active_facilities_count
               from financing_requests
               where company_id = $1`
            : `select
                 0::float8 as active_financing_amount,
                 0::float8 as used_credit,
                 0::int as active_facilities_count`
        }
      ),
      transaction_stats as (
        ${
          hasTransactions
            ? `select count(*)::int as total_transactions
               from transactions
               where company_id = $1`
            : `select 0::int as total_transactions`
        }
      ),
      company_stats as (
        ${
          hasCompanies
            ? `select ${companyCreditLimitExpr} as credit_limit
               from companies
               where id = $1
               limit 1`
            : `select 0::float8 as credit_limit`
        }
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

    const tables = await this.getAvailableTables([
      'transactions',
      'invoice_status_events',
      'invoices',
      'financing_status_events',
      'financing_requests',
    ]);

    const feeds: string[] = [];
    if (tables.has('transactions')) {
      feeds.push('select * from transaction_feed');
    }
    if (tables.has('invoice_status_events') && tables.has('invoices')) {
      feeds.push('select * from invoice_feed');
    }
    if (tables.has('financing_status_events') && tables.has('financing_requests')) {
      feeds.push('select * from financing_feed');
    }

    if (feeds.length === 0) {
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
        ${feeds.join('\n        union all\n        ')}
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
