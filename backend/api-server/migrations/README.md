# TradeFlow API Migrations

Migration notes for TradeFlow API PostgreSQL/Supabase schema management.

## Current State

- The backend is configured for `DATABASE_URL` and Supabase credentials.
- Connection and readiness checks are in `src/config/postgres.ts` and `src/repositories/health.repository.ts`.

## Recommended Workflow

1. Define SQL migrations in this directory.
2. Apply migrations in non-production first.
3. Record schema changes and rollout notes in PR descriptions.
4. Keep `docs/openapi.yaml` and data contracts aligned with schema updates.

## Schema Notes

- Default Supabase DB schema is controlled by `SUPABASE_DB_SCHEMA`.
- SSL behavior is controlled by `PG_SSL_REJECT_UNAUTHORIZED` and optional `PG_SSL_CA`.
