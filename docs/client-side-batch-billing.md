# Client-Side Batch Billing

Date: 2026-03-05

## Overview

This project now supports **client-side wallet deduction** when a batch reaches `status = completed` and `billingLedgerStatus != "finalized"`.

The flow is idempotent and guarded with Firestore transaction semantics so billing runs only once per batch.

---

## Trigger points

Billing finalization is automatically triggered from:

- `src/features/leads/BatchDetailScreen.tsx`
- `src/features/leads/BatchResultsScreen.tsx`

Each screen watches the loaded batch and invokes client billing only when:

1. `batch.status === "completed"`
2. `batch.billingLedgerStatus !== "finalized"`

Both screens also keep an in-memory per-batch guard (`Set<batchId>`) to avoid duplicate calls from repeated renders.

---

## Core billing function

Primary function:

- `finalizeBatchBillingFromClient(batchId)` in `src/services/walletService.ts`

This function executes a single `runTransaction` and performs:

1. Read `batches/{batchId}`
2. Validate batch exists, belongs to current user, and status is `completed`
3. Exit early if already finalized
4. Read `batchTotalCost` and `userId` from batch
5. Read `wallets/{userId}`
6. Deduct `batchTotalCost` from `balance`
7. Increment `totalSpent` by same amount
8. Create wallet ledger entry in `wallets/{userId}/transactions/{transactionId}`
9. Mark batch as finalized via:
   - `billingLedgerStatus = "finalized"`
   - `billedAt = serverTimestamp()`

Transaction ID is deterministic:

- `batch_debit_${batchId}`

This supports one-record-per-batch debit and improves idempotency.

---

## Firestore fields used

## Batch document (`batches/{batchId}`)

Required fields:

- `userId: string`
- `status: string` (must be `completed`)
- `batchTotalCost: number`
- `billingLedgerStatus: "pending" | "finalized"`
- `billedAt: Timestamp | null`

Updated during finalization:

- `billingLedgerStatus`
- `billedAt`
- `updatedAt`

## Wallet document (`wallets/{userId}`)

Required fields:

- `balance: number`
- `totalSpent: number`
- `totalRecharged: number`
- `lockedAmount: number`

Updated during finalization:

- `balance` (decrement)
- `totalSpent` (increment)
- `updatedAt`

## Wallet transaction document (`wallets/{userId}/transactions/{transactionId}`)

Written fields:

- `transactionId`
- `userId`
- `type = "batch_debit"`
- `amount = batchTotalCost`
- `batchId`
- `previousBalance`
- `newBalance`
- `description`
- `createdAt`

---

## UI auto-update behavior

No extra UI polling is required.

Existing listeners already reflect billing updates:

- Wallet balance via `subscribeToWallet(...)`
- Wallet transaction history via `subscribeToTransactions(...)`

So once billing transaction commits, Wallet screens and transaction lists update automatically.

---

## Security rules alignment

`firestore.rules` now allows:

1. Authenticated owner wallet debits with accounting consistency checks
2. Owner-created `batch_debit` records in `wallets/{userId}/transactions`

This is required because prior rules only allowed monotonic top-ups from client and blocked transaction subcollection writes.

---

## How to extend for future payment gateway integration

This model should remain the **post-usage settlement layer** even after adding a real gateway.

Recommended extension pattern:

1. Keep `batchTotalCost` production logic unchanged
2. Keep batch finalization idempotency (`billingLedgerStatus` guard)
3. Add gateway only for wallet top-up/credit acquisition
4. On gateway success, credit wallet (`balance`, `totalRecharged`) via trusted backend path
5. Continue consuming wallet balance from batch completion transaction flow

This keeps:

- Usage billing deterministic
- Ledger auditable
- Gateway concerns isolated to recharge only

---

## Notes

- `batch_debit` is now a first-class wallet transaction type in app types/UI.
- Existing `BatchDashboard`/`BatchDetail` balance checks remain unchanged and continue to gate dispatch.
