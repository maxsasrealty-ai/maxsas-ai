# Batch & Lead Architecture - Visual Guide

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                             │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  CSV/Paste/      │  │  Set Actions     │                    │
│  │  Image Import    │  │  Button Clicked  │                    │
│  └────────┬─────────┘  └────────┬─────────┘                    │
│           │                     │                               │
│           ▼                     │                               │
│  ┌──────────────────────────┐  │                               │
│  │ Batch Detail Screen      │  │                               │
│  │ Shows 6 Contacts         │  │                               │
│  │ [Call Now] [Schedule]    │  │                               │
│  └────┬──────────────────┬──┘  │                               │
│       │                  │     │                               │
│       │ DRAFT STATUS     │     │                               │
│       ▼                  ▼     ▼                               │
└─────────────────────────────────────────────────────────────────┘
       │                  │
       │ LOCAL ONLY       │ CLICK
       │ (No Firebase)    │
       │                  ▼
       │          ┌────────────────┐
       │          │ Alert Dialog   │
       │          │ Confirm Action │
       │          └────────┬───────┘
       │                   │
       │                   ▼
       │          ┌──────────────────────────┐
       │          │ saveBatchToFirebase()    │
       │          │ FIREBASE WRITE HAPPENS  │
       │          └──────────┬───────────────┘
       │                     │
       └─────────────────────┼────────────────────────────┐
                             │                            │
                             ▼                            ▼
                    ┌────────────────────┐      ┌────────────────────┐
                    │ CREATE BATCH DOC   │      │ CREATE LEAD DOCS   │
                    │ (1 document)       │      │ (6 documents)      │
                    │                    │      │                    │
                    │ batches/           │      │ leads/             │
                    │  {batchId}         │      │  {leadId1}         │
                    │  ├─ batchId        │      │  ├─ leadId         │
                    │  ├─ userId         │      │  ├─ batchId ◄─┐    │
                    │  ├─ totalContacts  │      │  ├─ phone      │    │
                    │  ├─ status         │      │  ├─ status     │    │
                    │  ├─ action         │      │  ├─ attempts   │    │
                    │  ├─ source         │      │  └─ createdAt  │    │
                    │  ├─ createdAt      │      │                │    │
                    │  └─ scheduleAt     │      │ {leadId2}      │    │
                    │                    │      │  ├─ phone: ... │    │
                    │ Status becomes:    │      │  ├─ batchId ◄──┼────┤
                    │ "running" OR       │      │  └─ ...        │    │
                    │ "scheduled"        │      │                │    │
                    │                    │      │ ... (6 total)  │    │
                    └────────────────────┘      │                │    │
                           ▲                    │ Each phone     │    │
                           │                    │ becomes a      │    │
                           │                    │ SEPARATE doc   │    │
                           │                    └────────────────┘    │
                           │                           ▲              │
                           │                           │              │
                           └───────────────────────────┴──────────────┘
                                Atomic Write
```

---

## 🔄 Status Transitions

```
DRAFT (Local Only)
   │
   │ User clicks "Call Now"
   ▼
RUNNING (Firebase)
   │
   ├─── All leads processed ──► COMPLETED
   │
   └─── Some leads failed ────► COMPLETED (with failures logged)

---

DRAFT (Local Only)
   │
   │ User clicks "Schedule"
   ▼
SCHEDULED (Firebase)
   │
   │ Schedule time reached
   ▼
RUNNING (Firebase)
   │
   └─── All leads processed ──► COMPLETED
```

---

## 📁 Collection Structure

### BEFORE (Old Architecture)
```
batches/
  └── {batchId}
      ├── batchId
      ├── userId
      ├── totalContacts
      ├── createdAt
      └── contacts: [  ◄─── ALL CONTACTS IN ONE ARRAY
          { phone: "9876543211", ... },
          { phone: "8888837040", ... },
          { phone: "9876543211", ... },
          { phone: "9987654321", ... },
          ...
        ]
```

### AFTER (New Architecture) ✅
```
batches/
  └── {batchId}
      ├── batchId
      ├── userId
      ├── totalContacts: 6
      ├── status: "running"
      ├── createdAt
      └── scheduleAt: null

leads/  ◄─── SEPARATE COLLECTION
  ├── {leadId1}
  │   ├── leadId
  │   ├── batchId ◄─── References the batch
  │   ├── phone: "9876543211"
  │   ├── status: "queued"
  │   ├── createdAt
  │   ├── lastActionAt: null
  │   └── attempts: 0
  │
  ├── {leadId2}
  │   ├── leadId
  │   ├── batchId ◄─── Same batchId
  │   ├── phone: "8888837040"
  │   ├── status: "queued"
  │   └── ...
  │
  ├── {leadId3}
  │   ├── batchId ◄─── Same batchId
  │   ├── phone: "9876543211"
  │   └── ...
  │
  ├── {leadId4}
  │   ├── batchId ◄─── Same batchId
  │   ├── phone: "9987654321"
  │   └── ...
  │
  ├── {leadId5}
  │   ├── batchId ◄─── Same batchId
  │   └── ...
  │
  └── {leadId6}
      ├── batchId ◄─── Same batchId
      └── ...

Total: 1 batch document + 6 lead documents = 7 documents
```

---

## 🔍 Query Examples

### Get All Leads for a Batch
```
Query: leads collection
Filter: batchId == "a17c705e-6e0"

Returns: 6 documents
  ├─ Lead 1: phone: 9876543211, status: queued
  ├─ Lead 2: phone: 8888837040, status: queued
  ├─ Lead 3: phone: 9876543211, status: queued
  ├─ Lead 4: phone: 9987654321, status: queued
  ├─ Lead 5: phone: ..., status: queued
  └─ Lead 6: phone: ..., status: queued
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

## 💾 Firestore Write Example

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
    batchId: "a17c705e-6e0",  ◄─── References batch
    phone: "9876543211",
    status: "queued",
    createdAt: <timestamp>,
    lastActionAt: null,
    attempts: 0
  }
  
  SET leads/{leadId2} = {
    leadId: "660e8400-e29b",
    batchId: "a17c705e-6e0",  ◄─── Same batchId
    phone: "8888837040",
    status: "queued",
    ...
  }
  
  ... (SET leads/{leadId3-6})
  
  COMMIT  ◄─── All 7 writes succeed or all fail (atomic)
}
```

---

## 🎯 User Actions Timeline

```
TIME: 14:30
├─ User imports CSV with 6 phone numbers
├─ App creates LOCAL batch (no Firebase)
├─ User sees batch in dashboard with "DRAFT" status
│
├─ User opens batch details
├─ User sees all 6 phone numbers
│
TIME: 14:35
├─ User clicks "Call Now" button
├─ App shows confirmation dialog
│
TIME: 14:36
├─ User taps "Confirm"
├─ saveBatchToFirebase() called
├─ Firebase creates 1 batch document ✓
├─ Firebase creates 6 lead documents ✓
├─ Batch status changes to "running"
├─ User redirected to batch dashboard
│
TIME: 14:37
├─ Calling system picks up the batch
├─ Reads batch document → finds 6 contacts total
├─ Queries leads where batchId == batch.id
├─ Gets all 6 lead documents
├─ Starts calling each number
├─ Updates each lead status: queued → calling → completed
│
TIME: 15:00
└─ All 6 leads processed, batch marked completed
```

---

## 🔐 Security in Action

### Scenario: Trying to Create a Lead Without batchId

```
Request: POST /leads with data {
  phone: "9876543211",
  status: "queued"
  // Missing: batchId ❌
}

Firestore Rule Check:
  ✓ User authenticated? YES
  ✓ batchId != null? NO ❌
  
Result: DENIED ❌
Error: "Request.resource.data.batchId must not be null"
```

### Scenario: User Trying to Access Another User's Batch

```
Current User: "user-123"

Request: GET /batches/other-batch
  other-batch.userId = "user-456"

Firestore Rule Check:
  ✓ User authenticated? YES
  ✓ request.auth.uid == resource.data.userId?
    "user-123" == "user-456"? NO ❌
  
Result: DENIED ❌
Error: "Permission denied"
```

---

## 📈 Scalability Comparison

### Old Architecture (Embedded Array)
```
1 batch document with 100 contacts
├─ Document size: ~10KB
├─ Max contacts: ~1000 (Firestore 1MB limit)
├─ Query: Must fetch entire batch with all contacts
└─ Update: Must rewrite entire batch for 1 change
```

### New Architecture (Separate Documents) ✅
```
1 batch document + 100 lead documents
├─ Batch document: ~200 bytes
├─ Each lead: ~200 bytes
├─ Max contacts: UNLIMITED (infinite leads possible)
├─ Query: Query specific leads, only fetch what needed
└─ Update: Update individual leads, no rewriting batch
```

---

## 🔄 Processing Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                  USER CLICKS "CALL NOW"                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ saveBatchToFirebase() │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   ┌─────────┐            ┌─────────────────┐
   │ Create  │            │ Create 6 Lead   │
   │ 1 Batch │            │ Documents       │
   │ Document│            └────────┬────────┘
   └────┬────┘                     │
        │                          │
        │         ┌────────────────┘
        │         │
        ▼         ▼
   ┌──────────────────────────┐
   │ writeBatch.commit()      │
   │ (ALL-OR-NOTHING)         │
   └────────┬─────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
   SUCCESS      FAILURE
     │             │
     ▼             ▼
  BATCH         ROLLBACK
  CREATED       NO WRITES
  LEADS         AT ALL
  CREATED
     │
     ▼
┌──────────────────────────────┐
│ Calling/Scheduling System    │
│ (Reads from Firestore)       │
│                              │
│ 1. Read batch document       │
│ 2. Query leads by batchId    │
│ 3. Process each lead         │
│ 4. Update lead statuses      │
└──────────────────────────────┘
```

---

## 📝 Sample Documents

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

## ✅ Verification Checklist

When you create a batch and click "Call Now", verify:

- [ ] **Firestore Console → batches collection**
  - [ ] See 1 new document with your batchId
  - [ ] Document has: batchId, userId, status="running", totalContacts=6

- [ ] **Firestore Console → leads collection**
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

## 🎓 Learning Path

1. **Understand the old way** → See issues with embedded arrays
2. **Learn new architecture** → See benefits of separate documents
3. **Study examples** → Practice common operations
4. **Try it yourself** → Create a batch, verify Firestore
5. **Debug issues** → Use browser console and Firebase console

---

## 💡 Key Takeaways

✅ **1 Batch = 1 Document in batches collection**
- Metadata only (batchId, status, action, etc.)
- NO contacts array

✅ **6 Contacts = 6 Separate Documents in leads collection**
- Each document is independent
- All reference the same batchId
- Can be processed/updated individually

✅ **No Firebase writes before "Call Now" or "Schedule"**
- Draft batches live in React Context
- Local storage only
- Reduces Firebase costs

✅ **Security enforced by rules**
- Every lead must have a batchId
- Users can only access their own data
- Orphaned leads impossible

✅ **Unlimited Scalability**
- No array size limits
- Infinite leads per batch
- Efficient querying by batchId
