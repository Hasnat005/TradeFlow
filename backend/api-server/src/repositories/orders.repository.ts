import { randomUUID } from 'crypto';

import { PoolClient } from 'pg';

import { pgPool } from '../config/postgres';

export type OrderStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Completed';

export type OrderItemRecord = {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type PurchaseOrderRecord = {
  id: string;
  company_id: string;
  po_number: string;
  supplier_name: string;
  total_amount: number;
  status: OrderStatus;
  expected_delivery_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemRecord[];
};

type CreateOrderInput = {
  companyId: string;
  supplierName: string;
  expectedDeliveryDate: string;
  notes?: string;
  status: OrderStatus;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type UpdateOrderInput = {
  id: string;
  companyId: string;
  supplierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items?: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type UpdateOrderStatusInput = {
  id: string;
  companyId: string;
  status: OrderStatus;
};

const inMemoryOrders: PurchaseOrderRecord[] = [];

function calculateTotal(
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>,
) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

async function getNextPoNumber(client: PoolClient, companyId: string) {
  const result = await client.query<{ po_number: string }>(
    `
    select po_number
    from purchase_orders
    where company_id = $1
    order by created_at desc
    limit 1
    `,
    [companyId],
  );

  const latest = result.rows[0]?.po_number ?? 'PO-1000';
  const numeric = Number.parseInt(latest.replace('PO-', ''), 10);
  const next = Number.isFinite(numeric) ? numeric + 1 : 1001;

  return `PO-${next}`;
}

async function mapOrderWithItems(orderId: string, companyId: string) {
  if (!pgPool) {
    return inMemoryOrders.find((order) => order.id === orderId && order.company_id === companyId) ?? null;
  }

  const orderResult = await pgPool.query<
    Omit<PurchaseOrderRecord, 'items'>
  >(
    `
    select id, company_id, po_number, supplier_name, total_amount::float8 as total_amount,
           status, expected_delivery_date::text as expected_delivery_date,
           notes, created_at::text as created_at, updated_at::text as updated_at
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

  const itemsResult = await pgPool.query<OrderItemRecord>(
    `
    select id, order_id, item_name, quantity, unit_price::float8 as unit_price
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

export class OrdersRepository {
  async create(input: CreateOrderInput) {
    if (!pgPool) {
      const now = new Date().toISOString();
      const poNumber = `PO-${1000 + inMemoryOrders.length + 1}`;
      const orderId = randomUUID();
      const items: OrderItemRecord[] = input.items.map((item) => ({
        id: randomUUID(),
        order_id: orderId,
        item_name: item.itemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const created: PurchaseOrderRecord = {
        id: orderId,
        company_id: input.companyId,
        po_number: poNumber,
        supplier_name: input.supplierName,
        total_amount: calculateTotal(input.items),
        status: input.status,
        expected_delivery_date: input.expectedDeliveryDate,
        notes: input.notes ?? null,
        created_at: now,
        updated_at: now,
        items,
      };

      inMemoryOrders.unshift(created);
      return created;
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const poNumber = await getNextPoNumber(client, input.companyId);
      const totalAmount = calculateTotal(input.items);

      const orderResult = await client.query<{ id: string }>(
        `
        insert into purchase_orders (
          company_id,
          po_number,
          supplier_name,
          total_amount,
          status,
          expected_delivery_date,
          notes
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        returning id
        `,
        [
          input.companyId,
          poNumber,
          input.supplierName,
          totalAmount,
          input.status,
          input.expectedDeliveryDate,
          input.notes ?? null,
        ],
      );

      const orderId = orderResult.rows[0].id;

      for (const item of input.items) {
        await client.query(
          `
          insert into order_items (order_id, item_name, quantity, unit_price)
          values ($1, $2, $3, $4)
          `,
          [orderId, item.itemName, item.quantity, item.unitPrice],
        );
      }

      await client.query('commit');

      const created = await mapOrderWithItems(orderId, input.companyId);
      if (!created) {
        throw new Error('Order created but cannot be fetched');
      }

      return created;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAllByCompany(companyId: string, status?: OrderStatus) {
    if (!pgPool) {
      return inMemoryOrders.filter((order) => order.company_id === companyId && (!status || order.status === status));
    }

    const ordersResult = await pgPool.query<
      Omit<PurchaseOrderRecord, 'items'>
    >(
      `
      select id, company_id, po_number, supplier_name, total_amount::float8 as total_amount,
             status, expected_delivery_date::text as expected_delivery_date,
             notes, created_at::text as created_at, updated_at::text as updated_at
      from purchase_orders
      where company_id = $1
      ${status ? 'and status = $2' : ''}
      order by created_at desc
      `,
      status ? [companyId, status] : [companyId],
    );

    const orders: PurchaseOrderRecord[] = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pgPool.query<OrderItemRecord>(
        `
        select id, order_id, item_name, quantity, unit_price::float8 as unit_price
        from order_items
        where order_id = $1
        order by id asc
        `,
        [order.id],
      );

      orders.push({
        ...order,
        items: itemsResult.rows,
      });
    }

    return orders;
  }

  async findById(id: string, companyId: string) {
    return mapOrderWithItems(id, companyId);
  }

  async update(input: UpdateOrderInput) {
    if (!pgPool) {
      const target = inMemoryOrders.find((order) => order.id === input.id && order.company_id === input.companyId);
      if (!target) {
        return null;
      }

      if (input.supplierName) {
        target.supplier_name = input.supplierName;
      }
      if (input.expectedDeliveryDate) {
        target.expected_delivery_date = input.expectedDeliveryDate;
      }
      if (input.notes !== undefined) {
        target.notes = input.notes;
      }
      if (input.items) {
        target.items = input.items.map((item) => ({
          id: randomUUID(),
          order_id: target.id,
          item_name: item.itemName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }));
        target.total_amount = calculateTotal(input.items);
      }
      target.updated_at = new Date().toISOString();

      return target;
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const existing = await this.findById(input.id, input.companyId);
      if (!existing) {
        await client.query('rollback');
        return null;
      }

      const items = input.items ?? existing.items.map((item) => ({
        itemName: item.item_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      }));
      const totalAmount = calculateTotal(items);

      await client.query(
        `
        update purchase_orders
        set supplier_name = $3,
            expected_delivery_date = $4,
            notes = $5,
            total_amount = $6,
            updated_at = now()
        where id = $1 and company_id = $2
        `,
        [
          input.id,
          input.companyId,
          input.supplierName ?? existing.supplier_name,
          input.expectedDeliveryDate ?? existing.expected_delivery_date,
          input.notes ?? existing.notes,
          totalAmount,
        ],
      );

      if (input.items) {
        await client.query('delete from order_items where order_id = $1', [input.id]);
        for (const item of input.items) {
          await client.query(
            'insert into order_items (order_id, item_name, quantity, unit_price) values ($1, $2, $3, $4)',
            [input.id, item.itemName, item.quantity, item.unitPrice],
          );
        }
      }

      await client.query('commit');

      return this.findById(input.id, input.companyId);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(input: UpdateOrderStatusInput) {
    if (!pgPool) {
      const target = inMemoryOrders.find((order) => order.id === input.id && order.company_id === input.companyId);
      if (!target) {
        return null;
      }
      target.status = input.status;
      target.updated_at = new Date().toISOString();
      return target;
    }

    await pgPool.query(
      `
      update purchase_orders
      set status = $3,
          updated_at = now()
      where id = $1 and company_id = $2
      `,
      [input.id, input.companyId, input.status],
    );

    return this.findById(input.id, input.companyId);
  }
}
