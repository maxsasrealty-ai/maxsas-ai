<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Razorpay Integration Architecture (Read-Only Audit + Secure Design)

Date: 2026-03-05
Project: Maxsas-AI (Expo Android/iOS/Web + Firebase)

## Objective

Design a secure, production-ready Razorpay recharge flow that:
- works on Android, iOS, and Web,
- keeps Razorpay secrets server-side,
- credits wallet only after trusted verification,
- preserves existing wallet and batch deduction behavior,
- remains idempotent (no double credit even with retries/webhook replays).

This document is based on read-only analysis of current code and does not introduce runtime changes.

## Current Architecture Snapshot (As-Is)

### Frontend wallet and recharge surfaces
- `src/context/WalletContext.tsx`
- `src/features/wallet/WalletScreen.tsx`
- `src/components/ui/RechargeButton.tsx`
- `src/features/payments/TransactionHistoryScreen.tsx`

Current state:
- Wallet data is real-time via `wallets/{userId}` + `wallets/{userId}/transactions`.
- Real recharge path is currently blocked by context (`addBalanceToWallet` returns automation message).
- Dev-only top-up exists via `addTestBalance`.

### Wallet and billing services
- `src/services/walletService.ts`
- `src/services/ledgerService.ts`
- `src/services/batchService.ts`

Current state:
- Batch debit finalization currently happens client-side via `finalizeBatchBillingFromClient(batchId)` when completed batch is observed.
- `batchService.updateBatchStatus(..., 'completed')` calls `finalizeCompletedBatchBilling(batchId)` as a second path.
- Wallet transaction history now relies on wallet subcollection and supports `recharge` + `batch_debit` records.

### Security and data controls
- `firestore.rules`

Current state:
- Wallet owner read allowed for own wallet and wallet subcollection transactions.
- Wallet writes allow constrained user paths (including specific debit/recharge invariants).
- Global `transactions` collection is read-only for clients.

### Backend surface available today
- `api/proxy-demo.ts`
- `vercel.json`

Current state:
- A Vercel API folder already exists, so server endpoints for Razorpay can be added in this same deployment model.
- No existing payment gateway implementation or keys detected.

## Key Constraints and Risks to Respect

1. Never call Razorpay Secret from app code.
2. Never credit wallet directly from a client callback without server verification.
3. Preserve existing batch debit and reporting flows.
4. Prevent duplicate credits from webhook retries, client retries, or race conditions.
5. Keep Firestore writes atomic for wallet balance and wallet transaction entries.

## Proposed Target Architecture

## High-level flow

1. Client requests `create-order` from backend with amount.
2. Backend validates user and amount, creates Razorpay order via secret key.
3. Backend stores pending payment intent in Firestore and returns order details.
4. Client opens Razorpay checkout.
5. Razorpay returns payment response on client (best effort UX signal).
6. Razorpay sends webhook to backend (`payment.captured` / `order.paid`).
7. Backend verifies webhook signature and idempotently credits wallet in a transaction.
8. Backend updates payment intent status to `credited`.
9. Client wallet listener reflects updated balance and transaction history automatically.

## Trust model

- Source of truth for crediting: verified webhook + backend transaction.
- Client callback: UX-only and optional status polling trigger.
- Wallet mutation authority: backend route only (or admin service account), not raw client writes.

## Recommended Firestore Data Model Additions

Add a dedicated payment intent collection:

`paymentIntents/{intentId}`
- `intentId: string`
- `userId: string`
- `amount: number`
- `currency: 'INR'`
- `status: 'created' | 'checkout_opened' | 'payment_authorized' | 'payment_captured' | 'credited' | 'failed' | 'expired'`
- `razorpayOrderId: string`
- `razorpayPaymentId?: string`
- `webhookEventId?: string`
- `idempotencyKey: string`
- `clientMeta: { platform: 'android' | 'ios' | 'web' }`
- `createdAt`
- `updatedAt`
- `creditedAt?`
- `failureReason?`

Optional event log:

`paymentIntents/{intentId}/events/{eventId}`
- raw webhook metadata for audit/debug.

Wallet side (already exists):
- continue writing `wallets/{userId}`
- continue writing `wallets/{userId}/transactions/{txnId}` with `type: 'recharge'`

## Backend API Contract (Vercel API style)

Suggested endpoints:

1. `POST /api/payments/razorpay/create-order`
- Auth: required (Firebase ID token in `Authorization: Bearer`)
- Input:
```json
{
  "amount": 500,
  "currency": "INR",
  "platform": "android"
}
```
- Output:
```json
{
  "intentId": "pi_xxx",
  "orderId": "order_xxx",
  "amount": 50000,
  "currency": "INR",
  "keyId": "rzp_live_xxx"
}
```

2. `POST /api/payments/razorpay/verify-client`
- Auth: required
- Purpose: optional fast feedback after checkout callback.
- Must not credit wallet here unless server-side signature + intent state checks pass.

3. `POST /api/payments/razorpay/webhook`
- Auth: Razorpay signature header validation (HMAC with webhook secret)
- Purpose: primary settlement trigger.
- Action: idempotent wallet credit transaction + intent status progression.

4. `GET /api/payments/razorpay/intent/:intentId`
- Auth: required and owner-only
- Purpose: polling status from app while waiting for webhook completion.

## Idempotency and Anti-Double-Credit Design

Use all three layers:

1. Intent state lock:
- In a Firestore transaction, allow credit only if intent status is not already `credited`.

2. Deterministic wallet transaction ID:
- Use `recharge_{intentId}` as wallet transaction document id.
- If document already exists, treat as already credited.

3. Webhook event dedupe:
- Store processed Razorpay event ids (or payment ids) and ignore repeats.

Pseudo transaction logic:
- Load `paymentIntents/{intentId}`.
- Validate ownership, amount, order id, payment id, and current status.
- If already credited, return success (idempotent no-op).
- Update `wallets/{userId}`: `balance += amount`, `totalRecharged += amount`.
- Create `wallets/{userId}/transactions/recharge_{intentId}`.
- Mark intent `credited` with timestamps and refs.

## Platform Checkout Strategy

Android and iOS:
- Preferred: native Razorpay checkout SDK bridge compatible with Expo dev build (not Expo Go).
- Alternative: open hosted checkout URL in browser/WebView fallback if native bridge is deferred.

Web:
- Use Razorpay web checkout script with order id from backend.
- After callback, call `verify-client` and/or poll `intent` endpoint until status becomes `credited`.

Important:
- Keep one frontend abstraction, for example `startRecharge(amount)` in wallet service/context.
- Route internally by platform implementation.

## Firestore Rules Direction for Payment Intents

Add rules for `paymentIntents` such that:
- users can create only minimal draft fields if needed,
- users can read only their own intents,
- users cannot mark intent as credited,
- webhook/backend pathway is trusted writer for settlement fields.

If backend uses Firebase Admin SDK, rules are bypassed for admin operations. Still keep client rules strict to prevent misuse.

## Migration and Integration Plan (Phased)

Phase 1: Backend foundation
1. Add Razorpay server SDK and API routes.
2. Add auth verification middleware for Firebase tokens.
3. Add create-order + webhook routes with signature verification.
4. Add `paymentIntents` schema writes.

Phase 2: Wallet credit settlement
1. Implement idempotent credit transaction.
2. Write recharge transaction row into wallet subcollection.
3. Add observability logs and failure reason capture.

Phase 3: Frontend wiring
1. Replace automation alert path in recharge flow with `startRecharge` call.
2. Add checkout launch handling for Android/iOS/Web.
3. Add pending/processing UI states and retry guidance.

Phase 4: Hardening
1. Add replay attack tests and duplicate webhook tests.
2. Add amount tampering tests.
3. Add end-to-end smoke testing for all three platforms.

## User Inputs Required (Action Items From Your Side)

To execute this architecture, you must provide:

1. Razorpay account mode
- `test` now, `live` later.

2. Razorpay credentials
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

3. Public base URL
- Final HTTPS domain where Vercel API routes are reachable.
- Webhook URL to register in Razorpay dashboard:
  - `https://<your-domain>/api/payments/razorpay/webhook`

4. Recharge product policy
- Allowed min/max amount
- fixed packs vs custom amount
- GST/invoice requirements (if any)

5. Checkout branding info
- business name, logo, support contact, theme choices for checkout prefill.

6. Go-live compliance inputs
- legal display text (refund/cancellation/support)
- support email/phone used in checkout and receipts.

## Recommended Environment Variables

Server-side only:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Client-side (safe/public):
- `EXPO_PUBLIC_RAZORPAY_KEY_ID` (optional; can also be returned from backend create-order)
- `EXPO_PUBLIC_API_BASE_URL`

## Operational Notes

- Keep `addTestBalance` available in dev only until gateway rollout is stable.
- Do not remove existing batch debit logic during recharge integration.
- Recharge and batch-debit should converge in one wallet transaction timeline, which is already aligned with current UI.

## Success Criteria

1. User can recharge from Android/iOS/Web.
2. Wallet balance updates only after verified settlement.
3. Duplicate webhook/callback does not create duplicate credits.
4. Payment history shows deterministic recharge rows.
5. No Razorpay secret exists in app bundle.

## Next Implementation Step (When You Approve)

Implement backend-first in this order:
1. `/api/payments/razorpay/create-order`
2. `/api/payments/razorpay/webhook`
3. idempotent Firestore wallet credit transaction
4. frontend recharge button wiring to new flow


