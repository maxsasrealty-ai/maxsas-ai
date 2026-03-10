# Payment System

## Wallet Model
- Wallet is the primary prepaid balance model for call and workflow consumption.
- Balance state is maintained with deterministic credit/debit events.

## Manual Recharge
- Recharge operations increase wallet balance and create corresponding transaction entries.
- Admin-facing recharge supports non-gateway operational workflows.

## Call Deduction
- Call consumption deducts wallet balance according to defined billing rules.
- Deduction events are tied to batch/call references for traceability.

## Ledger Entries
- Ledger records include recharge, deduction, adjustment, and reversal classes.
- Immutable-style history enables reconciliation and dispute review.
