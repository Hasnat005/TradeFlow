create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  po_number text not null,
  supplier_name text not null,
  total_amount numeric(14, 2) not null check (total_amount >= 0),
  status text not null check (status in ('Draft', 'Sent', 'Accepted', 'Rejected', 'Delivered', 'Completed')),
  expected_delivery_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, po_number)
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references purchase_orders(id) on delete cascade,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price > 0)
);

create index if not exists idx_purchase_orders_company_created_at
  on purchase_orders(company_id, created_at desc);

create index if not exists idx_order_items_order_id
  on order_items(order_id);
