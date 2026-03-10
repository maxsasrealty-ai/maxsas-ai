# Firebase Data Model

## Primary Collections
- `users`: authentication-linked profile, role, and workspace metadata.
- `batches`: batch configuration, runtime state, and processing summaries.
- `leads`: lead identity, contact details, and call outcome lifecycle.
- `wallets`: current balance and billing state per owner/workspace.
- `transactions`: recharge, deduction, adjustment, and ledger metadata.

## System and Runtime Collections
- Runtime collections store dispatch state, retry metadata, and integration traces.
- Operational logs support debugging, monitoring, and replay-safe processing.

## Modeling Notes
- References/ids link users, batches, leads, and billing records.
- Indexed status/date fields support dashboard filtering and reporting workloads.
