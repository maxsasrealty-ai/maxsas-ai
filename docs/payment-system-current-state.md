# Payment System Current State (Codebase Analysis)

Date: 2026-03-05  
Scope: Full repository scan focused on wallet, payment, billing, charges, transactions, deductions, balance checks, and gateway placeholders.

---

## 1) Files currently involved in payment/wallet/billing logic

### A. Core services (business logic + Firestore writes/reads)

| File | Purpose | Type |
|---|---|---|
| `src/services/walletService.ts` | Wallet domain service: wallet read, pre-batch balance check, reserve/finalize/add balance, wallet transaction history subscriptions, cost preview | Service + business logic + Firestore access |
| `src/services/ledgerService.ts` | Global ledger service: lead debit entries, batch final debit finalization, balance history fetch | Service + business logic + Firestore access |
| `src/services/batchService.ts` | Batch lifecycle save/update; triggers billing finalization call on completed status | Service + orchestration |
| `src/services/leadService.ts` | Lead schema creation/read/update, includes billing fields (`billingStatus`, `callCost`, `minutesCharged`, etc.) | Service + Firestore access |
| `src/services/pricingService.ts` | Reads pricing config (`connectedMinuteRate`, `qualifiedLeadRate`) from `system/runtime` | Service + pricing config access |

### B. State and context layers

| File | Purpose | Type |
|---|---|---|
| `src/context/WalletContext.tsx` | Wallet provider; live wallet + transaction subscriptions; exposes `checkBalance`, `availableBalance`, top-up action (currently automation-blocked) | Context + app-facing wallet API |
| `src/context/BatchContext.tsx` | Batch orchestration; delegates save/status updates and surface-level flow integration with billing trigger path | Context + orchestration |
| `app/_layout.tsx` | Registers `WalletProvider` globally | App composition |

### C. Payment/wallet UI screens and view models

| File | Purpose | Type |
|---|---|---|
| `src/features/wallet/WalletScreen.tsx` | Main wallet UI (balance, stats, recent txns, recharge actions, dev test top-up) | UI screen |
| `src/features/wallet/TransactionHistory.tsx` | Wallet subcollection transaction list UI (`wallets/{userId}/transactions`) | UI component |
| `src/features/payments/TransactionHistoryScreen.tsx` | Global ledger transaction history UI (`transactions`) | UI screen |
| `src/features/payments/BatchChargesScreen.tsx` | Completed batch charge summaries | UI screen |
| `src/features/payments/BatchBillingDetailScreen.tsx` | Per-lead billing detail view for a selected batch | UI screen |
| `src/features/payments/useBatchChargesViewModel.ts` | VM for completed-batch charges totals/list | View model |
| `src/features/payments/useBatchBillingDetailViewModel.ts` | VM for selected-batch lead billing details | View model |
| `src/features/payments/batchChargesRepository.ts` | Firestore listeners for completed batches, batch by id, leads by batch | Repository |
| `src/features/payments/batchChargesModels.ts` | Billing/charges models | Models |

### D. Other UI integration points (wallet/balance checks)

| File | Purpose | Type |
|---|---|---|
| `src/features/leads/BatchDetailScreen.tsx` | Enforces balance check before `Call Now` and `Schedule`; recharge navigation on shortfall | UI flow + balance gating |
| `src/features/leads/BatchDashboard.tsx` | Balance gating for “Call Now” on draft batches | UI flow + balance gating |
| `src/features/home/HomeScreen.tsx` | Live wallet card and wallet navigation | UI summary |
| `src/components/ui/RechargeButton.tsx` | Recharge modal/button, calls context top-up action | UI component |
| `src/components/pricing/PricingModal.tsx` | Billing explanation modal (connected minute + qualified lead fee) | UI component |
| `src/components/pricing/PricingInfoCard.tsx` | Pricing explanation card | UI component |

### E. App routes exposing payment/wallet screens

| File | Purpose |
|---|---|
| `app/(tabs)/wallet.tsx` | Wallet tab route |
| `app/payment-history.tsx` | Payment history route |
| `app/transaction-history.tsx` | Transaction history route |
| `app/batch-charges.tsx` | Batch charges route |
| `app/batch-billing-detail.tsx` | Batch billing detail route |
| `app/(tabs)/_layout.tsx` | Wallet tab registration |
| `app/_layout.tsx` | Stack routes for payment screens |

### F. Firestore rules/index/type definitions

| File | Purpose | Type |
|---|---|---|
| `firestore.rules` | Wallet + ledger security model (automation write ownership, client read limits) | Security rules |
| `firestore.indexes.json` | Composite indexes for `transactions` queries | Firestore indexes |
| `src/types/batch.ts` | Batch/lead/wallet/payment-related data contracts | Types |

### G. Mock/test payment-related artifacts

| File | Purpose | Type |
|---|---|---|
| `src/data/mock.ts` | Mock wallet and payment history sample data for UI/demo use | Mock data |
| `FIRESTORE_SECURITY_RULES_TESTS.ts` | Rule validation file (not wallet-specific but transaction/rules-adjacent security tests exist) | Test helper |

### H. API/env/dependency indicators

| File | Purpose |
|---|---|
| `.env` | Webhook env vars; no payment-gateway env keys present |
| `.env.example` | Same as above; no Stripe/Razorpay/etc keys |
| `api/proxy-demo.ts` | Generic webhook proxy (demo call), not payment gateway |
| `package.json` | No payment gateway SDK dependency present |

---

## 2) Purpose classification summary

- **UI screens/components:** wallet and billing presentation, recharge prompts, history views.
- **Context layer:** exposes wallet state and pre-batch checks to UI.
- **Service layer:** performs wallet math, atomic transactions, ledger writes, and batch billing finalization.
- **Repository layer:** read-side listeners for payment/billing screens.
- **Firestore access:** concentrated in `walletService`, `ledgerService`, `batchService`, `leadService`, and payment repository.
- **Business logic:** split between wallet model (`₹14/call` path) and ledger model (`minute-based + batch final debit`).

---

## 3) Current payment flow used in app

## 3.1 Pre-dispatch balance checks

Balance checks occur before dispatch in:

- `src/features/leads/BatchDetailScreen.tsx`
  - `handleCallNowConfirm()` → `checkBalance(totalContacts)`
  - `handleScheduleConfirm()` → `checkBalance(totalContacts)`
- `src/features/leads/BatchDashboard.tsx`
  - `getCallNowDisabledReason()` local shortfall check
  - `executeCallNow()` → `checkBalance(batch.totalContacts)`

If insufficient, user is blocked and prompted to go to `/wallet`.

## 3.2 Wallet model actually implemented

`walletService.ts` implements a **fixed per-call model**:

- `COST_PER_CALL = 14`
- Required amount = `totalCalls * 14`
- available = `balance - lockedAmount`
- supports reserve/finalize semantics with atomic `runTransaction`

Key methods:

- `checkBalanceBeforeBatch`
- `reserveBalanceForBatch`
- `finalizeBatchPayment`
- `addBalanceToWallet`
- `addTestBalance` (dev helper)

## 3.3 Ledger model also present

`ledgerService.ts` implements a **usage-ledger model**:

- `recordLeadDebitAndAccumulateBatch()` adds `lead_debit` entries + increments `batchTotalCost`
- `finalizeCompletedBatchBilling()` creates deterministic `batch_debit_{batchId}` and deducts wallet once per batch
- read APIs for transaction history

This indicates **dual billing paths exist in code**:

1. `walletService` fixed per-call debit model
2. `ledgerService` per-lead accumulation + batch finalization model

## 3.4 Batch completion billing trigger

- `batchService.updateBatchStatus(..., 'completed')` attempts to call `finalizeBatchBilling(batchId, userId)`.
- Current compile state: `finalizeBatchBilling` is imported but not exported by `ledgerService`.
  - Error confirmed in TypeScript diagnostics.

Implication: intended completion-time billing finalization is present architecturally, but function naming/export mismatch exists.

---

## 4) Firestore collections and current wallet/billing schema

## 4.1 Collections

- `wallets/{userId}`
- `wallets/{userId}/transactions`
- `transactions` (global ledger)
- `batches`
- `leads`
- `system/runtime` (pricing + runtime config)

## 4.2 Wallet document (`wallets/{userId}`)

Observed fields:

- `userId: string`
- `balance: number`
- `lockedAmount: number`
- `totalSpent: number`
- `totalRecharged: number`
- `updatedAt: Timestamp`

Backward compatibility aliases read in code:

- `reservedBalance`
- `reservedAmount`
- `lastUpdated`

## 4.3 Wallet transaction subcollection (`wallets/{userId}/transactions/{transactionId}`)

Observed schema (`WalletTransaction`):

- `transactionId`
- `userId`
- `type: recharge | deduction | refund`
- `amount`
- `previousBalance`
- `newBalance`
- `batchId?`
- `description`
- `createdAt`

## 4.4 Global ledger (`transactions/{transactionId}`)

Observed ledger fields in `ledgerService`:

- `transactionId`
- `userId`
- `batchId`
- `leadId`
- `type: lead_debit | batch_debit | recharge`
- `amount`
- `minutesCharged`
- `rate`
- `createdAt`

Legacy write path in `walletService.finalizeBatchPayment` also writes:

- `type: 'debit'`
- `description`
- `timestamp`

## 4.5 Batch billing-related fields (`batches`)

- `batchTotalCost`
- `billingLedgerStatus: pending | finalized`
- `billedAt`
- status/count fields used by batch billing views

## 4.6 Lead billing-related fields (`leads`)

- `billingStatus`
- `callCost`
- `minutesCharged`
- `successFeeApplied`
- `billedAt`
- plus `callStartedAt`, `callEndedAt` for billable duration lifecycle support

## 4.7 Firestore security posture (important)

From `firestore.rules`:

- `wallets/{userId}` write path allows automation and user top-up constrained by strict monotonic checks.
- `wallets/{userId}/transactions` is read-only to client (no create/update/delete from client).
- `transactions` is read-only to owner; client create/update/delete denied.

This means many client-side write attempts to ledger-style docs rely on privileged automation or backend paths to be valid in production rules.

---

## 5) Mock/test wallet implementations currently used

### Real dev/test helpers in runtime code

- `walletService.addTestBalance(amount)`
  - Dev helper to increment wallet balance directly via Firestore transaction.
  - Explicit comment: **No transaction record is created**.
- `WalletScreen` uses `addTestBalance` behind `__DEV__` test actions.

### Static mock data

- `src/data/mock.ts`
  - Contains mock `wallet` object and `paymentHistory` array for sample/demo UI data.

### Recharge placeholder behavior

- `WalletContext.addBalanceToWallet()` currently returns failure with message:
  - “Wallet top-ups are handled by automation.”
- `WalletScreen.handleRecharge()` shows info alert (automation-handled).
- `RechargeButton` still invokes `addBalanceToWallet`, so currently behaves as a non-functional gateway placeholder path from business perspective.

---

## 6) Exact locations of balance checks before dispatch

Primary dispatch-gating checks:

1. `src/features/leads/BatchDetailScreen.tsx`
   - `handleCallNowConfirm`: check before saving batch to Firebase.
   - `handleScheduleConfirm`: check before scheduling batch.

2. `src/features/leads/BatchDashboard.tsx`
   - `getCallNowDisabledReason`: pre-disable Call Now button by local comparison.
   - `executeCallNow`: server-side style re-check using `checkBalance` before call.

3. `src/services/walletService.ts`
   - `checkBalanceBeforeBatch`: authoritative check logic used by context/UI.
   - Additional reserve and finalize methods include defensive balance checks in transactions.

---

## 7) Payment gateway integration status (real/partial/none)

## 7.1 Real payment gateway integration

**Current status: None present.**

No Stripe/Razorpay/PayPal/PayU/Cashfree SDK usage found in active app code, and no gateway API keys/env vars exist.

## 7.2 Partial or placeholder integration indicators

- UI-level recharge flows exist, but top-ups are marked automation-handled.
- `RechargeButton` + wallet screens provide UX for recharge, but no real payment initiation backend path exists.
- `addTestBalance` provides dev-only credit simulation.

## 7.3 Dependencies indicating possible future gateway work

`package.json` contains no payment gateway libraries.

## 7.4 Environment variables indicating gateway readiness

No payment-gateway env vars found. Present env vars are webhook-oriented:

- `EXPO_PUBLIC_DEMO_CALL_WEBHOOK_URL`
- `EXPO_PUBLIC_RETRY_LEAD_WEBHOOK_URL`

These are call orchestration webhooks, not payment webhooks.

---

## Architecture risks / extension notes for future real gateway integration

1. **Dual billing logic exists** (`walletService` fixed call-rate vs `ledgerService` lead/batch ledger).  
   A single source of truth should be selected before integrating real gateway settlement.

2. **Function mismatch in completion billing trigger** in `batchService` (`finalizeBatchBilling` import mismatch).  
   This should be corrected before gateway rollout so post-completion charging is deterministic.

3. **Rules vs client-write assumptions**: global ledger and wallet transaction writes are restricted in rules.  
   Real gateway settlement should use trusted backend/automation write path aligned with rules.

4. **Recharge UX is present but non-functional for real payments**.  
   Gateway flow can be integrated into existing recharge surfaces with minimal UX disruption.

---

## Suggested safe extension strategy (high-level)

1. Normalize billing model (choose one ledger strategy).
2. Fix completion billing function mismatch.
3. Introduce backend payment orchestration service (server-only keys, webhook verification).
4. Keep Firestore as read model + auditable ledger; gateway settlement updates wallet atomically.
5. Rewire `addBalanceToWallet` / recharge UI to call backend payment intent + confirmation flow.
6. Preserve existing pre-dispatch balance checks to avoid operational regressions.

---

This document reflects current repository state without modifying runtime logic.
