# Batch Engine

## Core Entities
- Batch: container for a grouped set of leads and processing metadata.
- Lead: atomic calling unit with contact details and execution status.

## Status Lifecycle
- Typical lifecycle includes draft, queued, processing, completed, and failed/cancelled states.
- Lead-level outcomes roll up into aggregate batch progress and completion summaries.

## Batch Processing Flow
- Leads are imported and validated.
- System groups leads into a batch and marks dispatch readiness.
- Calling workflow processes leads and updates per-lead outcomes.
- Batch status is finalized when completion criteria are met.
