# Backend Architecture

## Firebase Platform
- Firebase Authentication is used for identity and session management.
- Firestore serves as the primary application database for operational and billing entities.
- Security rules enforce role-aware read/write access boundaries.

## Firestore Collections
- Core collections include users, batches, leads, wallets, and transactions.
- Additional system/runtime collections store workflow state, dispatch metadata, and execution logs.
- Indexed fields support dashboard filtering by status, owner, and date.

## Wallet Billing
- Wallet balances are maintained per workspace/user context.
- Recharge events and usage deductions are recorded as transactions for traceability.
- Ledger-style entries provide a reliable audit history for manual review.

## Batch Orchestration
- Batch orchestration coordinates lead dispatch, call result ingestion, and state transitions.
- Runtime metadata tracks dispatch sequencing, retries, and completion conditions.
- Backend workflows update both batch-level and lead-level status for accurate monitoring.
