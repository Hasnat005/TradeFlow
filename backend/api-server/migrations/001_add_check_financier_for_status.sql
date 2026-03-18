do $$
begin
  if to_regclass('public.financing_requests') is null then
    return;
  end if;

  alter table financing_requests
  add column if not exists financier_org_id text;

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
