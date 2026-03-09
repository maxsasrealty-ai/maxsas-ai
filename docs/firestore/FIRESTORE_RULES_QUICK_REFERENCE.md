<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Firestore Security Rules - Quick Reference Card

## ðŸ” Core Principle
**"Only authenticated users can access their own data"**

---

## âœ… BATCHES Collection Rules

### CREATE Batch
```
Conditions Required:
âœ… User authenticated (request.auth != null)
âœ… userId == auth.uid (ownership)
âœ… batchId field == document ID
âœ… status in ['running', 'scheduled', 'completed']
âœ… action in ['call_now', 'schedule']
âœ… source in ['manual', 'csv', 'clipboard', 'image']
âœ… totalContacts > 0 and â‰¤ 10,000
âœ… createdAt timestamp provided

Example:
{
  batchId: 'batch-123',
  userId: 'user-abc',          â† Must match current user
  status: 'running',           â† Must be valid
  action: 'call_now',          â† Must be valid
  source: 'clipboard',         â† Must be valid
  totalContacts: 45,           â† Must be > 0, â‰¤ 10,000
  createdAt: firebase.Timestamp.now()
}
```

### READ Batch
```
âœ… User owns batch (userId == auth.uid)
  OR
âœ… User has automation role (request.auth.token.role == 'automation')
```

### UPDATE Batch
```
Allowed:
âœ… Change 'status' to valid value
âœ… User owns batch OR has automation role

IMMUTABLE (Cannot change):
âŒ userId
âŒ batchId
âŒ createdAt
```

### DELETE Batch
```
âœ… User owns batch (userId == auth.uid)
```

---

## âœ… LEADS Collection Rules

### CREATE Lead âš ï¸ MOST RESTRICTIVE
```
Conditions Required:
âœ… User authenticated
âœ… userId == auth.uid
âœ… batchId != null
âœ… Batch document MUST EXIST
  â–º exists(/databases/.../batches/{batchId})
âœ… Batch MUST belong to user
  â–º get(.../batches/{batchId}).data.userId == auth.uid
âœ… phone != null and phone != ''
âœ… leadId field == document ID
âœ… status == 'queued' (initial status only)
âœ… createdAt timestamp provided

CRITICAL: If batch doesn't exist OR batch owner != user
         â†’ CREATE FAILS

Example:
{
  leadId: 'lead-456',
  batchId: 'batch-123',              â† Batch MUST exist
  userId: 'user-abc',                â† Must match auth.uid
  phone: '+1-555-1234',              â† Cannot be empty
  name: 'John Doe',
  status: 'queued',                  â† Initial status only
  createdAt: firebase.Timestamp.now()
}
```

### READ Lead
```
âœ… User owns lead (userId == auth.uid)
  OR
âœ… User has automation role
```

### UPDATE Lead
```
Allowed:
âœ… Change 'status' to valid value (queued â†’ calling â†’ completed)
âœ… User owns lead OR has automation role

IMMUTABLE (Cannot change):
âŒ leadId
âŒ batchId
âŒ userId
âŒ createdAt
```

### DELETE Lead
```
âœ… User owns lead (userId == auth.uid)
```

---

## ðŸš¨ Security Checks Summary

| Check | Batch Create | Lead Create |
|-------|---|---|
| Authenticated | âœ… | âœ… |
| userId matches auth.uid | âœ… | âœ… |
| Valid enum values | âœ… | âœ… |
| Batch exists | N/A | âœ… CRITICAL |
| Batch owned by user | N/A | âœ… CRITICAL |
| Phone not empty | N/A | âœ… |
| Timestamp provided | âœ… | âœ… |

---

## âŒ What Gets REJECTED

### Batch Rejection Cases
```
âŒ userid: 'different-user'        // Ownership violation
âŒ status: 'draft'                 // Invalid status
âŒ totalContacts: 0                // Must be > 0
âŒ createdAt: null                 // Missing timestamp
âŒ action: 'invalid'               // Invalid action
âŒ Unauthenticated (no token)      // No auth
```

### Lead Rejection Cases
```
âŒ batchId: 'nonexistent-batch'    // Batch doesn't exist
âŒ batchId: (batch of user2)       // Wrong owner
âŒ phone: null or ''               // Invalid phone
âŒ userId: 'different-user'        // Ownership violation
âŒ Unauthenticated (no token)      // No auth
âŒ status: 'calling'               // Only 'queued' on create
```

---

## ðŸ”„ Typical Workflow

### User Calls "Call Now" Button
```
1. BatchDetailScreen â†’ saveBatchToFirebase()
   â””â”€ Passes: batch object + 'call_now' action
   
2. BatchContext â†’ saveBatchToFirebaseHandler()
   â””â”€ Validates all 5 checks
   â””â”€ Calls service layer
   
3. batchService â†’ saveBatchToFirebase()
   â””â”€ Creates batch document
      â””â”€ Firestore Rules validate:
         âœ… User owns batch
         âœ… Valid status/action
         âœ… Valid contacts count
         âœ… BATCH CREATED âœ…
   
   â””â”€ Creates lead documents (one per contact)
      â””â”€ Firestore Rules validate:
         âœ… Batch exists (just created)
         âœ… Batch owned by user (just created)
         âœ… Phone valid
         âœ… LEADS CREATED âœ…

4. BatchContext â†’ Updates local state
   â””â”€ currentBatch status = 'running'
```

### Data Flow
```
UI Layer (BatchDetailScreen)
    â†“
Context Layer (BatchContext)
    â†“ [5 validation checks]
    â†“
Service Layer (batchService)
    â†“ [creates batch + leads]
    â†“
Firestore Rules
    â†“ [validates ownership + integrity]
    â†“
âœ… SUCCESS: Batch + Leads saved
```

---

## ðŸ›¡ï¸ Defense Layers

### Layer 1: UI Validation (BatchDetailScreen)
- Basic type checking
- Required field verification
- User feedback with alerts

### Layer 2: Context Validation (BatchContext)
- **STRICT 5-CHECK VALIDATION** â† Most important
- Checks: batchId, contacts array, contact phones
- Shows detailed alerts on failure
- Prevents bad data from reaching service

### Layer 3: Service Validation (batchService)
- Re-validates (defense in depth)
- Firebase operation prep
- Error handling and logging

### Layer 4: Firestore Rules
- **FINAL SECURITY GATE**
- Checks ownership (userId == auth.uid)
- Validates data schema
- Protects against client tampering
- Prevents database corruption

---

## ðŸ”‘ Key Functions in Rules

### Helper Functions
```firestore
isAuthenticated()              // request.auth != null
isCurrentUser(userId)          // request.auth.uid == userId
isAutomation()                 // request.auth.token.role == 'automation'
isBatchOwner(batchId)          // Checks if user owns batch
batchExists(batchId)           // Checks batch document exists
isValidBatchStatus(status)     // Validates enum values
isValidLeadStatus(status)      // Validates enum values
```

### Critical Functions
```firestore
// These prevent orphaned leads
batchExists(request.resource.data.batchId)        // Batch MUST exist
isBatchOwner(request.resource.data.batchId)       // Batch MUST be owned by user
```

---

## ðŸ“Š Status Values

### Batch Status
Valid values: `'running'` | `'scheduled'` | `'completed'`
- `'running'` - Batch actively calling
- `'scheduled'` - Scheduled for future
- `'completed'` - All contacts processed

### Lead Status
Valid values: `'queued'` | `'calling'` | `'completed'`
- `'queued'` - Initial status
- `'calling'` - Currently on call
- `'completed'` - Call finished

### Batch Action
Valid values: `'call_now'` | `'schedule'`
- `'call_now'` - Immediate calling
- `'schedule'` - Scheduled batch

### Batch Source
Valid values: `'manual'` | `'csv'` | `'clipboard'` | `'image'`
- `'manual'` - Typed manually
- `'csv'` - From CSV file
- `'clipboard'` - Pasted from clipboard
- `'image'` - Extracted from image

---

## âœ… Deployment Checklist

1. **Local Testing**
   - [ ] All 14 tests pass in emulator

2. **Code Review**
   - [ ] Another developer reviews rules

3. **Deployment**
   - [ ] `firebase deploy --only firestore:rules`
   - [ ] Deployment successful in console

4. **Verification**
   - [ ] Rules visible in Firebase Console
   - [ ] No security warnings
   - [ ] Automation service has custom claims

5. **Monitoring**
   - [ ] No denied operations in first hour
   - [ ] No orphaned leads in database
   - [ ] User data isolation verified

---

## ðŸ†˜ Troubleshooting

| Problem | Solution |
|---------|----------|
| Lead creation fails | Check batch exists + belongs to user |
| Cannot read batch | Verify userId matches auth.uid |
| Cannot update status | Make sure status value is valid |
| Automation fails | Set custom claims: `{role: 'automation'}` |
| Permission denied | Check authentication + data ownership |

---

## ðŸ“ Summary

**Batches**: Owner authentication + valid data
**Leads**: Owner auth + batch existence + batch ownership âœ…
**Automation**: Special role with full access
**Immutable**: IDs, timestamps cannot change
**Enums**: Status, action, source must be valid values

**Golden Rule**: User can only access data where `userId == auth.uid`


