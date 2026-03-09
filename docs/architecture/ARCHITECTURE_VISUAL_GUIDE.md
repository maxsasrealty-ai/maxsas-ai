<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Batch & Lead Architecture - Visual Guide

## ðŸ“Š Complete Data Flow Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      USER INTERFACE                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”‚
â”‚  â”‚  CSV/Paste/      â”‚  â”‚  Set Actions     â”‚                    â”‚
â”‚  â”‚  Image Import    â”‚  â”‚  Button Clicked  â”‚                    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â”‚
â”‚           â”‚                     â”‚                               â”‚
â”‚           â–¼                     â”‚                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚                               â”‚
â”‚  â”‚ Batch Detail Screen      â”‚  â”‚                               â”‚
â”‚  â”‚ Shows 6 Contacts         â”‚  â”‚                               â”‚
â”‚  â”‚ [Call Now] [Schedule]    â”‚  â”‚                               â”‚
â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”˜  â”‚                               â”‚
â”‚       â”‚                  â”‚     â”‚                               â”‚
â”‚       â”‚ DRAFT STATUS     â”‚     â”‚                               â”‚
â”‚       â–¼                  â–¼     â–¼                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                  â”‚
       â”‚ LOCAL ONLY       â”‚ CLICK
       â”‚ (No Firebase)    â”‚
       â”‚                  â–¼
       â”‚          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚          â”‚ Alert Dialog   â”‚
       â”‚          â”‚ Confirm Action â”‚
       â”‚          â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                   â”‚
       â”‚                   â–¼
       â”‚          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚          â”‚ saveBatchToFirebase()    â”‚
       â”‚          â”‚ FIREBASE WRITE HAPPENS  â”‚
       â”‚          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                     â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                             â”‚                            â”‚
                             â–¼                            â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ CREATE BATCH DOC   â”‚      â”‚ CREATE LEAD DOCS   â”‚
                    â”‚ (1 document)       â”‚      â”‚ (6 documents)      â”‚
                    â”‚                    â”‚      â”‚                    â”‚
                    â”‚ batches/           â”‚      â”‚ leads/             â”‚
                    â”‚  {batchId}         â”‚      â”‚  {leadId1}         â”‚
                    â”‚  â”œâ”€ batchId        â”‚      â”‚  â”œâ”€ leadId         â”‚
                    â”‚  â”œâ”€ userId         â”‚      â”‚  â”œâ”€ batchId â—„â”€â”    â”‚
                    â”‚  â”œâ”€ totalContacts  â”‚      â”‚  â”œâ”€ phone      â”‚    â”‚
                    â”‚  â”œâ”€ status         â”‚      â”‚  â”œâ”€ status     â”‚    â”‚
                    â”‚  â”œâ”€ action         â”‚      â”‚  â”œâ”€ attempts   â”‚    â”‚
                    â”‚  â”œâ”€ source         â”‚      â”‚  â””â”€ createdAt  â”‚    â”‚
                    â”‚  â”œâ”€ createdAt      â”‚      â”‚                â”‚    â”‚
                    â”‚  â””â”€ scheduleAt     â”‚      â”‚ {leadId2}      â”‚    â”‚
                    â”‚                    â”‚      â”‚  â”œâ”€ phone: ... â”‚    â”‚
                    â”‚ Status becomes:    â”‚      â”‚  â”œâ”€ batchId â—„â”€â”€â”¼â”€â”€â”€â”€â”¤
                    â”‚ "running" OR       â”‚      â”‚  â””â”€ ...        â”‚    â”‚
                    â”‚ "scheduled"        â”‚      â”‚                â”‚    â”‚
                    â”‚                    â”‚      â”‚ ... (6 total)  â”‚    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚                â”‚    â”‚
                           â–²                    â”‚ Each phone     â”‚    â”‚
                           â”‚                    â”‚ becomes a      â”‚    â”‚
                           â”‚                    â”‚ SEPARATE doc   â”‚    â”‚
                           â”‚                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
                           â”‚                           â–²              â”‚
                           â”‚                           â”‚              â”‚
                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                Atomic Write
```

---

## ðŸ”„ Status Transitions

```
DRAFT (Local Only)
   â”‚
   â”‚ User clicks "Call Now"
   â–¼
RUNNING (Firebase)
   â”‚
   â”œâ”€â”€â”€ All leads processed â”€â”€â–º COMPLETED
   â”‚
   â””â”€â”€â”€ Some leads failed â”€â”€â”€â”€â–º COMPLETED (with failures logged)

---

DRAFT (Local Only)
   â”‚
   â”‚ User clicks "Schedule"
   â–¼
SCHEDULED (Firebase)
   â”‚
   â”‚ Schedule time reached
   â–¼
RUNNING (Firebase)
   â”‚
   â””â”€â”€â”€ All leads processed â”€â”€â–º COMPLETED
```

---

## ðŸ“ Collection Structure

### BEFORE (Old Architecture)
```
batches/
  â””â”€â”€ {batchId}
      â”œâ”€â”€ batchId
      â”œâ”€â”€ userId
      â”œâ”€â”€ totalContacts
      â”œâ”€â”€ createdAt
      â””â”€â”€ contacts: [  â—„â”€â”€â”€ ALL CONTACTS IN ONE ARRAY
          { phone: "9876543211", ... },
          { phone: "8888837040", ... },
          { phone: "9876543211", ... },
          { phone: "9987654321", ... },
          ...
        ]
```

### AFTER (New Architecture) âœ…
```
batches/
  â””â”€â”€ {batchId}
      â”œâ”€â”€ batchId
      â”œâ”€â”€ userId
      â”œâ”€â”€ totalContacts: 6
      â”œâ”€â”€ status: "running"
      â”œâ”€â”€ createdAt
      â””â”€â”€ scheduleAt: null

leads/  â—„â”€â”€â”€ SEPARATE COLLECTION
  â”œâ”€â”€ {leadId1}
  â”‚   â”œâ”€â”€ leadId
  â”‚   â”œâ”€â”€ batchId â—„â”€â”€â”€ References the batch
  â”‚   â”œâ”€â”€ phone: "9876543211"
  â”‚   â”œâ”€â”€ status: "queued"
  â”‚   â”œâ”€â”€ createdAt
  â”‚   â”œâ”€â”€ lastActionAt: null
  â”‚   â””â”€â”€ attempts: 0
  â”‚
  â”œâ”€â”€ {leadId2}
  â”‚   â”œâ”€â”€ leadId
  â”‚   â”œâ”€â”€ batchId â—„â”€â”€â”€ Same batchId
  â”‚   â”œâ”€â”€ phone: "8888837040"
  â”‚   â”œâ”€â”€ status: "queued"
  â”‚   â””â”€â”€ ...
  â”‚
  â”œâ”€â”€ {leadId3}
  â”‚   â”œâ”€â”€ batchId â—„â”€â”€â”€ Same batchId
  â”‚   â”œâ”€â”€ phone: "9876543211"
  â”‚   â””â”€â”€ ...
  â”‚
  â”œâ”€â”€ {leadId4}
  â”‚   â”œâ”€â”€ batchId â—„â”€â”€â”€ Same batchId
  â”‚   â”œâ”€â”€ phone: "9987654321"
  â”‚   â””â”€â”€ ...
  â”‚
  â”œâ”€â”€ {leadId5}
  â”‚   â”œâ”€â”€ batchId â—„â”€â”€â”€ Same batchId
  â”‚   â””â”€â”€ ...
  â”‚
  â””â”€â”€ {leadId6}
      â”œâ”€â”€ batchId â—„â”€â”€â”€ Same batchId
      â””â”€â”€ ...

Total: 1 batch document + 6 lead documents = 7 documents
```

---

## ðŸ” Query Examples

### Get All Leads for a Batch
```
Query: leads collection
Filter: batchId == "a17c705e-6e0"

Returns: 6 documents
  â”œâ”€ Lead 1: phone: 9876543211, status: queued
  â”œâ”€ Lead 2: phone: 8888837040, status: queued
  â”œâ”€ Lead 3: phone: 9876543211, status: queued
  â”œâ”€ Lead 4: phone: 9987654321, status: queued
  â”œâ”€ Lead 5: phone: ..., status: queued
  â””â”€ Lead 6: phone: ..., status: queued
```

### Get Queued Leads (Ready to Call)
```
Query: leads collection
Filter: batchId == "a17c705e-6e0" AND status == "queued"

Returns: 6 documents (all are queued initially)
```

### Get Completed Leads
```
Query: leads collection
Filter: batchId == "a17c705e-6e0" AND status == "completed"

Returns: 2 documents (if 2 have been processed)
```

---

## ðŸ’¾ Firestore Write Example

### ONE Atomic Write Creates:

```typescript
writeBatch {
  SET batches/{batchId} = {
    batchId: "a17c705e-6e0",
    userId: "user-123",
    status: "running",
    action: "call_now",
    source: "csv",
    totalContacts: 6,
    createdAt: <timestamp>,
    scheduleAt: null
  }
  
  SET leads/{leadId1} = {
    leadId: "550e8400-e29b",
    batchId: "a17c705e-6e0",  â—„â”€â”€â”€ References batch
    phone: "9876543211",
    status: "queued",
    createdAt: <timestamp>,
    lastActionAt: null,
    attempts: 0
  }
  
  SET leads/{leadId2} = {
    leadId: "660e8400-e29b",
    batchId: "a17c705e-6e0",  â—„â”€â”€â”€ Same batchId
    phone: "8888837040",
    status: "queued",
    ...
  }
  
  ... (SET leads/{leadId3-6})
  
  COMMIT  â—„â”€â”€â”€ All 7 writes succeed or all fail (atomic)
}
```

---

## ðŸŽ¯ User Actions Timeline

```
TIME: 14:30
â”œâ”€ User imports CSV with 6 phone numbers
â”œâ”€ App creates LOCAL batch (no Firebase)
â”œâ”€ User sees batch in dashboard with "DRAFT" status
â”‚
â”œâ”€ User opens batch details
â”œâ”€ User sees all 6 phone numbers
â”‚
TIME: 14:35
â”œâ”€ User clicks "Call Now" button
â”œâ”€ App shows confirmation dialog
â”‚
TIME: 14:36
â”œâ”€ User taps "Confirm"
â”œâ”€ saveBatchToFirebase() called
â”œâ”€ Firebase creates 1 batch document âœ“
â”œâ”€ Firebase creates 6 lead documents âœ“
â”œâ”€ Batch status changes to "running"
â”œâ”€ User redirected to batch dashboard
â”‚
TIME: 14:37
â”œâ”€ Calling system picks up the batch
â”œâ”€ Reads batch document â†’ finds 6 contacts total
â”œâ”€ Queries leads where batchId == batch.id
â”œâ”€ Gets all 6 lead documents
â”œâ”€ Starts calling each number
â”œâ”€ Updates each lead status: queued â†’ calling â†’ completed
â”‚
TIME: 15:00
â””â”€ All 6 leads processed, batch marked completed
```

---

## ðŸ” Security in Action

### Scenario: Trying to Create a Lead Without batchId

```
Request: POST /leads with data {
  phone: "9876543211",
  status: "queued"
  // Missing: batchId âŒ
}

Firestore Rule Check:
  âœ“ User authenticated? YES
  âœ“ batchId != null? NO âŒ
  
Result: DENIED âŒ
Error: "Request.resource.data.batchId must not be null"
```

### Scenario: User Trying to Access Another User's Batch

```
Current User: "user-123"

Request: GET /batches/other-batch
  other-batch.userId = "user-456"

Firestore Rule Check:
  âœ“ User authenticated? YES
  âœ“ request.auth.uid == resource.data.userId?
    "user-123" == "user-456"? NO âŒ
  
Result: DENIED âŒ
Error: "Permission denied"
```

---

## ðŸ“ˆ Scalability Comparison

### Old Architecture (Embedded Array)
```
1 batch document with 100 contacts
â”œâ”€ Document size: ~10KB
â”œâ”€ Max contacts: ~1000 (Firestore 1MB limit)
â”œâ”€ Query: Must fetch entire batch with all contacts
â””â”€ Update: Must rewrite entire batch for 1 change
```

### New Architecture (Separate Documents) âœ…
```
1 batch document + 100 lead documents
â”œâ”€ Batch document: ~200 bytes
â”œâ”€ Each lead: ~200 bytes
â”œâ”€ Max contacts: UNLIMITED (infinite leads possible)
â”œâ”€ Query: Query specific leads, only fetch what needed
â””â”€ Update: Update individual leads, no rewriting batch
```

---

## ðŸ”„ Processing Pipeline

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  USER CLICKS "CALL NOW"                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
                     â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚ saveBatchToFirebase() â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â–¼                         â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ Create  â”‚            â”‚ Create 6 Lead   â”‚
   â”‚ 1 Batch â”‚            â”‚ Documents       â”‚
   â”‚ Documentâ”‚            â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜                     â”‚
        â”‚                          â”‚
        â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚         â”‚
        â–¼         â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ writeBatch.commit()      â”‚
   â”‚ (ALL-OR-NOTHING)         â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
     â–¼             â–¼
   SUCCESS      FAILURE
     â”‚             â”‚
     â–¼             â–¼
  BATCH         ROLLBACK
  CREATED       NO WRITES
  LEADS         AT ALL
  CREATED
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Calling/Scheduling System    â”‚
â”‚ (Reads from Firestore)       â”‚
â”‚                              â”‚
â”‚ 1. Read batch document       â”‚
â”‚ 2. Query leads by batchId    â”‚
â”‚ 3. Process each lead         â”‚
â”‚ 4. Update lead statuses      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“ Sample Documents

### Batch Document Example
```json
{
  "_id": "a17c705e-6e0-batch1",
  "batchId": "a17c705e-6e0-batch1",
  "userId": "user-123",
  "status": "running",
  "action": "call_now",
  "source": "csv",
  "totalContacts": 6,
  "createdAt": 1707023107,
  "scheduleAt": null
}
```

### Lead Documents (6 total)
```json
[
  {
    "_id": "550e8400-e29b-lead1",
    "leadId": "550e8400-e29b-lead1",
    "batchId": "a17c705e-6e0-batch1",
    "phone": "9876543211",
    "status": "queued",
    "createdAt": 1707023107,
    "lastActionAt": null,
    "attempts": 0
  },
  {
    "_id": "660e8400-e29b-lead2",
    "leadId": "660e8400-e29b-lead2",
    "batchId": "a17c705e-6e0-batch1",
    "phone": "8888837040",
    "status": "queued",
    "createdAt": 1707023107,
    "lastActionAt": null,
    "attempts": 0
  },
  ... (4 more leads with same batchId)
]
```

---

## âœ… Verification Checklist

When you create a batch and click "Call Now", verify:

- [ ] **Firestore Console â†’ batches collection**
  - [ ] See 1 new document with your batchId
  - [ ] Document has: batchId, userId, status="running", totalContacts=6

- [ ] **Firestore Console â†’ leads collection**
  - [ ] See 6 new documents
  - [ ] Each document has: leadId, batchId (same as batch), phone
  - [ ] All have status="queued"

- [ ] **App UI**
  - [ ] Batch status changes from "DRAFT" to "RUNNING"
  - [ ] All 6 phone numbers still visible
  - [ ] Batch dashboard shows 6 total contacts

- [ ] **Firebase Rules**
  - [ ] No permission denied errors
  - [ ] No missing field errors

---

## ðŸŽ“ Learning Path

1. **Understand the old way** â†’ See issues with embedded arrays
2. **Learn new architecture** â†’ See benefits of separate documents
3. **Study examples** â†’ Practice common operations
4. **Try it yourself** â†’ Create a batch, verify Firestore
5. **Debug issues** â†’ Use browser console and Firebase console

---

## ðŸ’¡ Key Takeaways

âœ… **1 Batch = 1 Document in batches collection**
- Metadata only (batchId, status, action, etc.)
- NO contacts array

âœ… **6 Contacts = 6 Separate Documents in leads collection**
- Each document is independent
- All reference the same batchId
- Can be processed/updated individually

âœ… **No Firebase writes before "Call Now" or "Schedule"**
- Draft batches live in React Context
- Local storage only
- Reduces Firebase costs

âœ… **Security enforced by rules**
- Every lead must have a batchId
- Users can only access their own data
- Orphaned leads impossible

âœ… **Unlimited Scalability**
- No array size limits
- Infinite leads per batch
- Efficient querying by batchId


