# CURRENT ARCHITECTURE BASELINE

Last Updated: 2026-03-08
Scope: Maxsas-AI workspace

## Overview
Maxsas-AI is an Expo Router based React Native application with Firebase-backed data flows, payments integration, and supporting API endpoints. The codebase is organized by route-first app screens and domain-oriented services under `src/`.

## Top-Level Architecture
- Mobile/Web client: Expo + React Native + Expo Router (`app/`)
- Domain and data services: TypeScript modules (`src/services/`, `src/context/`, `src/lib/`, `src/utils/`)
- API layer: lightweight server endpoints and helpers (`api/`)
- Firebase configuration and rules: root config files (`firebase.json`, `firestore.rules`, `firestore.indexes.json`)
- Native Android project: `android/`
- Operational scripts and migrations: `scripts/`
- Product and engineering documentation: `docs/`

## Route Layer (`app/`)
Key routes and groups:
- Auth and onboarding groups: `app/(auth)/`, `app/(onboarding)/`
- Tabbed app shell: `app/(tabs)/`
- Lead flows: `app/lead/`, `app/follow-up-schedule.tsx`, `app/scheduled-follow-ups.tsx`
- Batch flows: `app/batch-dashboard.tsx`, `app/batch-detail.tsx`, `app/batch-results.tsx`, `app/batch-charges.tsx`, `app/batch-billing-detail.tsx`
- Import and intake flows: `app/imports.tsx`, `app/paste-leads.tsx`, `app/upload-leads.tsx`, `app/image-import.tsx`, `app/attach-file.tsx`
- Payment and ledger views: `app/payment-history.tsx`, `app/transaction-history.tsx`
- User/system views: `app/settings.tsx`, `app/feedback.tsx`, `app/demo-transcript.tsx`

## Source Layer (`src/`)
- `src/services/`: core business services
  - `batchService.ts`
  - `leadService.ts`
  - `notificationService.ts`
  - `walletService.ts`
  - `ledgerService.ts`
  - `pricingService.ts`
  - `razorpayCheckoutService.ts`
  - `demoCallService.ts`
  - `systemService.ts`
  - `userService.ts`
  - `geminiExtractor.ts`
- `src/context/`: shared app state and providers
- `src/components/`: reusable UI components
- `src/features/`: feature-oriented modules
- `src/lib/`: integration and low-level utilities
- `src/types/`: domain and API type definitions
- `src/utils/`: helper utilities
- `src/config/`, `src/theme/`, `src/hooks/`, `src/data/`, `src/examples/`: support layers

## API Layer (`api/`)
- Entry and demo/proxy handlers: `api/proxy-demo.ts`
- Payments endpoints: `api/payments/`
- Shared server helpers: `api/_lib/`

## Platform and Tooling
- Runtime: Expo SDK 54, React Native 0.81, React 19
- Language/tooling: TypeScript, ESLint, Jest
- Firebase SDKs: client (`firebase`) and admin (`firebase-admin`)
- Payment integration: Razorpay (`razorpay`)
- Document/data utilities: `xlsx`, `pdfjs-dist`

## Data and Security
- Firestore security policy: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Firebase project config: `firebase.json`
- Security tests: `FIRESTORE_SECURITY_RULES_TESTS.ts`

## Scripts and Ops
- Migration and verification scripts exist under `scripts/`, including batch field migrations and endpoint verification helpers.
- Build and run commands are driven via `package.json` scripts.

## Canonical Commands
- Install dependencies: `npm install`
- Start app: `npm run start`
- Android: `npm run android`
- Web: `npm run web`
- Lint: `npm run lint`
- Test: `npm run test`

## Documentation Sync Policy
All markdown documents should align with this baseline. If implementation changes, update this file first, then update dependent docs.
