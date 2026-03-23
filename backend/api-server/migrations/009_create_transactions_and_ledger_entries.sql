create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  title text,
  description text,
  amount numeric(14, 2),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_company_created_at
  on transactions(company_id, created_at desc);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  reference_type text not null,
  reference_id text,
  entry_type text not null check (entry_type in ('credit', 'debit')),
  amount numeric(14, 2) not null check (amount >= 0),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_entries_company_created_at
  on ledger_entries(company_id, created_at desc);
