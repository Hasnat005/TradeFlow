import { randomUUID } from 'crypto';

import { pgPool } from '../config/postgres';

export type FinancingStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid';

export type InvoiceRecord = {
  id: string;
  company_id: string;
  buyer_name: string;
  amount: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FinancingStatusEventRecord = {
  id: string;
  financing_request_id: string;
  status: FinancingStatus;
  changed_at: string;
};

export type FinancingRecord = {
  id: string;
  company_id: string;
  invoice_id: string;
  buyer_name: string;
  requested_amount: number;
  approved_amount: number | null;
  interest_rate: number | null;
  repayment_amount: number;
  amount_paid: number;
  status: FinancingStatus;
  disbursement_date: string | null;
  repayment_due_date: string | null;
  created_at: string;
  updated_at: string;
};

type CreateFinancingInput = {
  companyId: string;
  invoiceId: string;
  buyerName: string;
  requestedAmount: number;
  repaymentAmount: number;
  status: FinancingStatus;
};

type UpdateStatusInput = {
  id: string;
  companyId: string;
  status: FinancingStatus;
  approvedAmount?: number;
  interestRate?: number;
  repaymentAmount?: number;
  disbursementDate?: string;
  repaymentDueDate?: string;
  amountPaid?: number;
  financierOrgId?: string;
};

type ListFilter = {
  status?: FinancingStatus;
  search?: string;
};

const inMemoryStore: FinancingRecord[] = [];
const inMemoryInvoices: InvoiceRecord[] = [];
const inMemoryEvents: FinancingStatusEventRecord[] = [];

async function tableExists(tableName: string) {
  if (!pgPool) {
    return false;
  }

  const result = await pgPool.query<{ exists: boolean }>(
    `
    select to_regclass($1) is not null as exists
    `,
    [tableName],
  );

  return Boolean(result.rows[0]?.exists);
}

async function getAvailableColumns(tableName: string, columnNames: string[]) {
  if (!pgPool || columnNames.length === 0) {
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

export class FinancingRepository {
  async create(input: CreateFinancingInput) {
    if (!pgPool || !(await tableExists('financing_requests')) || !(await tableExists('financing_status_events'))) {
      const now = new Date().toISOString();
      const created: FinancingRecord = {
        id: randomUUID(),
        company_id: input.companyId,
        invoice_id: input.invoiceId,
        buyer_name: input.buyerName,
        requested_amount: input.requestedAmount,
        approved_amount: null,
        interest_rate: null,
        repayment_amount: input.repaymentAmount,
        amount_paid: 0,
        status: input.status,
        disbursement_date: null,
        repayment_due_date: null,
        created_at: now,
        updated_at: now,
      };

      inMemoryStore.unshift(created);
      inMemoryEvents.push({
        id: randomUUID(),
        financing_request_id: created.id,
        status: created.status,
        changed_at: now,
      });
      return created;
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const result = await client.query<FinancingRecord>(
        `
        insert into financing_requests (
          company_id,
          invoice_id,
          buyer_name,
          requested_amount,
          approved_amount,
          interest_rate,
          repayment_amount,
          amount_paid,
          status,
          disbursement_date,
          repayment_due_date
        )
        values ($1, $2, $3, $4, null, null, $5, 0, $6, null, null)
        returning *
        `,
        [input.companyId, input.invoiceId, input.buyerName, input.requestedAmount, input.repaymentAmount, input.status],
      );

      await client.query(
        `
        insert into financing_status_events (financing_request_id, status)
        values ($1, $2)
        `,
        [result.rows[0].id, result.rows[0].status],
      );

      await client.query('commit');
      return result.rows[0];
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAllByCompany(companyId: string, filter: ListFilter = {}) {
    const { status, search } = filter;

    if (!pgPool || !(await tableExists('financing_requests'))) {
      const query = search?.trim().toLowerCase();

      return inMemoryStore.filter(
        (entry) =>
          entry.company_id === companyId &&
          (!status || entry.status === status) &&
          (!query || entry.invoice_id.toLowerCase().includes(query) || entry.buyer_name.toLowerCase().includes(query)),
      );
    }

    const clauses = ['company_id = $1'];
    const values: string[] = [companyId];

    if (status) {
      clauses.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (search?.trim()) {
      clauses.push(`(invoice_id ilike $${values.length + 1} or buyer_name ilike $${values.length + 1})`);
      values.push(`%${search.trim()}%`);
    }

    const result = await pgPool.query<FinancingRecord>(
      `
      select *
      from financing_requests
      where ${clauses.join(' and ')}
      order by created_at desc
      `,
      values,
    );

    return result.rows;
  }

  async listInvoicesByCompany(companyId: string, search?: string) {
    if (!pgPool || !(await tableExists('invoices'))) {
      const query = search?.trim().toLowerCase();
      return inMemoryInvoices.filter(
        (invoice) =>
          invoice.company_id === companyId &&
          (!query || invoice.id.toLowerCase().includes(query) || invoice.buyer_name.toLowerCase().includes(query)),
      );
    }

    const clauses = ['company_id = $1'];
    const values: string[] = [companyId];

    if (search?.trim()) {
      clauses.push(`(id ilike $${values.length + 1} or buyer_name ilike $${values.length + 1})`);
      values.push(`%${search.trim()}%`);
    }

    const result = await pgPool.query<InvoiceRecord>(
      `
      select
        id,
        company_id,
        buyer_name,
        amount::float8 as amount,
        due_date::text as due_date,
        status,
        created_at::text as created_at,
        updated_at::text as updated_at
      from invoices
      where ${clauses.join(' and ')}
      order by created_at desc
      `,
      values,
    );

    return result.rows;
  }

  async findInvoiceById(invoiceId: string, companyId: string) {
    if (!pgPool || !(await tableExists('invoices'))) {
      return inMemoryInvoices.find((invoice) => invoice.id === invoiceId && invoice.company_id === companyId) ?? null;
    }

    const result = await pgPool.query<InvoiceRecord>(
      `
      select
        id,
        company_id,
        buyer_name,
        amount::float8 as amount,
        due_date::text as due_date,
        status,
        created_at::text as created_at,
        updated_at::text as updated_at
      from invoices
      where id = $1 and company_id = $2
      limit 1
      `,
      [invoiceId, companyId],
    );

    return result.rows[0] ?? null;
  }

  async hasActiveRequestForInvoice(invoiceId: string, companyId: string) {
    const activeStatuses: FinancingStatus[] = ['Pending', 'Under Review', 'Approved', 'Disbursed'];

    if (!pgPool || !(await tableExists('financing_requests'))) {
      return inMemoryStore.some(
        (entry) =>
          entry.invoice_id === invoiceId && entry.company_id === companyId && activeStatuses.includes(entry.status),
      );
    }

    const result = await pgPool.query<{ count: string }>(
      `
      select count(*)::text as count
      from financing_requests
      where invoice_id = $1
        and company_id = $2
        and status = any($3::text[])
      `,
      [invoiceId, companyId, activeStatuses],
    );

    return Number(result.rows[0]?.count ?? 0) > 0;
  }

  async getTimeline(financingRequestId: string) {
    if (!pgPool || !(await tableExists('financing_status_events'))) {
      return inMemoryEvents.filter((event) => event.financing_request_id === financingRequestId);
    }

    const result = await pgPool.query<FinancingStatusEventRecord>(
      `
      select
        id,
        financing_request_id,
        status,
        changed_at::text as changed_at
      from financing_status_events
      where financing_request_id = $1
      order by changed_at asc
      `,
      [financingRequestId],
    );

    return result.rows;
  }

  async getCompanyCreditLimit(companyId: string) {
    if (!pgPool || !(await tableExists('companies'))) {
      return 0;
    }

    const companyColumns = await getAvailableColumns('companies', ['credit_limit']);
    if (!companyColumns.has('credit_limit')) {
      return 0;
    }

    const result = await pgPool.query<{ credit_limit: string | number | null }>(
      `
      select credit_limit
      from companies
      where id = $1
      limit 1
      `,
      [companyId],
    );

    return Number(result.rows[0]?.credit_limit ?? 0);
  }

  async findById(id: string, companyId: string) {
    if (!pgPool || !(await tableExists('financing_requests'))) {
      return inMemoryStore.find((entry) => entry.id === id && entry.company_id === companyId) ?? null;
    }

    const result = await pgPool.query<FinancingRecord>(
      `
      select *
      from financing_requests
      where id = $1 and company_id = $2
      limit 1
      `,
      [id, companyId],
    );

    return result.rows[0] ?? null;
  }

  async updateStatus(input: UpdateStatusInput) {
    if (!pgPool || !(await tableExists('financing_requests')) || !(await tableExists('financing_status_events'))) {
      const target = inMemoryStore.find((entry) => entry.id === input.id && entry.company_id === input.companyId);

      if (!target) {
        return null;
      }

      target.status = input.status;
      target.updated_at = new Date().toISOString();
      target.approved_amount = input.approvedAmount ?? target.approved_amount;
      target.interest_rate = input.interestRate ?? target.interest_rate;
      target.repayment_amount = input.repaymentAmount ?? target.repayment_amount;
      target.disbursement_date = input.disbursementDate ?? target.disbursement_date;
      target.repayment_due_date = input.repaymentDueDate ?? target.repayment_due_date;
      if (input.status === 'Repaid') {
        target.amount_paid = input.amountPaid ?? target.repayment_amount;
      }

      inMemoryEvents.push({
        id: randomUUID(),
        financing_request_id: target.id,
        status: input.status,
        changed_at: target.updated_at,
      });

      return target;
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const result = await client.query<FinancingRecord>(
        `
        update financing_requests
        set
          status = $3,
          approved_amount = coalesce($4, approved_amount),
          interest_rate = coalesce($5, interest_rate),
          repayment_amount = coalesce($6, repayment_amount),
          disbursement_date = coalesce($7::date, disbursement_date),
          repayment_due_date = coalesce($8::date, repayment_due_date),
          amount_paid = case when $3 = 'Repaid' then coalesce($9, amount_paid) else amount_paid end,
          financier_org_id = coalesce($10, financier_org_id),
          updated_at = now()
        where id = $1 and company_id = $2
        returning *
        `,
        [
          input.id,
          input.companyId,
          input.status,
          input.approvedAmount ?? null,
          input.interestRate ?? null,
          input.repaymentAmount ?? null,
          input.disbursementDate ?? null,
          input.repaymentDueDate ?? null,
          input.amountPaid ?? null,
          input.financierOrgId ?? null,
        ],
      );

      const updated = result.rows[0] ?? null;

      if (!updated) {
        await client.query('rollback');
        return null;
      }

      await client.query(
        `
        insert into financing_status_events (financing_request_id, status)
        values ($1, $2)
        `,
        [updated.id, updated.status],
      );

      await client.query('commit');
      return updated;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
}
