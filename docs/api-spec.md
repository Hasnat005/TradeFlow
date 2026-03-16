# TradeFlow API Specification (Platform Level)

## Purpose
This document provides a platform-level API overview for TradeFlow, aligned to engineering implementation and investor reporting needs.

For service-level details, backend OpenAPI source is maintained in:
- backend/api-server/docs/openapi.yaml

## API Design Principles
- Resource-oriented REST endpoints.
- Explicit role and authorization checks.
- Idempotency for financially sensitive actions.
- End-to-end traceability with request IDs and audit events.
- Backward-compatible versioning via /api/v1.

## Authentication and Authorization
- Authentication: JWT-based bearer tokens (Supabase Auth compatible).
- Token transport: Authorization: Bearer <token>.
- Authorization: RBAC by user role and organization membership.

Primary roles:
- supplier
- buyer
- financier
- admin

## Core Domain Endpoints

### Health and Readiness
- GET /api/v1/health
- GET /api/v1/health/readiness?verbose=true

### Purchase Orders
- POST /api/v1/purchase-orders
- GET /api/v1/purchase-orders/:id
- GET /api/v1/purchase-orders (supports standard query controls; see Pagination, Filtering & Sorting)
- PATCH /api/v1/purchase-orders/:id/status

### Invoices
- POST /api/v1/invoices
- GET /api/v1/invoices/:id
- GET /api/v1/invoices (supports standard query controls; see Pagination, Filtering & Sorting)
- PATCH /api/v1/invoices/:id/status

### Financing Requests
- POST /api/v1/financing-requests
- GET /api/v1/financing-requests/:id
- GET /api/v1/financing-requests (supports standard query controls; see Pagination, Filtering & Sorting)
- PATCH /api/v1/financing-requests/:id/decision
- POST /api/v1/financing-requests/:id/disburse

### Payments and Settlements
- POST /api/v1/payments
- GET /api/v1/payments/:id
- GET /api/v1/payments (supports standard query controls; see Pagination, Filtering & Sorting)
- POST /api/v1/settlements
- GET /api/v1/settlements/:id
- GET /api/v1/settlements (supports standard query controls; see Pagination, Filtering & Sorting)

## Pagination, Filtering & Sorting

TradeFlow list endpoints use a single query convention for pagination, filtering, and sorting.

Standard query parameters:

- `page` (number, optional): 1-based page index; default `1`.
- `per_page` (number, optional): items per page; default `25`, max `100`.
- `limit` (number, optional): alias for `per_page` for compatibility.
- `offset` (number, optional): explicit row offset; if provided, server prioritizes `offset + limit/per_page` semantics.
- `sort` (string, optional): `field:asc|desc` (example: `created_at:desc`).

Common filters (resource-dependent):

- `status`
- `date_from` (ISO date)
- `date_to` (ISO date)
- `customer_id`
- `vendor_id`
- `min_amount`
- `max_amount`

Default behavior when query params are absent:

- Returns first page (`page=1`) with `per_page=25`.
- Applies no additional filters.
- Sorts by `created_at:desc`.

Response metadata shape:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 256,
    "page": 2,
    "per_page": 25,
    "total_pages": 11,
    "links": {
      "next": "/api/v1/invoices?page=3&per_page=25&sort=created_at:desc",
      "prev": "/api/v1/invoices?page=1&per_page=25&sort=created_at:desc"
    }
  }
}
```

Example request:

```http
GET /api/v1/invoices?page=2&per_page=25&status=accepted&date_from=2026-01-01&date_to=2026-12-31&min_amount=5000&sort=issue_date:desc
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_001",
      "invoiceNumber": "INV-2026-1034",
      "status": "accepted",
      "invoiceAmount": 24800.0,
      "issueDate": "2026-03-01"
    }
  ],
  "meta": {
    "total": 73,
    "page": 2,
    "per_page": 25,
    "total_pages": 3,
    "links": {
      "next": "/api/v1/invoices?page=3&per_page=25&status=accepted&sort=issue_date:desc",
      "prev": "/api/v1/invoices?page=1&per_page=25&status=accepted&sort=issue_date:desc"
    }
  }
}
```

## Workflow Mapping

### Purchase Order Workflow
1. Buyer creates purchase order.
2. Supplier acknowledges/accepts.
3. Order is fulfilled and status progresses.

### Invoice Workflow
1. Supplier submits invoice referencing order.
2. Buyer accepts or disputes.
3. Accepted invoice becomes financing-eligible.

### Financing Workflow
1. Supplier submits financing request.
2. Financier reviews and decides.
3. Approved requests are disbursed.

### Settlement Workflow
1. Buyer pays invoice obligation.
2. Settlement allocates funds to financier and supplier.
3. Invoice/financing status finalized as settled/repaid.

## Request/Response Standards
- Content-Type: application/json
- Validation: strict schema validation at API boundary
- Success envelope:
  {
    "success": true,
    "data": {}
  }
- Error envelope:
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "details": {}
    }
  }

## Example Objects

### Purchase Order (response)
{
  "id": "uuid",
  "poNumber": "PO-2026-001",
  "buyerOrgId": "uuid",
  "supplierOrgId": "uuid",
  "totalAmount": 150000.00,
  "currency": "USD",
  "status": "approved"
}

### Financing Request (response)
{
  "id": "uuid",
  "invoiceId": "uuid",
  "requestedAmount": 100000.00,
  "status": "pending",
  "riskScore": 0.18
}

## Non-Functional Requirements
- p95 API latency target: < 300ms for standard reads.
- Availability target: 99.9% monthly uptime.
- Immutable audit logging for financial status transitions.
- Alerting on failed settlements, repeated payment failures, and elevated dispute rates.

## Versioning and Change Management
- URI versioning: /api/v1.
- Breaking changes require a new major API version.
- Endpoint deprecations should include sunset timeline and migration guidance.

## Investor Reporting Alignment
TradeFlow API endpoints should support operational and commercial reporting such as:
- Gross merchandise volume (GMV)
- Invoice financing volume
- Average settlement cycle time
- Dispute and default rate trends
- Platform fee and financing revenue metrics

## Implementation Status
- Implemented now: health/readiness APIs in backend/api-server.
- Planned next: purchase order, invoice, financing, and settlement modules.
