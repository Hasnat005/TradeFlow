create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null
);

create table if not exists companies (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  company_name text not null,
  business_type text not null,
  address text not null,
  tax_id text not null,
  industry_type text,
  phone_number text,
  company_account_id text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bank_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  account_number text not null,
  bank_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  document_type text not null,
  status text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_companies_user_id on companies(user_id);
create index if not exists idx_bank_accounts_company_id on bank_accounts(company_id);
create index if not exists idx_documents_company_id on documents(company_id);
