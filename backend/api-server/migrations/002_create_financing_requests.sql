create extension if not exists pgcrypto;

create table if not exists financing_requests (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  financier_org_id text,
  invoice_id text not null,
  buyer_name text not null,
  requested_amount numeric(14, 2) not null check (requested_amount > 0),
  approved_amount numeric(14, 2),
  interest_rate numeric(6, 3),
  repayment_amount numeric(14, 2) not null default 0,
  amount_paid numeric(14, 2) not null default 0,
  status text not null check (status in ('Pending', 'Approved', 'Rejected', 'Disbursed', 'Repaid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_financing_requests_company_created_at
  on financing_requests(company_id, created_at desc);

create index if not exists idx_financing_requests_invoice_id
  on financing_requests(invoice_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'check_financier_for_status'
  ) then
    alter table financing_requests
    add constraint check_financier_for_status
    check (
      lower(status) not in ('approved', 'disbursed', 'repaid')
      or financier_org_id is not null
    );
  end if;
end $$;
