# TradeFlow Platform Architecture

## Purpose
TradeFlow is a fintech-enabled B2B trade platform that connects suppliers, buyers, and financiers to digitize procurement, invoice financing, and settlement workflows.

This document is written for both:
- Engineering teams implementing and operating the platform.
- Investors evaluating scalability, defensibility, and operational readiness.

## System Overview
TradeFlow follows a modular, service-oriented architecture with a mobile frontend, API backend, relational data store, and third-party fintech integrations.

High-level layers:
1. Client Layer
   - Mobile application (Expo React Native) for supplier, buyer, and financier operations.
2. API Layer
   - TradeFlow API (Node.js, Express, TypeScript) exposes secure, validated REST endpoints.
3. Domain/Service Layer
   - Business modules for orders, invoices, financing, payments, and risk checks.
4. Data Layer
   - PostgreSQL (via Supabase) for transactional data and auditability.
5. Integration Layer
   - Payment rails, notifications, KYC/AML providers, and reporting tools.

## Core Components

### Frontend (Mobile App)
- Role-aware user experience and workflows.
- Authenticated access and secure token handling.
- Real-time status updates for orders, invoices, financing, and settlement.

### Backend (API)
- Input validation, centralized error handling, and structured logging.
- Module-based architecture for maintainability and team scaling.
- Supabase/PostgreSQL readiness for secure, compliant data operations.

### Data & Reporting
- Normalized relational model for traceable financial records.
- Event and status history for analytics and auditing.
- KPI-ready data for investor dashboards (GMV, financing volume, settlement time).

## Main User Roles

### Supplier
- Creates and manages purchase order fulfillment records.
- Submits invoices linked to fulfilled orders.
- Requests financing against approved invoices.
- Monitors disbursement and settlement status.

### Buyer
- Creates/approves purchase orders.
- Reviews invoice submissions and confirms acceptance.
- Tracks payable obligations and settlement timelines.
- Provides payment confirmations.

### Financier
- Reviews financing requests and risk signals.
- Approves/rejects financing terms.
- Disburses capital and tracks repayment/settlement events.
- Monitors portfolio exposure and default risk.

## Core Workflows

### 1) Purchase Orders
1. Buyer creates purchase order with supplier, terms, and amount.
2. Supplier receives and accepts/rejects the order.
3. Buyer and supplier update fulfillment milestones.
4. Order transitions through states (draft, approved, fulfilled, closed).

Business value:
- Establishes verifiable commercial intent and payable basis.
- Creates foundational data for downstream financing.

### 2) Invoice Submission
1. Supplier submits invoice linked to fulfilled order(s).
2. Buyer validates invoice details and marks accepted/disputed.
3. Accepted invoices become financing-eligible.

Business value:
- Digitizes AP/AR reconciliation.
- Reduces disputes and improves operational cycle time.

### 3) Financing Requests
1. Supplier requests financing for accepted invoice(s).
2. Platform evaluates eligibility and risk attributes.
3. Financier reviews request and proposes/approves terms.
4. Approved financing is disbursed to supplier.

Business value:
- Unlocks working capital for suppliers.
- Creates recurring revenue opportunities via financing spreads/fees.

### 4) Payment Settlement
1. Buyer pays invoice on due date or agreed schedule.
2. Platform allocates incoming payment to financed obligations.
3. Financier is repaid principal/fees as applicable.
4. Residual amount (if any) is transferred to supplier.
5. Workflow is marked settled with immutable records.

Business value:
- Closes transaction loop with transparent cash flow tracking.
- Enables reliable performance and risk reporting.

## Security and Compliance Architecture
- Role-based access control for supplier/buyer/financier boundaries.
- End-to-end audit trail for financial state transitions.
- Encryption in transit and secrets managed via environment configuration.
- Monitoring and alerting on high-risk or failed settlement events.

### Data Protection and Resilience Controls

#### 1) Encryption at Rest
- Full-disk encryption is required for TradeFlow database volumes, object storage, and backups.
- Field-level encryption is required for sensitive identifiers and regulated financial metadata.
- Encryption keys are managed through cloud KMS providers (AWS KMS, Google Cloud KMS, or Azure Key Vault) with strict key access policies.
- Key rotation is enforced on a scheduled cadence and during incident response events.
- Access to encryption key operations is restricted by least-privilege IAM policy and audited.

#### 2) Backup and Retention Strategy
- Automated encrypted backups run on a scheduled cadence (at least daily full backup with periodic incremental snapshots).
- Continuous Postgres WAL archiving and replication are enabled for point-in-time recovery to support low data-loss objectives.
- Supabase PostgreSQL PITR is configured with recovery-point granularity under 15 minutes for core financial records.
- Backups are replicated across geographic boundaries to protect against regional failures.
- Immutable snapshots are retained for defined windows to support ransomware recovery.
- Retention periods follow TradeFlow data governance policy and jurisdictional requirements.

#### 3) Disaster Recovery and Business Continuity
- TradeFlow adopts Option B for recovery posture: maintain `RPO <= 15 minutes` for core financial records through continuous WAL streaming/archiving, Supabase PITR (<15-minute granularity), and cross-region async replication.
- TradeFlow recovery objectives are defined per service tier (target baseline: RTO <= 4 hours, RPO <= 15 minutes for core financial records).
- Failover procedures include database promotion, service rerouting, and controlled recovery validation.
- Monitoring continuously tracks replication lag, PITR health, backup-job success, and snapshot integrity.
- Disaster recovery tests are executed periodically (at least quarterly) with documented outcomes.
- DR tests include time-stamped restore drills that validate achieved RPO/RTO against targets.
- Recovery runbooks are version-controlled and reviewed after each test or production incident.

Reference standards and controls:
- SOC 2 security criteria, ISO/IEC 27001 controls, and PCI DSS-aligned payment handling practices.

## Scalability and Investor Readiness
- Modular services support faster feature expansion and parallel engineering teams.
- API-first architecture enables future web portals and partner integrations.
- Data model supports clear unit economics (take rate, default ratio, cycle times).
- Operational observability reduces downtime and supports institutional trust.

## Near-Term Roadmap
- Add stronger policy engine for credit/risk decisions.
- Expand analytics for cohort and exposure tracking.
- Introduce workflow automation for dispute handling and collections.
- Harden compliance controls for new markets and regulated partners.
