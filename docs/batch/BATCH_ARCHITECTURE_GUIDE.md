<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Batch-Based Storage Architecture Implementation

## Overview
Implemented a proper two-collection Firestore architecture for managing batches and leads.

---

## Architecture

### Collections Structure

```
Firestore Database
â”œâ”€â”€ batches (collection)
â”‚   â””â”€â”€ {batchId} (document)
â”‚       â”œâ”€â”€ batchId: string
â”‚       â”œâ”€â”€ userId: string (who owns this batch)
â”‚       â”œâ”€â”€ totalContacts: number
â”‚       â”œâ”€â”€ status: "queued" | "scheduled" | "running" | "completed"
â”‚       â”œâ”€â”€ action: "call_now" | "schedule"
â”‚       â”œâ”€â”€ source: "manual" | "csv" | "clipboard" | "image"
â”‚       â”œâ”€â”€ createdAt: timestamp
â”‚       â””â”€â”€ scheduleAt: timestamp | null
â”‚
â””â”€â”€ leads (collection)
    â”œâ”€â”€ {leadId1} (document)
    â”‚   â”œâ”€â”€ leadId: string
    â”‚   â”œâ”€â”€ batchId: string (reference to batch)
    â”‚   â”œâ”€â”€ phone: string
    â”‚   â”œâ”€â”€ status: "queued" | "calling" | "completed"
    â”‚   â”œâ”€â”€ createdAt: timestamp
    â”‚   â”œâ”€â”€ lastActionAt: timestamp | null
    â”‚   â””â”€â”€ attempts: number
    â”‚
    â”œâ”€â”€ {leadId2} (document)
    â”‚   â”œâ”€â”€ leadId: string
    â”‚   â”œâ”€â”€ batchId: string (reference to batch)
    â”‚   â”œâ”€â”€ phone: string
    â”‚   â””â”€â”€ ...
    â”‚
    â””â”€â”€ {leadIdN} (document)
        â””â”€â”€ ...
```

### Key Principles

1. **ONE Batch Document**: Each batch is stored as a single document in the `batches` collection
2. **SEPARATE Lead Documents**: Each phone number is a separate document in the `leads` collection
3. **No Embedded Arrays**: Leads are NOT stored as an array inside batch documents
4. **Proper References**: Every lead document contains a `batchId` field that references its batch
5. **No Draft Storage**: Draft batches are stored locally only - NO Firebase writes until user takes action

---

## Data Flow

### Step 1: User Extracts Contacts (Local Only)
```
User uploads CSV / Pastes data / Extracts from image
â†“
App creates LOCAL batch draft with contacts array
â†“
Stored in React Context - NOT in Firestore
â†“
User sees batch in "Batch Dashboard"
```

### Step 2: User Clicks "Call Now" or "Schedule"
```
User clicks button on Batch Details page
â†“
App calls saveBatchToFirebase()
â†“
CREATES: One batch document in 'batches' collection
CREATES: Multiple lead documents in 'leads' collection
â†“
Firebase atomically writes all data
â†“
Each lead references the batchId
â†“
Batch status changes from 'draft' to 'running'/'scheduled'
```

### Step 3: System Processing
```
Calling/Scheduling system reads batch documents
â†“
For each batch, fetches all leads by batchId
â†“
Processes each lead and updates its status
â†“
Updates lead.lastActionAt and lead.attempts
```

---

## Service Layer

### 1. batchService.ts
Functions for managing batch documents:

```typescript
// Save batch when user clicks "Call Now" or "Schedule"
await saveBatchToFirebase(batch, action, scheduleAt?)

// Get all batches for current user
const batches = await getBatchesForUser()

// Get batch with all its leads
const batch = await getBatchDetail(batchId)

// Update batch status
await updateBatchStatus(batchId, status)
```

### 2. leadService.ts (NEW)
Functions for managing individual lead documents:

```typescript
// Create separate lead documents for a batch
const leadIds = await createLeadsForBatch(batchId, contacts)

// Get all leads for a batch
const leads = await getLeadsForBatch(batchId)

// Get all leads for current user
const leads = await getLeadsForUser()

// Update a lead's status
await updateLeadStatus(leadId, status)

// Get lead count statistics
const stats = await getLeadCountStats(batchId)
// Returns: { total, queued, calling, completed }
```

---

## Firestore Security Rules

### Batches Collection
```
âœ“ Users can CREATE batch if:
  - They are authenticated
  - userId matches their UID
  - batchId is set and matches document ID
  - status is valid (queued, scheduled, running, completed)
  - action is call_now or schedule
  - totalContacts > 0

âœ“ Users can READ their own batches

âœ“ Users can UPDATE their batches (status transitions)

âœ“ Users can DELETE their batches
```

### Leads Collection
```
âœ“ Users can CREATE leads if:
  - batchId is NOT null (must reference a batch)
  - phone number is provided
  - leadId matches document ID
  - status is valid (queued, calling, completed)

âœ“ Users can READ their own leads

âœ“ Users can UPDATE leads (status, lastActionAt, attempts)
  - leadId and batchId must remain unchanged

âœ“ Users can DELETE their leads
```

---

## Type Definitions

### Batch Type (Saved in Firestore)
```typescript
interface Batch {
  batchId: string;
  userId: string;
  status: 'queued' | 'scheduled' | 'running' | 'completed';
  action: 'call_now' | 'schedule' | null;
  source: 'manual' | 'csv' | 'clipboard' | 'image';
  totalContacts: number;
  createdAt: Timestamp;
  scheduleAt: Timestamp | null;
  contacts?: ExtractedContact[]; // Optional, populated when fetching
}
```

### BatchDraft Type (Local Only)
```typescript
interface BatchDraft {
  batchId: string;
  createdAt: Timestamp;
  contacts: ExtractedContact[]; // Actual contacts array
  status: 'draft';
  source: BatchSource;
  action: null;
  totalContacts: number;
  metadata?: {...};
}
```

### Lead Type (Saved in Firestore)
```typescript
interface Lead {
  leadId: string;
  batchId: string; // Reference to batch
  phone: string;
  status: 'queued' | 'calling' | 'completed';
  createdAt: Timestamp;
  lastActionAt: Timestamp | null;
  attempts: number;
}
```

---

## Usage Example

### Frontend: User Clicks "Call Now"

```tsx
const handleCallNow = async () => {
  try {
    // batch is local BatchDraft with contacts array
    const batch = currentBatch;
    
    // Firebase writes happen here:
    // 1. One batch document
    // 2. N lead documents (one per contact)
    await saveBatchToFirebase(batch.batchId, 'call_now');
    
    // Success - redirect to dashboard
    router.push('/batch-dashboard');
  } catch (err) {
    Alert.alert('Error', err.message);
  }
};
```

### Backend: Fetch Batch and Process Leads

```typescript
// In your N8N workflow or calling service:

// 1. Get all batches needing processing
const batches = await db.collection('batches')
  .where('status', '==', 'running')
  .get();

// 2. For each batch, get its leads
for (const batch of batches.docs) {
  const leads = await db.collection('leads')
    .where('batchId', '==', batch.id)
    .where('status', '==', 'queued')
    .get();
  
  // 3. Process each lead
  for (const lead of leads.docs) {
    const phone = lead.data().phone;
    
    // Make call...
    // Then update lead status
    await lead.ref.update({
      status: 'completed',
      lastActionAt: admin.firestore.Timestamp.now(),
      attempts: admin.firestore.FieldValue.increment(1)
    });
  }
}
```

---

## Benefits of This Architecture

### 1. Scalability
- Leads are separate documents = independent queries
- Can have thousands of leads per batch
- No document size limits on arrays

### 2. Proper Isolation
- Each lead can be updated independently
- No need to fetch entire batch to update one lead
- Atomic lead updates

### 3. Query Flexibility
- Query leads by batchId
- Query by status
- Get lead count statistics efficiently
- Filter by createdAt, attempts, etc.

### 4. Security
- Rules enforce batchId reference
- No orphaned leads
- Users only access their batches/leads

### 5. Workflow Clarity
- Draft batches are local (no Firebase overhead)
- Single action (Call Now / Schedule) triggers Firebase write
- Clear separation: UI batches vs Firebase batches

---

## Files Modified

1. **firestore.rules** - Updated security rules for new structure
2. **src/services/batchService.ts** - Refactored to use new architecture
3. **src/services/leadService.ts** - NEW: Lead management functions
4. **src/types/batch.ts** - Updated types for new schema

---

## Migration Notes

### If You Had Data In Old Structure

The old structure embedded contacts in batch documents. To migrate:

```typescript
// Get old batch with embedded contacts
const oldBatch = await getBatchDetail(batchId);

// Convert contacts to separate leads
const leads = await createLeadsForBatch(
  batchId, 
  oldBatch.contacts
);

// Keep the batch document, it will work with new structure
```

---

## Next Steps

1. **Deploy Firebase Rules** to production
2. **Test Call Now / Schedule flows** end-to-end
3. **Update N8N workflows** to query leads by batchId
4. **Monitor Firestore usage** to ensure queries are efficient

---

## Support & Debugging

### Check if Leads Were Created
```typescript
const leads = await getLeadsForBatch(batchId);
console.log('Leads count:', leads.length);
console.log('Sample lead:', leads[0]);
```

### Verify Batch Document
```typescript
const batch = await getBatchDetail(batchId);
console.log('Batch status:', batch.status);
console.log('Total contacts:', batch.totalContacts);
```

### Debug Query Performance
```
Firestore Console â†’ Indexes
Make sure there's a composite index on:
- leads collection
- (batchId, status) for common queries
```


