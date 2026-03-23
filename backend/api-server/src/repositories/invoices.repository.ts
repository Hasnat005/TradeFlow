import { randomUUID } from 'crypto';

import { PoolClient } from 'pg';

import { pgPool } from '../config/postgres';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Financed' | 'Paid' | 'Overdue';

export type InvoiceItemRecord = {
  id: string;
  invoice_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceRecord = {
  id: string;
  company_id: string;
  buyer_name: string;
  purchase_order_id: string | null;
  po_number: string | null;
  total_amount: number;
  paid_amount: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  items: InvoiceItemRecord[];
};

export type InvoiceStatusEventRecord = {
  id: string;
  invoice_id: string;
  status: InvoiceStatus;
  changed_at: string;
};

export type InvoiceAlert = {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
};

type CreateInvoiceInput = {
  companyId: string;
  buyerName: string;
  purchaseOrderId?: string;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: InvoiceStatus;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type ListInvoicesFilter = {
  status?: InvoiceStatus;
  search?: string;
  from?: string;
  to?: string;
};

type UpdateInvoiceStatusInput = {
  id: string;
  companyId: string;
  status: InvoiceStatus;
  paidAmount?: number;
};

const inMemoryInvoices: InvoiceRecord[] = [];
const inMemoryEvents: InvoiceStatusEventRecord[] = [];

type InvoiceRow = Omit<InvoiceRecord, 'items'>;

function mapInMemoryInvoiceWithPo(invoice: InvoiceRecord) {
  return {
    ...invoice,
    po_number: null,
  };
}

async function getNextInvoiceId(client: PoolClient, companyId: string) {
  const result = await client.query<{ id: string }>(
    `
    select id
    from invoices
    where company_id = $1 and id like 'INV-%'
    order by created_at desc
    limit 1
    `,
    [companyId],
  );

  const latest = result.rows[0]?.id ?? 'INV-1000';
  const numeric = Number.parseInt(latest.replace('INV-', ''), 10);
  const next = Number.isFinite(numeric) ? numeric + 1 : 1001;

  return `INV-${next}`;
}

async function mapInvoiceWithItems(invoiceId: string, companyId: string) {
  if (!pgPool) {
    const inMemory = inMemoryInvoices.find((invoice) => invoice.id === invoiceId && invoice.company_id === companyId);
    return inMemory ? mapInMemoryInvoiceWithPo(inMemory) : null;
  }

  const invoiceResult = await pgPool.query<InvoiceRow>(
    `
    select
      i.id,
      i.company_id,
      i.buyer_name,
      i.purchase_order_id::text as purchase_order_id,
      po.po_number,
      i.total_amount::float8 as total_amount,
      i.paid_amount::float8 as paid_amount,
      i.issue_date::text as issue_date,
      i.due_date::text as due_date,
      i.status,
      i.created_at::text as created_at,
      i.updated_at::text as updated_at
    from invoices i
    left join purchase_orders po on po.id = i.purchase_order_id
    where i.id = $1 and i.company_id = $2
    limit 1
    `,
    [invoiceId, companyId],
  );

  const invoice = invoiceResult.rows[0];

  if (!invoice) {
    return null;
  }

  const itemsResult = await pgPool.query<InvoiceItemRecord>(
    `
    select id, invoice_id, item_name, quantity, unit_price::float8 as unit_price
    from invoice_items
    where invoice_id = $1
    order by id asc
    `,
    [invoiceId],
  );

  return {
    ...invoice,
    items: itemsResult.rows,
  };
}

export class InvoicesRepository {
  async markOverdueByCompany(companyId: string) {
    if (!pgPool) {
      const now = new Date().toISOString().slice(0, 10);
      const updated: string[] = [];

      inMemoryInvoices.forEach((invoice) => {
        if (
          invoice.company_id === companyId &&
          ['Draft', 'Sent', 'Financed'].includes(invoice.status) &&
          invoice.due_date < now
        ) {
          invoice.status = 'Overdue';
          invoice.updated_at = new Date().toISOString();
          updated.push(invoice.id);
        }
      });

      updated.forEach((invoiceId) => {
        inMemoryEvents.push({
          id: randomUUID(),
          invoice_id: invoiceId,
          status: 'Overdue',
          changed_at: new Date().toISOString(),
        });
      });

      return;
    }

    await pgPool.query(
      `
      with updated as (
        update invoices
        set status = 'Overdue',
            updated_at = now()
        where company_id = $1
          and status in ('Draft', 'Sent', 'Financed')
          and due_date < current_date
        returning id
      )
      insert into invoice_status_events (invoice_id, status)
      select updated.id, 'Overdue'
      from updated
      where not exists (
        select 1
        from invoice_status_events e
        where e.invoice_id = updated.id
          and e.status = 'Overdue'
      )
      `,
      [companyId],
    );
  }

  async create(input: CreateInvoiceInput) {
    if (!pgPool) {
      const now = new Date().toISOString();
      const invoiceId = `INV-${1000 + inMemoryInvoices.length + 1}`;
      const items: InvoiceItemRecord[] = input.items.map((item) => ({
        id: randomUUID(),
        invoice_id: invoiceId,
        item_name: item.itemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const created: InvoiceRecord = {
        id: invoiceId,
        company_id: input.companyId,
        buyer_name: input.buyerName,
        purchase_order_id: input.purchaseOrderId ?? null,
        po_number: null,
        total_amount: input.totalAmount,
        paid_amount: 0,
        issue_date: input.issueDate,
        due_date: input.dueDate,
        status: input.status,
        created_at: now,
        updated_at: now,
        items,
      };

      inMemoryInvoices.unshift(created);
      inMemoryEvents.push({
        id: randomUUID(),
        invoice_id: created.id,
        status: created.status,
        changed_at: now,
      });

      return created;
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const invoiceId = await getNextInvoiceId(client, input.companyId);

      await client.query(
        `
        insert into invoices (
          id,
          company_id,
          buyer_name,
          purchase_order_id,
          amount,
          total_amount,
          paid_amount,
          issue_date,
          due_date,
          status
        )
        values ($1, $2, $3, $4, $5, $5, 0, $6, $7, $8)
        `,
        [
          invoiceId,
          input.companyId,
          input.buyerName,
          input.purchaseOrderId ?? null,
          input.totalAmount,
          input.issueDate,
          input.dueDate,
          input.status,
        ],
      );

      for (const item of input.items) {
        await client.query(
          `
          insert into invoice_items (invoice_id, item_name, quantity, unit_price)
          values ($1, $2, $3, $4)
          `,
          [invoiceId, item.itemName, item.quantity, item.unitPrice],
        );
      }

      await client.query(
        `
        insert into invoice_status_events (invoice_id, status)
        values ($1, $2)
        `,
        [invoiceId, input.status],
      );

      await client.query('commit');

      const created = await mapInvoiceWithItems(invoiceId, input.companyId);
      if (!created) {
        throw new Error('Invoice created but cannot be fetched');
      }

      return created;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async hasDuplicateForPurchaseOrder(companyId: string, purchaseOrderId: string) {
    if (!pgPool) {
      return inMemoryInvoices.some(
        (invoice) => invoice.company_id === companyId && invoice.purchase_order_id === purchaseOrderId,
      );
    }

    const result = await pgPool.query<{ count: string }>(
      `
      select count(*)::text as count
      from invoices
      where company_id = $1 and purchase_order_id = $2
      `,
      [companyId, purchaseOrderId],
    );

    return Number(result.rows[0]?.count ?? 0) > 0;
  }

  async findAllByCompany(companyId: string, filter: ListInvoicesFilter = {}) {
    const { status, search, from, to } = filter;

    if (!pgPool) {
      const query = search?.trim().toLowerCase();

      return inMemoryInvoices
        .filter((invoice) => {
          const statusMatch = !status || invoice.status === status;
          const searchMatch =
            !query || invoice.id.toLowerCase().includes(query) || invoice.buyer_name.toLowerCase().includes(query);
          const fromMatch = !from || invoice.issue_date >= from;
          const toMatch = !to || invoice.issue_date <= to;
          return invoice.company_id === companyId && statusMatch && searchMatch && fromMatch && toMatch;
        })
        .map(mapInMemoryInvoiceWithPo);
    }

    const clauses = ['i.company_id = $1'];
    const values: string[] = [companyId];

    if (status) {
      clauses.push(`i.status = $${values.length + 1}`);
      values.push(status);
    }

    if (search?.trim()) {
      clauses.push(`(i.id ilike $${values.length + 1} or i.buyer_name ilike $${values.length + 1})`);
      values.push(`%${search.trim()}%`);
    }

    if (from) {
      clauses.push(`i.issue_date >= $${values.length + 1}::date`);
      values.push(from);
    }

    if (to) {
      clauses.push(`i.issue_date <= $${values.length + 1}::date`);
      values.push(to);
    }

    const result = await pgPool.query<InvoiceRow>(
      `
      select
        i.id,
        i.company_id,
        i.buyer_name,
        i.purchase_order_id::text as purchase_order_id,
        po.po_number,
        i.total_amount::float8 as total_amount,
        i.paid_amount::float8 as paid_amount,
        i.issue_date::text as issue_date,
        i.due_date::text as due_date,
        i.status,
        i.created_at::text as created_at,
        i.updated_at::text as updated_at
      from invoices i
      left join purchase_orders po on po.id = i.purchase_order_id
      where ${clauses.join(' and ')}
      order by i.created_at desc
      `,
      values,
    );

    return result.rows;
  }

  async findById(id: string, companyId: string) {
    return mapInvoiceWithItems(id, companyId);
  }

  async getTimeline(invoiceId: string) {
    if (!pgPool) {
      return inMemoryEvents.filter((event) => event.invoice_id === invoiceId);
    }

    const result = await pgPool.query<InvoiceStatusEventRecord>(
      `
      select id, invoice_id, status, changed_at::text as changed_at
      from invoice_status_events
      where invoice_id = $1
      order by changed_at asc
      `,
      [invoiceId],
    );

    return result.rows;
  }

  async updateStatus(input: UpdateInvoiceStatusInput) {
    if (!pgPool) {
      const target = inMemoryInvoices.find((invoice) => invoice.id === input.id && invoice.company_id === input.companyId);
      if (!target) {
        return null;
      }

      target.status = input.status;
      target.paid_amount = input.paidAmount ?? target.paid_amount;
      target.updated_at = new Date().toISOString();

      inMemoryEvents.push({
        id: randomUUID(),
        invoice_id: target.id,
        status: input.status,
        changed_at: target.updated_at,
      });

      return mapInMemoryInvoiceWithPo(target);
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const updateResult = await client.query<{ id: string }>(
        `
        update invoices
        set
          status = $3,
          paid_amount = coalesce($4, paid_amount),
          updated_at = now()
        where id = $1 and company_id = $2
        returning id
        `,
        [input.id, input.companyId, input.status, input.paidAmount ?? null],
      );

      const updatedId = updateResult.rows[0]?.id;

      if (!updatedId) {
        await client.query('rollback');
        return null;
      }

      const result = await client.query<InvoiceRow>(
        `
        select
          i.id,
          i.company_id,
          i.buyer_name,
          i.purchase_order_id::text as purchase_order_id,
          po.po_number,
          i.total_amount::float8 as total_amount,
          i.paid_amount::float8 as paid_amount,
          i.issue_date::text as issue_date,
          i.due_date::text as due_date,
          i.status,
          i.created_at::text as created_at,
          i.updated_at::text as updated_at
        from invoices i
        left join purchase_orders po on po.id = i.purchase_order_id
        where i.id = $1 and i.company_id = $2
        limit 1
        `,
        [input.id, input.companyId],
      );

      const updated = result.rows[0] ?? null;

      if (!updated) {
        await client.query('rollback');
        return null;
      }

      await client.query(
        `
        insert into invoice_status_events (invoice_id, status)
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

  async findOrderById(orderId: string, companyId: string) {
    if (!pgPool) {
      return null;
    }

    const orderResult = await pgPool.query<{
      id: string;
      company_id: string;
      po_number: string;
      supplier_name: string;
      status: string;
    }>(
      `
      select id::text, company_id, po_number, supplier_name, status
      from purchase_orders
      where id = $1 and company_id = $2
      limit 1
      `,
      [orderId, companyId],
    );

    const order = orderResult.rows[0];
    if (!order) {
      return null;
    }

    const itemsResult = await pgPool.query<{
      id: string;
      item_name: string;
      quantity: number;
      unit_price: number;
    }>(
      `
      select id::text, item_name, quantity, unit_price::float8 as unit_price
      from order_items
      where order_id = $1
      order by id asc
      `,
      [orderId],
    );

    return {
      ...order,
      items: itemsResult.rows,
    };
  }

  async linkOrderToInvoice(orderId: string, companyId: string, invoiceId: string) {
    if (!pgPool) {
      return;
    }

    await pgPool.query(
      `
      update purchase_orders
      set linked_invoice_id = $3,
          updated_at = now()
      where id = $1 and company_id = $2
      `,
      [orderId, companyId, invoiceId],
    );
  }
}
