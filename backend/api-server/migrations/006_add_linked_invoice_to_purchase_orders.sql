alter table if exists purchase_orders
  add column if not exists linked_invoice_id text;
