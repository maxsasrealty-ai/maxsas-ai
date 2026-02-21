# Firestore Security Rules - Quick Reference Card

## 🔐 Core Principle
**"Only authenticated users can access their own data"**

---

## ✅ BATCHES Collection Rules

### CREATE Batch
```
Conditions Required:
✅ User authenticated (request.auth != null)
✅ userId == auth.uid (ownership)
✅ batchId field == document ID
✅ status in ['running', 'scheduled', 'completed']
✅ action in ['call_now', 'schedule']
✅ source in ['manual', 'csv', 'clipboard', 'image']
✅ totalContacts > 0 and ≤ 10,000
✅ createdAt timestamp provided

Example:
{
  batchId: 'batch-123',
  userId: 'user-abc',          ← Must match current user
  status: 'running',           ← Must be valid
  action: 'call_now',          ← Must be valid
  source: 'clipboard',         ← Must be valid
  totalContacts: 45,           ← Must be > 0, ≤ 10,000
  createdAt: firebase.Timestamp.now()
}
```

### READ Batch
```
✅ User owns batch (userId == auth.uid)
  OR
✅ User has automation role (request.auth.token.role == 'automation')
```

### UPDATE Batch
```
Allowed:
✅ Change 'status' to valid value
✅ User owns batch OR has automation role

IMMUTABLE (Cannot change):
❌ userId
❌ batchId
❌ createdAt
```

### DELETE Batch
```
✅ User owns batch (userId == auth.uid)
```

---

## ✅ LEADS Collection Rules

### CREATE Lead ⚠️ MOST RESTRICTIVE
```
Conditions Required:
✅ User authenticated
✅ userId == auth.uid
✅ batchId != null
✅ Batch document MUST EXIST
  ► exists(/databases/.../batches/{batchId})
✅ Batch MUST belong to user
  ► get(.../batches/{batchId}).data.userId == auth.uid
✅ phone != null and phone != ''
✅ leadId field == document ID
✅ status == 'queued' (initial status only)
✅ createdAt timestamp provided

CRITICAL: If batch doesn't exist OR batch owner != user
         → CREATE FAILS

Example:
{
  leadId: 'lead-456',
  batchId: 'batch-123',              ← Batch MUST exist
  userId: 'user-abc',                ← Must match auth.uid
  phone: '+1-555-1234',              ← Cannot be empty
  name: 'John Doe',
  status: 'queued',                  ← Initial status only
  createdAt: firebase.Timestamp.now()
}
```

### READ Lead
```
✅ User owns lead (userId == auth.uid)
  OR
✅ User has automation role
```

### UPDATE Lead
```
Allowed:
✅ Change 'status' to valid value (queued → calling → completed)
✅ User owns lead OR has automation role

IMMUTABLE (Cannot change):
❌ leadId
❌ batchId
❌ userId
❌ createdAt
```

### DELETE Lead
```
✅ User owns lead (userId == auth.uid)
```

---

## 🚨 Security Checks Summary

| Check | Batch Create | Lead Create |
|-------|---|---|
| Authenticated | ✅ | ✅ |
| userId matches auth.uid | ✅ | ✅ |
| Valid enum values | ✅ | ✅ |
| Batch exists | N/A | ✅ CRITICAL |
| Batch owned by user | N/A | ✅ CRITICAL |
| Phone not empty | N/A | ✅ |
| Timestamp provided | ✅ | ✅ |

---

## ❌ What Gets REJECTED

### Batch Rejection Cases
```
❌ userid: 'different-user'        // Ownership violation
❌ status: 'draft'                 // Invalid status
❌ totalContacts: 0                // Must be > 0
❌ createdAt: null                 // Missing timestamp
❌ action: 'invalid'               // Invalid action
❌ Unauthenticated (no token)      // No auth
```

### Lead Rejection Cases
```
❌ batchId: 'nonexistent-batch'    // Batch doesn't exist
❌ batchId: (batch of user2)       // Wrong owner
❌ phone: null or ''               // Invalid phone
❌ userId: 'different-user'        // Ownership violation
❌ Unauthenticated (no token)      // No auth
❌ status: 'calling'               // Only 'queued' on create
```

---

## 🔄 Typical Workflow

### User Calls "Call Now" Button
```
1. BatchDetailScreen → saveBatchToFirebase()
   └─ Passes: batch object + 'call_now' action
   
2. BatchContext → saveBatchToFirebaseHandler()
   └─ Validates all 5 checks
   └─ Calls service layer
   
3. batchService → saveBatchToFirebase()
   └─ Creates batch document
      └─ Firestore Rules validate:
         ✅ User owns batch
         ✅ Valid status/action
         ✅ Valid contacts count
         ✅ BATCH CREATED ✅
   
   └─ Creates lead documents (one per contact)
      └─ Firestore Rules validate:
         ✅ Batch exists (just created)
         ✅ Batch owned by user (just created)
         ✅ Phone valid
         ✅ LEADS CREATED ✅

4. BatchContext → Updates local state
   └─ currentBatch status = 'running'
```

### Data Flow
```
UI Layer (BatchDetailScreen)
    ↓
Context Layer (BatchContext)
    ↓ [5 validation checks]
    ↓
Service Layer (batchService)
    ↓ [creates batch + leads]
    ↓
Firestore Rules
    ↓ [validates ownership + integrity]
    ↓
✅ SUCCESS: Batch + Leads saved
```

---

## 🛡️ Defense Layers

### Layer 1: UI Validation (BatchDetailScreen)
- Basic type checking
- Required field verification
- User feedback with alerts

### Layer 2: Context Validation (BatchContext)
- **STRICT 5-CHECK VALIDATION** ← Most important
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

## 🔑 Key Functions in Rules

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

## 📊 Status Values

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

## ✅ Deployment Checklist

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

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Lead creation fails | Check batch exists + belongs to user |
| Cannot read batch | Verify userId matches auth.uid |
| Cannot update status | Make sure status value is valid |
| Automation fails | Set custom claims: `{role: 'automation'}` |
| Permission denied | Check authentication + data ownership |

---

## 📝 Summary

**Batches**: Owner authentication + valid data
**Leads**: Owner auth + batch existence + batch ownership ✅
**Automation**: Special role with full access
**Immutable**: IDs, timestamps cannot change
**Enums**: Status, action, source must be valid values

**Golden Rule**: User can only access data where `userId == auth.uid`
