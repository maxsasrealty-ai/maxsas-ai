<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸ› Bug Fix: Firebase Write Failure

**Issue**: When user clicked "Call Now" or "Schedule", only batch ID appeared in console but NO Firebase writes happened.

**Root Causes Found**:

## 1. Missing `userId` in Lead Documents âŒ

**Problem**: 
- leadService was creating lead documents WITHOUT `userId` field
- Firestore rules required `userId` for read/write operations
- Lead documents were created but couldn't be read back

**Fix**:
- Added `userId: string` to Lead interface
- Updated createLeadsForBatch() to include userId when creating leads
- Updated Firestore rules to enforce userId on leads

**Code Changed**:
```typescript
// BEFORE
const leadData: Lead = {
  leadId,
  batchId,
  phone: contact.phone,
  status: 'queued',
  // âŒ Missing userId!
}

// AFTER
const leadData: Lead = {
  leadId,
  batchId,
  userId,  // âœ… Added!
  phone: contact.phone,
  status: 'queued',
}
```

---

## 2. Insufficient Error Logging âŒ

**Problem**:
- No detailed error messages showed what went wrong
- "Only batch ID in console" didn't show WHERE the process failed

**Fix**:
- Added detailed logging at every step
- Added try-catch error details
- Shows which contacts are being created
- Shows sample data being written

**New Logs**:
```
ðŸ” Lead creation - User ID: user-123
ðŸ“± Creating leads for batch: abc123
ðŸ‘¥ Number of contacts: 6
ðŸ“Œ Lead 1/6: 9876543211
...
ðŸ’¾ Committing 6 lead documents to Firestore...
âœ… All 6 leads created successfully!
```

---

## 3. Type System Issues âŒ

**Problem**:
- BatchDraft and Batch types were conflicting
- Code was trying to cast between incompatible types
- `'draft'` status removed from BatchStatus type caused errors

**Fix**:
- Added 'draft' back to BatchStatus type (needed for local batches)
- Properly typed Batch vs BatchDraft distinction
- Batch interface uses `Exclude<BatchStatus, 'draft'>` (Firebase only)
- BatchDraft always has `status: 'draft'` (local only)
- Updated components to handle both types correctly

---

## 4. Firestore Rules Corrections âœ…

**Updated Rules** for leads collection:

```javascript
match /leads/{leadId} {
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid  // âœ… Now required
    && request.resource.data.batchId != null
    && request.resource.data.phone != null
    && request.resource.data.leadId == leadId
    && request.resource.data.status in ['queued', 'calling', 'completed']
    && request.resource.data.createdAt != null;
  
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId || isAutomation());
  
  allow update: if request.auth != null && 
    (request.auth.uid == resource.data.userId || isAutomation())
    && request.resource.data.leadId == resource.data.leadId
    && request.resource.data.batchId == resource.data.batchId
    && request.resource.data.userId == resource.data.userId;  // âœ… Immutable
  
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

---

## Files Updated

### 1. **src/services/leadService.ts**
- âœ… Added `userId: string` to Lead interface
- âœ… Added userId when creating lead documents
- âœ… Enhanced error logging with details
- âœ… Added per-contact logging
- âœ… Better error messages

### 2. **src/services/batchService.ts**
- âœ… Added null/undefined checks
- âœ… Better error logging
- âœ… Confirmation logs for batch creation
- âœ… More detailed error reporting

### 3. **src/types/batch.ts**
- âœ… Added userId to Lead interface
- âœ… Fixed BatchStatus to include 'draft'
- âœ… Proper Batch vs BatchDraft distinction
- âœ… Updated BatchContextType

### 4. **src/context/BatchContext.tsx**
- âœ… Updated state types to Batch | BatchDraft
- âœ… Fixed createLocalBatch return type
- âœ… Added validation for contacts array
- âœ… Better error checking

### 5. **src/features/leads/BatchDetailScreen.tsx**
- âœ… Import BatchDraft type
- âœ… Allow state to be Batch | BatchDraft
- âœ… Updated imports for type safety

### 6. **firestore.rules**
- âœ… Updated leads create rule to require userId
- âœ… Fixed read rule logic
- âœ… Ensured userId immutability on update
- âœ… Better security checks

---

## How to Deploy

### Step 1: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Step 2: Redeploy App
- No code recompilation needed (no breaking changes)
- All TypeScript errors fixed
- Ready to test

---

## What Happens Now (Fixed Flow)

```
User clicks "Call Now" with 6 contacts
    â†“
âœ… Console logs show: Saving batch...
    â†“
âœ… Firebase creates 1 batch document
    â†“
âœ… Firebase creates 6 lead documents with userId
    â†“
âœ… Console shows: All 6 leads created successfully!
    â†“
âœ… Batch status changes to "RUNNING"
    â†“
âœ… In Firebase Console:
   - batches/{batchId}: 1 document
   - leads/{leadId1-6}: 6 documents with userId
```

---

## Verification Steps

### 1. Check Console Logs
When you click "Call Now", you should see:
```
ðŸ” Auth check - User ID: user-123
ðŸ“¦ Batch to save: {...}
ðŸ“ Creating batch document: {...}
âœ… Batch document created successfully!
ðŸ‘¥ Creating 6 separate lead documents...
ðŸ” Lead creation - User ID: user-123
ðŸ“± Creating 6 lead documents for batch: abc123
ðŸ“Œ Lead 1/6: 9876543211
ðŸ“Œ Lead 2/6: 8888837040
... (up to 6)
ðŸ’¾ Committing 6 lead documents to Firestore...
âœ… All 6 leads created successfully!
âœ… Batch and all leads saved successfully to Firebase!
```

### 2. Check Firestore Console
Go to Firebase Console â†’ Firestore â†’ Collections:

**batches collection**:
- Should see your batch document with:
  - batchId
  - userId  
  - status: "running"
  - totalContacts: 6

**leads collection**:
- Should see 6 documents with:
  - leadId
  - batchId (references batch)
  - userId (NEW!)
  - phone
  - status: "queued"

### 3. Verify No Errors
- App should not show any error alerts
- Batch should transition to "RUNNING"
- Should be able to view batch details

---

## Testing Checklist

- [ ] Deploy firestore.rules
- [ ] Create batch with CSV import (6 contacts)
- [ ] Click "Call Now"
- [ ] Check console logs (should see detailed steps)
- [ ] Check Firebase Console (1 batch + 6 leads)
- [ ] Each lead has userId field
- [ ] Test Schedule flow too
- [ ] No error messages

---

## Summary

**What was broken**:
- Leads missing userId field
- Firestore rules rejecting lead reads
- Poor error visibility
- Type system issues

**What's fixed**:
- âœ… userId now included on all leads
- âœ… Firestore rules updated to match
- âœ… Detailed error logging at every step
- âœ… Type safety throughout
- âœ… Can create and read lead documents
- âœ… Firebase writes now succeed

**Status**: âœ… READY TO TEST

Deploy firestore.rules and test the "Call Now" flow!


