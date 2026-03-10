# n8n Automation

## Retry Calls
- n8n workflows can schedule retry attempts for unanswered/failed call outcomes.
- Retry logic uses bounded attempts and status-aware branching.

## Webhook Triggers
- Webhook events from calling pipeline trigger workflow automations.
- n8n routes payloads into downstream update and notification steps.

## Lead Updates
- Automation updates lead status, retry metadata, and next-action fields.
- Synchronized updates ensure dashboard consistency after asynchronous events.
