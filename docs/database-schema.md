# TradeFlow Database Schema

## Purpose
This document defines the core relational schema for the TradeFlow platform in PostgreSQL (Supabase-compatible).

Design goals:
- Financial traceability and auditability.
- Clear relationship mapping across supplier, buyer, and financier workflows.
- Support for performance analytics and investor reporting.

## Conventions
- Primary keys: UUID.
- Timestamps: UTC with created_at/updated_at.
- Money fields: numeric(18,2).
- Status fields: constrained text/enums.
- Audit trail: append-only event history tables.

## Core Entities

### users
Represents authenticated identities.
- id (uuid, pk)
- email (text, unique)
- full_name (text)
- role (text: supplier | buyer | financier | admin)
- is_active (boolean)
- created_at, updated_at

### organizations
Represents legal entities.
- id (uuid, pk)
- name (text)
- type (text: supplier | buyer | financier)
- registration_number (text)
- country_code (text)
- created_at, updated_at

### organization_members
Maps users to organizations.
- id (uuid, pk)
- organization_id (uuid, fk -> organizations.id)
- user_id (uuid, fk -> users.id)
- member_role (text)
- created_at

### purchase_orders
Commercial intent and payable basis.
- id (uuid, pk)
- po_number (text, unique)
- buyer_org_id (uuid, fk -> organizations.id)
- supplier_org_id (uuid, fk -> organizations.id)
- currency (text)
- total_amount (numeric)
- issued_date (date)
- due_date (date)
- status (text: draft | approved | fulfilled | closed | cancelled)
- created_by (uuid, fk -> users.id)
- created_at, updated_at

### purchase_order_items
Line items for each purchase order.
- id (uuid, pk)
- purchase_order_id (uuid, fk -> purchase_orders.id)
- description (text)
- quantity (numeric)
- unit_price (numeric)
- line_total (numeric)

### invoices
Supplier invoices tied to order fulfillment.
- id (uuid, pk)
- invoice_number (text, unique)
- purchase_order_id (uuid, fk -> purchase_orders.id)
- supplier_org_id (uuid, fk -> organizations.id)
- buyer_org_id (uuid, fk -> organizations.id)
- invoice_amount (numeric)
- currency (text)
- issue_date (date)
- due_date (date)
- status (text: submitted | accepted | disputed | financed | settled)
- submitted_by (uuid, fk -> users.id)
- created_at, updated_at

Invoice exception approval (when invoice_amount exceeds linked purchase order constraints) is stored in `audit_events`:
- `audit_events.entity_type = "invoice"`
- `audit_events.entity_id = invoices.id`
- `audit_events.action = "invoice_exception_approved"` (event_type semantic)
- `audit_events.metadata` includes approval payload (for example: `approved_by`, `approved_at`, `reason`, `approval_note`).

### financing_requests
Supplier requests for invoice financing.
- id (uuid, pk)
- invoice_id (uuid, fk -> invoices.id)
- requested_amount (numeric)
- financier_org_id (uuid, fk -> organizations.id, nullable until assigned)
- risk_score (numeric, nullable)
- status (text: pending | approved | rejected | disbursed | repaid)
- requested_by (uuid, fk -> users.id)
- created_at, updated_at

### financing_terms
Terms attached to approved financing.
- id (uuid, pk)
- financing_request_id (uuid, fk -> financing_requests.id)
- advance_rate_pct (numeric)
- fee_rate_pct (numeric)
- disbursed_amount (numeric)
- expected_repayment_amount (numeric)
- approved_at (timestamp)
- approved_by (uuid, fk -> users.id)

### payments
Payment and settlement events.
- id (uuid, pk)
- invoice_id (uuid, fk -> invoices.id)
- payer_org_id (uuid, fk -> organizations.id)
- payee_org_id (uuid, fk -> organizations.id)
- amount (numeric)
- currency (text)
- payment_method (text)
- external_reference (text)
- status (text: initiated | confirmed | failed | reversed)
- paid_at (timestamp, nullable)
- created_at, updated_at

### settlements
Allocation results of payment events.
- id (uuid, pk)
- invoice_id (uuid, fk -> invoices.id)
- payment_id (uuid, fk -> payments.id)
- financier_amount (numeric)
- supplier_residual_amount (numeric)
- platform_fee_amount (numeric)
- status (text: pending | completed | failed)
- settled_at (timestamp, nullable)
- created_at, updated_at

### audit_events
Immutable event log for compliance and diagnostics.
- id (uuid, pk)
- entity_type (text)
- entity_id (uuid)
- action (text)
- actor_user_id (uuid, fk -> users.id, nullable)
- metadata (jsonb)
- created_at

## Relationship Summary
- organizations `1..*` organization_members `*..1` users
- purchase_orders link buyer_org and supplier_org
- invoices belong to purchase_orders
- financing_requests belong to invoices
- approved financing requests have financing_terms
- payments settle invoices
- settlements allocate payments to financier/supplier/platform

## Indexing Recommendations
- Unique indexes: po_number, invoice_number, users.email.
- Foreign key indexes on all *_id columns.
- Composite indexes:
  - invoices(status, due_date)
  - financing_requests(status, created_at)
  - payments(status, created_at)
- Time-series index for audit_events(created_at).

## Data Integrity Rules
- Invoice amount cannot exceed linked purchase order amount unless explicitly approved.
- Financing requested_amount must be <= accepted invoice_amount.
- In `financing_requests`, `financier_org_id` must be non-null when `status` is `approved`, `disbursed`, or `repaid` (status domain: `pending | approved | rejected | disbursed | repaid`).
- Settlement totals must reconcile with payment amount.
- Status transitions are state-machine validated in service layer.

Database-level enforcement migration for financing request rule:

```sql
ALTER TABLE financing_requests
ADD CONSTRAINT check_financier_for_status
CHECK (
  status NOT IN ('approved', 'disbursed', 'repaid')
  OR financier_org_id IS NOT NULL
);
```

Reference migration file: `backend/api-server/migrations/001_add_check_financier_for_status.sql`.

Invoice exception approval enforcement details:
- For exceptions in `invoices`, persist approval events in `audit_events` and correlate by `audit_events.entity_id = invoices.id`.
- Approval metadata is carried in `audit_events.action` and `audit_events.metadata` so reviewers and implementers can validate who approved, when, and why.

## Supabase Notes
- Place schema in configured schema namespace (default: public).
- Use row-level security (RLS) policies for role-specific access.
- Route service-role operations through backend only; never expose privileged keys to clients.

## Investor-Relevant Metrics Supported by Schema
- GMV by period and customer cohort.
- Financing penetration rate (% invoices financed).
- Average days-to-settlement.
- Default/dispute incidence and recovery ratios.
- Revenue components: fees, financing spread, platform fees.
