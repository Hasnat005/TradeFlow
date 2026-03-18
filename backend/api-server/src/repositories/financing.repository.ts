import { randomUUID } from 'crypto';

import { pgPool } from '../config/postgres';

export type FinancingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid';

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
  created_at: string;
  updated_at: string;
};

type CreateFinancingInput = {
  companyId: string;
  invoiceId: string;
  buyerName: string;
  requestedAmount: number;
  repaymentAmount: number;
};

type UpdateStatusInput = {
  id: string;
  companyId: string;
  status: FinancingStatus;
  approvedAmount?: number;
  interestRate?: number;
  repaymentAmount?: number;
};

const inMemoryStore: FinancingRecord[] = [];

export class FinancingRepository {
  async create(input: CreateFinancingInput) {
    if (!pgPool) {
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
        status: 'Pending',
        created_at: now,
        updated_at: now,
      };

      inMemoryStore.unshift(created);
      return created;
    }

    const result = await pgPool.query<FinancingRecord>(
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
        status
      )
      values ($1, $2, $3, $4, null, null, $5, 0, 'Pending')
      returning *
      `,
      [input.companyId, input.invoiceId, input.buyerName, input.requestedAmount, input.repaymentAmount],
    );

    return result.rows[0];
  }

  async findAllByCompany(companyId: string, status?: FinancingStatus) {
    if (!pgPool) {
      return inMemoryStore.filter(
        (entry) => entry.company_id === companyId && (!status || entry.status === status),
      );
    }

    const hasStatus = Boolean(status);
    const result = await pgPool.query<FinancingRecord>(
      `
      select *
      from financing_requests
      where company_id = $1
      ${hasStatus ? 'and status = $2' : ''}
      order by created_at desc
      `,
      hasStatus ? [companyId, status] : [companyId],
    );

    return result.rows;
  }

  async findById(id: string, companyId: string) {
    if (!pgPool) {
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
    if (!pgPool) {
      const target = inMemoryStore.find((entry) => entry.id === input.id && entry.company_id === input.companyId);

      if (!target) {
        return null;
      }

      target.status = input.status;
      target.updated_at = new Date().toISOString();
      target.approved_amount = input.approvedAmount ?? target.approved_amount;
      target.interest_rate = input.interestRate ?? target.interest_rate;
      target.repayment_amount = input.repaymentAmount ?? target.repayment_amount;
      if (input.status === 'Repaid') {
        target.amount_paid = target.repayment_amount;
      }

      return target;
    }

    const result = await pgPool.query<FinancingRecord>(
      `
      update financing_requests
      set
        status = $3,
        approved_amount = coalesce($4, approved_amount),
        interest_rate = coalesce($5, interest_rate),
        repayment_amount = coalesce($6, repayment_amount),
        amount_paid = case when $3 = 'Repaid' then coalesce($6, repayment_amount) else amount_paid end,
        updated_at = now()
      where id = $1 and company_id = $2
      returning *
      `,
      [input.id, input.companyId, input.status, input.approvedAmount ?? null, input.interestRate ?? null, input.repaymentAmount ?? null],
    );

    return result.rows[0] ?? null;
  }
}
