# Quick Reference: Batch & Lead Management

## Common Operations

### 1. User Creates a Batch (Local Draft)

```typescript
import { useBatch } from '@src/context/BatchContext';

const MyComponent = () => {
  const { createLocalBatch } = useBatch();

  const handleExtractedContacts = (contacts: ExtractedContact[]) => {
    // Creates LOCAL batch - NO Firebase write
    const batch = createLocalBatch(
      contacts,
      'csv', // source: 'manual' | 'csv' | 'clipboard' | 'image'
      {
        fileName: 'leads.csv',
        uploadedFrom: 'csv-import'
      }
    );
    // batch.status === 'draft'
    // batch.contacts === array of contacts
    // No Firebase write happens here!
  };
};
```

---

### 2. User Clicks "Call Now"

```typescript
import { useBatch } from '@src/context/BatchContext';

const BatchDetailScreen = () => {
  const { saveBatchToFirebase } = useBatch();

  const handleCallNow = async () => {
    try {
      // This is where Firebase writes happen
      // Saves batch document + creates lead documents
      await saveBatchToFirebase(batch.batchId, 'call_now');
      
      // After this:
      // - 1 batch document in 'batches' collection
      // - N lead documents in 'leads' collection (one per contact)
      // - batch.status === 'running'
    } catch (error) {
      console.error('Failed:', error);
    }
  };
};
```

---

### 3. User Clicks "Schedule"

```typescript
const handleSchedule = async () => {
  const scheduleDateTime = new Date('2026-02-20 14:00:00');
  
  try {
    // Saves batch document + creates lead documents
    // scheduleAt timestamp is included
    await saveBatchToFirebase(
      batch.batchId,
      'schedule',
      Timestamp.fromDate(scheduleDateTime)
    );
    
    // After this:
    // - batch.status === 'scheduled'
    // - batch.scheduleAt === Timestamp of schedule time
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

---

### 4. Backend: Get Batch and Process Leads

```typescript
import { getBatchDetail, updateBatchStatus } from '@src/services/batchService';
import { getLeadsForBatch, updateLeadStatus } from '@src/services/leadService';

// In your N8N workflow or calling service:

async function processRunningBatches() {
  // 1. Get batch (this also fetches all leads)
  const batch = await getBatchDetail(batchId);
  
  console.log('Batch:', batch.batchId);
  console.log('Total contacts:', batch.totalContacts);
  console.log('Leads fetched:', batch.contacts.length);
  
  // 2. Alternative: Fetch leads separately
  const leads = await getLeadsForBatch(batch.batchId);
  
  // 3. Process each lead
  for (const lead of leads) {
    try {
      // Make call to lead.phone
      const callResult = await makeCall(lead.phone);
      
      // Update lead status
      await updateLeadStatus(lead.leadId, 'completed');
    } catch (error) {
      console.error('Failed to call:', lead.phone);
      // Lead remains 'queued' for retry
    }
  }
}
```

---

### 5. Query Leads by Batch

```typescript
import { getLeadsForBatch } from '@src/services/leadService';

async function getLead Stats(batchId: string) {
  const leads = await getLeadsForBatch(batchId);
  
  const queued = leads.filter(l => l.status === 'queued').length;
  const calling = leads.filter(l => l.status === 'calling').length;
  const completed = leads.filter(l => l.status === 'completed').length;
  
  console.log(`Queued: ${queued}, Calling: ${calling}, Completed: ${completed}`);
}
```

---

### 6. Get Lead Count Statistics

```typescript
import { getLeadCountStats } from '@src/services/leadService';

const stats = await getLeadCountStats(batchId);
// Returns: { total, queued, calling, completed }

console.log(`Total: ${stats.total}`);
console.log(`Progress: ${stats.completed}/${stats.total}`);
```

---

## Firestore Queries

### Query All Batches for User

```typescript
import { getBatchesForUser } from '@src/services/batchService';

const batches = await getBatchesForUser();
// Returns array of batches (contacts array is empty)
```

---

### Query Leads by Batch

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@src/lib/firebase';

const q = query(
  collection(db, 'leads'),
  where('batchId', '==', 'abc123')
);
const snapshot = await getDocs(q);
// Returns all leads for that batch
```

---

### Query Queued Leads in a Batch

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@src/lib/firebase';

const q = query(
  collection(db, 'leads'),
  where('batchId', '==', 'abc123'),
  where('status', '==', 'queued')
);
const snapshot = await getDocs(q);
// Returns only queued leads (ready to call)
```

---

### Query Recently Completed Leads

```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@src/lib/firebase';

const q = query(
  collection(db, 'leads'),
  where('status', '==', 'completed'),
  orderBy('lastActionAt', 'desc'),
);
const snapshot = await getDocs(q);
// Returns completed leads, newest first
```

---

## Data Structures

### Batch Document (in 'batches' collection)

```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "status": "running",
  "action": "call_now",
  "source": "csv",
  "totalContacts": 6,
  "createdAt": 1707023107,
  "scheduleAt": null
}
```

---

### Lead Document (in 'leads' collection)

```json
{
  "leadId": "660e8400-e29b-41d4-a716-446655440001",
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "9876543211",
  "status": "queued",
  "createdAt": 1707023107,
  "lastActionAt": null,
  "attempts": 0
}
```

---

## Context API Usage

### Get Current Batch and All Batches

```typescript
import { useBatch } from '@src/context/BatchContext';

const MyComponent = () => {
  const { currentBatch, allBatches, loading, error } = useBatch();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <View>
      <Text>Current: {currentBatch?.batchId}</Text>
      <Text>All batches: {allBatches.length}</Text>
    </View>
  );
};
```

---

### Get Batch Detail

```typescript
import { useBatch } from '@src/context/BatchContext';

const BatchDetailScreen = () => {
  const { getBatchDetail, loading } = useBatch();
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    getBatchDetail(batchId).then(setBatch);
  }, [batchId]);

  if (loading) return <Loading />;
  if (!batch) return <NotFound />;

  return (
    <View>
      <Text>Contacts: {batch.contacts?.length || 0}</Text>
      <Text>Status: {batch.status}</Text>
    </View>
  );
};
```

---

### Delete Draft Batch

```typescript
import { useBatch } from '@src/context/BatchContext';

const { deleteDraftBatch } = useBatch();

// Only works for draft batches (local storage only)
deleteDraftBatch(batch.batchId);
// Removes from UI - NO Firebase delete
```

---

## Error Handling

### Check User Authentication

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
if (!auth.currentUser) {
  throw new Error('User not authenticated');
}
```

---

### Validate Contacts Before Batch

```typescript
const contacts = [
  { phone: '9876543211' },
  { phone: '8888837040' },
  // ...
];

if (!contacts || contacts.length === 0) {
  throw new Error('No contacts to batch');
}

const batch = createLocalBatch(contacts, 'csv');
```

---

### Handle Save Errors

```typescript
try {
  await saveBatchToFirebase(batch.batchId, 'call_now');
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('Firebase rules blocked write');
  } else if (error.code === 'unauthenticated') {
    console.error('User not logged in');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Debugging Tips

### Log Batch Creation

```typescript
console.log('📦 Batch created:', {
  batchId: batch.batchId,
  contacts: batch.contacts.length,
  status: batch.status,
  source: batch.source
});
```

---

### Log Firebase Write

```typescript
console.log('🔥 Saving to Firebase:');
console.log('  Batch: ', batchId);
console.log('  Contacts: ', contacts.length);
console.log('  Action: ', action);

try {
  await saveBatchToFirebase(batch, action, scheduleAt);
  console.log('✅ Save successful');
} catch (error) {
  console.error('❌ Save failed:', error);
}
```

---

### Verify Firestore Data

```typescript
// Open Firebase Console > Firestore Database
// Go to 'batches' collection
// Should see documents like:
// - 550e8400-e29b-41d4-a716-446655440000 (your batch)

// Go to 'leads' collection
// Filter by: batchId == 550e8400-e29b-41d4-a716-446655440000
// Should see 6 documents (one per phone number)
```

---

## Common Mistakes ❌ → ✅

### ❌ Storing Draft Contacts in Firestore
```typescript
// WRONG - This will fail
await saveBatchToFirebase(contacts, 'csv');
```

### ✅ Correct Way
```typescript
// RIGHT - Local first, Firebase only on action
const batch = createLocalBatch(contacts, 'csv');
// Later, when user clicks Call Now:
await saveBatchToFirebase(batch.batchId, 'call_now');
```

---

### ❌ Updating Batch Document for Each Lead
```typescript
// WRONG - Inefficient
for (const lead of leads) {
  await updateBatchStatus(batch.batchId, 'processing');
}
```

### ✅ Correct Way
```typescript
// RIGHT - Update leads individually
for (const lead of leads) {
  await updateLeadStatus(lead.leadId, 'completed');
}
```

---

### ❌ Embedding Leads in Batch
```typescript
// WRONG - This architecture doesn't use this pattern
{
  batchId: '123',
  leads: [{ phone: '1234' }, { phone: '5678' }]  // ❌
}
```

### ✅ Correct Way
```typescript
// RIGHT - Separate documents
// Batch document:
{ batchId: '123', totalContacts: 2 }

// Lead documents:
{ leadId: 'a', batchId: '123', phone: '1234' }
{ leadId: 'b', batchId: '123', phone: '5678' }
```

---

## Migration from Old System

If you're migrating from the old architecture:

```typescript
// Old: Batch with embedded contacts
const oldBatch = {
  batchId: '123',
  contacts: [
    { phone: '1234' },
    { phone: '5678' }
  ]
};

// New: Batch + separate leads
await saveBatchToFirebase(oldBatch, 'call_now');
// Now creates:
// - Batch document with totalContacts: 2
// - 2 lead documents with batchId: '123'
```

---

## Performance Tips

### ✅ DO: Query specific leads by batchId
```typescript
const q = query(
  collection(db, 'leads'),
  where('batchId', '==', 'abc123'),
  where('status', '==', 'queued')
);
```

### ❌ DON'T: Fetch all leads then filter locally
```typescript
const allLeads = await getLeadsForUser();
const filtered = allLeads.filter(l => l.batchId === 'abc123');
```

---

### ✅ DO: Use indexes for complex queries
```
Collection: leads
Fields: batchId (Ascending), status (Ascending)
```

### ❌ DON'T: Query without proper indexes
```typescript
// Make sure Firebase has created the composite index
```

---

## Resources

- 📖 BATCH_ARCHITECTURE_GUIDE.md - Complete architecture docs
- 📋 IMPLEMENTATION_STATUS.md - What was changed
- 🔍 firestore.rules - Security rules
- 💾 src/services/batchService.ts - Batch operations
- 👤 src/services/leadService.ts - Lead operations
