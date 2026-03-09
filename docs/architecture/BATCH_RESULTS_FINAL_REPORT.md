<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Batch & Lead UI Architecture â€” Final Report

Date: 2026-03-05
Scope: Read-only analysis of existing app flow, routes, screens, state handling, retry/delete controls, and best insertion point for a new Batch Results screen.    

---

## 1) Route & Navigation Architecture

### Root Stack (global routes)
Defined in `app/_layout.tsx`.

Key registered routes relevant to batch/lead flow:
- `batch-dashboard`
- `batch-detail`
- `imports`
- `upload-leads`
- `image-import`
- `paste-leads`
- `batch-charges`
- `batch-billing-detail`
- `lead/[id]`

### Tab Shell
Defined in `app/(tabs)/_layout.tsx` with tabs:
- `index` (Home)
- `leads`
- `wallet`
- `notifications`
- `reports`
- `profile`

Auth/profile gating:
- unauthenticated -> `/login`
- incomplete profile -> `/(onboarding)/name`
- default authenticated landing -> `/(tabs)`

Bootstrap redirect logic is in `app/index.tsx`.

---

## 2) Screen Map (Batch/Lead Journey)

### Primary operational screens
- `src/features/leads/LeadsScreen.tsx`
  - Batch listing screen with status tabs (`all`, `draft`, `scheduled`, `running`, `completed`)
  - Opens batch detail by `batchId`
  - FAB opens imports flow

- `src/features/leads/BatchDashboard.tsx`
  - Real-time batch command center
  - Shows per-batch card, live counters, Call Now CTA, View CTA
  - Opens `batch-detail`

- `src/features/leads/BatchDetailScreen.tsx`
  - Deep operational screen for one batch
  - Real-time lead list, progress, filtering, retry, delete/finalize behavior
  - Billing detail shortcut exists here

### Batch creation/import pipeline screens
- `src/features/leads/ImportsScreen.tsx` (method chooser)
- `src/features/leads/AddLeadScreen.tsx` + `useAddLead.ts`
- `src/features/leads/PasteLeadsScreen.tsx`
- `src/features/leads/UploadLeadsScreen.tsx`
- `src/features/leads/ImageImportScreen.tsx`

All import/create paths eventually route to `/batch-dashboard` after local batch creation.

---

## 3) End-to-End UI Flow (Current)

1. User lands in tabs (after auth/profile checks).
2. User goes to Leads or Dashboard.
3. User imports/creates leads using Imports flow.
4. App creates batch draft/local batch and shows it on dashboard/list.
5. User starts calling (`Call Now`) from Dashboard.
6. User monitors batch and leads in Batch Detail (live updates).
7. User performs retry/delete actions from Retry tab.
8. Batch eventually reaches terminal state (`completed`) with processing lock.
9. User may open billing views (`batch-charges` / `batch-billing-detail`) for cost breakdown.

---

## 4) State & Data Responsibilities

### Contexts/providers
- `AuthProvider`: authentication/session state
- `BatchProvider`: batch list retrieval and related operations
- `WalletProvider`: balance/charge checks

### Batch detail live state
`BatchDetailScreen` handles:
- local UI filter state (`pending`, `completed`, `failed`, `retrying`, `junk`)
- live leads array (`liveLeads`)
- retry/delete loading flags
- completion reconciliation logic

Live lead updates come from lead subscription (`subscribeToBatchLeads`), so the screen is the main runtime control surface.

---

## 5) Status Visual System (Current)

### Batch-level status usage
Observed statuses across screens:
- `draft`
- `scheduled`
- `running`
- `completed`
- `failed`

These are shown as status badges and conditional info strips in Leads/Dashboard/Detail.

### Lead-level status usage
Observed lead statuses and related fields:
- `queued`
- `calling`
- `completed`
- `failed_retryable`
- `failed_permanent`
- legacy checks for generic `failed`

Auxiliary fields drive business meaning:
- `callStatus`
- `aiDisposition`
- `retryCount`
- `nextRetryAt`

---

## 6) Retry/Delete Controls â€” Actual Placement & Behavior

Main location: `BatchDetailScreen.tsx`

### Retry controls
- Single retry action in lead row (Retry tab)
- Bulk retry action: `Retry All`

### Delete controls (latest behavior)
- Single delete action in Retry tab rows
- Bulk delete action: `Delete All` (targets retrying leads)

### Important implementation behavior
Delete now follows soft-finalization (no document deletion):
- sets final lead state (e.g., `failed_permanent`, `callStatus: completed`, `aiDisposition: user_deleted`)
- clears retry/lock scheduling fields
- updates local live list and re-checks batch completion criteria

This aligns runtime behavior with billing/reconciliation needs and avoids physically removing lead docs.

---

## 7) Existing Summary/Result-Type Screens

### Financial summary screens (already present)
- `src/features/payments/BatchChargesScreen.tsx`
  - Lists completed batches and aggregate charges
- `src/features/payments/BatchBillingDetailScreen.tsx`
  - Per-lead cost rows for one batch

Repository filter (`batchChargesRepository`) listens only to batches where status is `completed`.

### Gap identified
There is no dedicated operational "Batch Results" screen focused on call outcomes/conversion summary for business review.
Current operational summary is spread across Batch Detail + billing screens.

---

## 8) Recommended Insertion Point for New Batch Results Screen

## Primary recommendation
Insert new screen right after completion context from `BatchDetailScreen`.

Why this is best:
- Batch Detail already owns terminal reconciliation logic.
- It already knows when batch is truly resolved/completed.
- It already has the richest lead-level context for final classification.

### Secondary entry points (optional)
- From Completed tab in `LeadsScreen`
- From completed cards in `BatchDashboard`

But Batch Detail should remain the canonical transition point to avoid fragmented logic.

---

## 9) MVP Contract for New Batch Results Screen

### Route
- New stack route: `/batch-results`
- Params:
  - `batchId` (required)
  - `source` (optional; e.g. `batch-detail`, `leads`, `dashboard`)

### Data contract
For selected `batchId`, screen should show:
- Batch metadata: id, status, created/completed timestamp
- KPI summary:
  - Total leads
  - Completed/Connected leads
  - Failed leads
  - Success rate
- Outcome distribution by final reason (`aiDisposition` mapping)
- Lead-level final rows (phone + final status + reason)

### UI sections (minimal)
1. Header: Batch Results + short batch id
2. KPI cards row
3. Outcome breakdown list
4. Lead results list
5. Footer actions:
   - Back to Batch Detail
   - View Billing Detail

### State handling
- Loading state
- Empty state
- Error state with retry
- Non-terminal guard banner (if batch still running)

### Navigation behavior
- Show `View Results` CTA in Batch Detail when batch is completed/locked.
- Reuse existing billing detail route for financial drill-down.

---

## Conclusion

The current architecture is already mature for live operations (import -> run -> monitor -> retry/delete -> finalize).
The missing piece is a dedicated, user-facing operational results screen.

Best path: add a minimal `/batch-results` screen anchored to `BatchDetailScreen` terminal state, then optionally expose it from Completed lists in Leads/Dashboard.

This gives a clean post-call review layer without disturbing existing retry/billing workflows.


