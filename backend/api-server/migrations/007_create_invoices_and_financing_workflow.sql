create table if not exists invoices (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  buyer_name text not null,
  amount numeric(14, 2) not null check (amount > 0),
  due_date date,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_company_created_at
  on invoices(company_id, created_at desc);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financing_requests_invoice_id_fkey'
  ) then
    alter table financing_requests drop constraint financing_requests_invoice_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_financing_requests_invoice_id'
  ) then
    alter table financing_requests
      add constraint fk_financing_requests_invoice_id
      foreign key (invoice_id)
      references invoices(id)
      on delete restrict
      not valid;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financing_requests_status_check'
  ) then
    alter table financing_requests drop constraint financing_requests_status_check;
  end if;

  alter table financing_requests
    add constraint financing_requests_status_check
    check (status in ('Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Repaid'));
end $$;

alter table financing_requests
  add column if not exists disbursement_date date,
  add column if not exists repayment_due_date date;

create index if not exists ux_financing_requests_active_invoice
  on financing_requests(company_id, invoice_id)
  where status in ('Pending', 'Under Review', 'Approved', 'Disbursed');

create table if not exists financing_status_events (
  id uuid primary key default gen_random_uuid(),
  financing_request_id uuid not null references financing_requests(id) on delete cascade,
  status text not null check (status in ('Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Repaid')),
  changed_at timestamptz not null default now()
);

create index if not exists idx_financing_status_events_request_changed
  on financing_status_events(financing_request_id, changed_at asc);

alter table companies
  add column if not exists credit_limit numeric(14, 2) not null default 120000;
