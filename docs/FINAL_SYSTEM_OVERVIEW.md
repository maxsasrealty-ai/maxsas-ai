# Final System Overview

## Lead Intake
- Leads are imported through supported channels and normalized into system records.
- Validation and grouping prepare leads for batch execution.

## Batch Engine
- Batch engine orchestrates lead processing lifecycle and completion state.
- Batch dashboards reflect queue depth, progress, and final outcomes.

## AI Calling
- AI calling integration executes outbound conversations and returns structured results.
- Outcome signals are mapped back to leads and campaign/batch analytics.

## Wallet Billing
- Wallet model controls prepaid usage and call-cost deduction.
- Recharge and deduction events are persisted in transaction ledger history.

## Admin Monitoring
- Admin control plane tracks tenants, operational health, billing, and interventions.
- Monitoring views combine batch, call, and payment signals for governance.
