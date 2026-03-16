# TradeFlow API

Node.js + Express + TypeScript backend foundation for the TradeFlow platform.

## Architecture

```text
src/
  controllers/
  services/
  repositories/
  routes/
  middlewares/
  config/
  utils/
  modules/
```

## Features

- Environment configuration with validation
- Centralized error handling
- Structured logging with request correlation
- Request validation using Zod
- Supabase and PostgreSQL integration readiness

## Security & Authentication

TradeFlow API currently provides security middleware and infrastructure hooks, but application authentication/authorization must be implemented before production release.

- Transport and header hardening: `helmet`, CORS, compression in `src/app.ts`.
- Request logging and traceability: `pino`/`pino-http` in [src/middlewares/request-logger.ts](src/middlewares/request-logger.ts) and [src/utils/logger.ts](src/utils/logger.ts).
- Validation and safe error responses: [src/middlewares/validate-request.ts](src/middlewares/validate-request.ts), [src/middlewares/error-handler.ts](src/middlewares/error-handler.ts).
- Planned auth model for TradeFlow: JWT access token verification (Supabase Auth JWT issuer), optional OAuth2 provider federation, and role-based access control (RBAC) at route/service boundaries.
- RBAC implementation anchor point: add role/permission checks in [src/middlewares](src/middlewares) and module route handlers in [src/routes](src/routes).

## API Documentation

TradeFlow API OpenAPI starter spec is available at [docs/openapi.yaml](docs/openapi.yaml).

Example endpoints:

- `GET /api/v1/health`
- `GET /api/v1/health/readiness?verbose=true`

Route sources:

- [src/routes/index.ts](src/routes/index.ts)
- [src/routes/health.routes.ts](src/routes/health.routes.ts)

## Testing

TradeFlow API testing strategy is documented in [tests/README.md](tests/README.md).

- Unit tests: service and utility level (fast deterministic checks).
- Integration tests: HTTP routes + middleware + repository boundaries.
- Coverage policy target: minimum 80% line coverage before release.

Current quality gates (available now):

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Database Setup

TradeFlow API is prepared for Supabase PostgreSQL using `DATABASE_URL` and Supabase credentials in `.env`.

- PostgreSQL pool configuration: [src/config/postgres.ts](src/config/postgres.ts)
- Supabase admin client configuration: [src/config/supabase.ts](src/config/supabase.ts)
- Environment schema: [src/config/env.ts](src/config/env.ts)
- Migration/runbook notes: [migrations/README.md](migrations/README.md)

## Deployment

TradeFlow API deployment guidelines:

- Build artifact: `dist/` via `npm run build`.
- Runtime command: `npm run start`.
- CI baseline: run `npm run lint`, `npm run typecheck`, `npm run build` on pull requests.
- Secret handling: provide `.env` values through CI secret store or runtime secret manager; never commit real keys.
- Containerization: use a production Node image and inject env values at deploy time.

## Monitoring & Alerting

TradeFlow API observability baseline:

- Structured logs via `pino` for request and error events ([src/utils/logger.ts](src/utils/logger.ts), [src/middlewares/request-logger.ts](src/middlewares/request-logger.ts)).
- Readiness signal endpoint for uptime checks: `GET /api/v1/health/readiness`.
- Recommended next step: emit metrics (latency, error rate, throughput) and route alerts on SLO violations.

## Compliance

TradeFlow API compliance guidance for fintech workloads:

- Data retention: define retention windows for transaction, KYC, and auth logs in deployment policy.
- Audit trail: log user/action/resource metadata for sensitive operations.
- PII handling: avoid sensitive data in logs and redact tokens/keys in middleware.
- Access controls: enforce least privilege for database roles and service keys.

This repository includes architecture anchors for the above controls; formal compliance controls must be finalized before production launch.

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
