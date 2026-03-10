# Frontend Architecture

## Expo Router Navigation
- Route groups separate public, auth, onboarding, user, enterprise, and admin experiences.
- Typed navigation paths are used for predictable redirects and role-based entry points.
- Root layout hosts global providers and environment-level developer tooling.

## Feature Modules
- Functional domains are organized into `src/features` and `src/modules` for clear ownership.
- Module boundaries isolate enterprise/admin capabilities from core user screens.
- Shared hooks and UI components reduce coupling across feature implementations.

## Context Providers
- Auth, batch, and wallet providers coordinate cross-screen state.
- Context actions abstract side effects and data mutations behind typed APIs.
- Provider layering ensures app-wide access while keeping feature code focused.

## Dashboard Screens
- Dashboards expose role-oriented summaries and workflow entry points.
- User dashboard focuses on leads, batches, and usage visibility.
- Enterprise and admin dashboards provide management, analytics, and control-plane operations.
