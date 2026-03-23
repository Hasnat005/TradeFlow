alter table if exists invoices
  add column if not exists purchase_order_id uuid references purchase_orders(id) on delete set null,
  add column if not exists total_amount numeric(14, 2),
  add column if not exists issue_date date default current_date,
  add column if not exists paid_amount numeric(14, 2) not null default 0;

update invoices
set total_amount = coalesce(total_amount, amount)
where total_amount is null;

alter table if exists invoices
  alter column total_amount set not null;

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id text not null references invoices(id) on delete cascade,
  item_name text not null,
  quantity numeric(14, 2) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price > 0),
  created_at timestamptz not null default now()
);

create table if not exists invoice_status_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id text not null references invoices(id) on delete cascade,
  status text not null check (status in ('Draft', 'Sent', 'Financed', 'Paid', 'Overdue')),
  changed_at timestamptz not null default now()
);

create unique index if not exists ux_invoices_company_purchase_order
  on invoices(company_id, purchase_order_id)
  where purchase_order_id is not null;

create index if not exists idx_invoice_items_invoice_id
  on invoice_items(invoice_id);

create index if not exists idx_invoice_status_events_invoice_id
  on invoice_status_events(invoice_id, changed_at asc);

create index if not exists idx_invoices_company_status_due_date
  on invoices(company_id, status, due_date);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'invoices_status_check'
  ) then
    alter table invoices drop constraint invoices_status_check;
  end if;

  alter table invoices
    add constraint invoices_status_check
    check (status in ('Draft', 'Sent', 'Financed', 'Paid', 'Overdue'));
end $$;
