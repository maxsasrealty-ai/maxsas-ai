# Current Architecture

## App Layer
- Expo Router drives route groups for public, auth, tabs, enterprise, and admin surfaces.
- Screen components in `app/` remain thin and delegate behavior to feature and module layers in `src/`.
- Shared UI primitives are reused for consistent styling and reduced duplication.

## Context Layer
- Context providers handle global app state such as authentication, batches, and wallet/session state.
- Contexts expose strongly typed actions to screens and encapsulate cross-screen synchronization.
- Provider composition is mounted at root layout to make state accessible through the full route tree.

## Service Layer
- Service modules isolate external I/O and domain operations from screen components.
- Firebase/Firestore interactions are implemented in service/context boundaries instead of UI components.
- Domain services support batch processing, wallet updates, and lead state transitions.

## Firestore Data Model
- Core entities are stored in dedicated collections with references for user, batch, lead, and wallet ownership.
- Derived operational data (status, runtime metadata, and transaction history) is persisted for auditability.
- Collection-level separation supports scalable reads and role-specific dashboard queries.

## Batch Lead System
- Leads are ingested and grouped into batches before call execution.
- Batch lifecycle controls lead progression from queued to processed outcomes.
- Batch status updates and lead outcomes are surfaced to dashboards and reporting views.
