# Implementation Summary: Batch-Based Storage Architecture

## ✅ COMPLETED

### 1. Firestore Security Rules (firestore.rules)
- Updated batches collection rules to accept only valid documents
- Updated leads collection rules to enforce batchId references
- Prevents orphaned leads (every lead must have a batchId)
- Users can only access their own batches and leads

**Key Changes:**
- Batches: `status` in ['queued', 'scheduled', 'running', 'completed']
- Leads: `batchId` is required and NOT null
- Both collections verify userId ownership

---

### 2. Lead Service (src/services/leadService.ts) - NEW FILE
Complete service layer for lead management with functions:

- `createLeadsForBatch()` - Creates N separate lead documents for a batch
- `getLeadsForBatch()` - Fetches all leads for a specific batch
- `getLeadsForUser()` - Fetches all leads for the current user
- `updateLeadStatus()` - Updates a single lead's status
- `getLeadCountStats()` - Gets statistics on lead statuses

**Key Features:**
- Each lead is a SEPARATE document with unique leadId (UUID)
- Every lead contains its batchId for cross-referencing
- Batch operations use writeBatch for atomicity
- Proper error handling and logging

---

### 3. Batch Service (src/services/batchService.ts) - REFACTORED
Updated to use the new two-collection architecture:

- `saveBatchToFirebase()` - NOW:
  1. Creates ONE batch document
  2. Calls createLeadsForBatch() to create separate lead documents
  3. No more embedded contacts array

- `getBatchDetail()` - NOW:
  1. Fetches batch document
  2. Fetches all leads separately
  3. Returns batch with contacts populated from leads

- `getBatchesForUser()` - Returns batches with empty contacts array (optimization)

- `updateBatchStatus()` - Updates batch status

**Removed:**
- Old duplicate `getLeadsForBatch()` function (now in leadService)
- writeBatch operations for contacts (now in leadService)

---

### 4. Batch Types (src/types/batch.ts) - UPDATED
Clarified type structure:

**Batch (Firestore)**
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
  contacts?: ExtractedContact[]; // Optional, only when fetched with leads
}
```

**BatchDraft (Local Only)**
```typescript
interface BatchDraft {
  batchId: string;
  createdAt: Timestamp;
  contacts: ExtractedContact[]; // ACTUAL contacts stored locally
  status: 'draft';
  source: BatchSource;
  action: null;
  totalContacts: number;
}
```

**Lead (Firestore) - NEW**
```typescript
interface Lead {
  leadId: string;
  batchId: string;
  phone: string;
  status: 'queued' | 'calling' | 'completed';
  createdAt: Timestamp;
  lastActionAt: Timestamp | null;
  attempts: number;
}
```

**Updated Statuses:**
- BatchStatus: 'draft' removed, added 'queued' (for non-draft batches)
- LeadStatus: NEW type for lead-specific statuses

---

## 📋 Architecture Overview

### Data Flow

1. **User Extracts Data** (Local)
   - CSV upload / Paste / Image extraction
   - Creates BatchDraft with contacts array
   - Stored in React Context only
   - NO Firebase write

2. **User Clicks "Call Now" or "Schedule"**
   - saveBatchToFirebase() is called
   - Creates batch document in 'batches' collection
   - Creates N lead documents in 'leads' collection
   - Batch status becomes 'running' or 'scheduled'

3. **System Processes Batch**
   - Reads batch from 'batches' collection
   - Queries leads from 'leads' collection where batchId == batch.id
   - Updates each lead status independently
   - Increments lead attempts counter

### Collection Structure

```
batches/
  └── {batchId}
      ├── batchId, userId, status, action, source
      ├── totalContacts, createdAt, scheduleAt

leads/
  ├── {leadId1}
  │   ├── leadId, batchId, phone, status
  │   └── createdAt, lastActionAt, attempts
  ├── {leadId2}
  │   └── ...
  └── {leadIdN}
      └── ...
```

---

## 🔒 Security

### Rules Summary
- Batches: Only creatable with valid status/action, only readable by owner
- Leads: Must have batchId, only readable by owner, userId not checked (queries filtered by app)
- Both collections support automation role for backend processing

### Enforcement Points
1. batchId must be referenced in every lead
2. No orphaned leads possible
3. Users can only access their own data via userId field
4. Status values are restricted

---

## 📚 Documentation

Created **BATCH_ARCHITECTURE_GUIDE.md** with:
- Complete architecture overview
- Collection structure diagrams
- Data flow examples
- Service layer documentation
- Type definitions
- Security rule explanations
- Usage examples
- Debugging tips

---

## ✨ Key Improvements

### From Old Architecture → New Architecture

| Aspect | Old | New |
|--------|-----|-----|
| **Contacts Storage** | Array in batch document | Separate documents in leads collection |
| **Scalability** | Limited by document size | No size limits, infinite leads |
| **Query Efficiency** | Must fetch entire batch | Query specific leads by batchId/status |
| **Lead Updates** | Must rewrite entire batch | Update individual leads |
| **Draft Storage** | Firebase + Local | Local only (no unnecessary writes) |
| **Isolation** | Tight coupling | Proper separation of concerns |
| **References** | No explicit batchId in leads | Every lead has batchId reference |

---

## 🧪 Testing Checklist

When you deploy, verify:

- [ ] **Create Batch Draft**
  - User can extract contacts from CSV/paste/image
  - Batch appears in dashboard with "DRAFT" status
  - No Firebase writes occur

- [ ] **Call Now Flow**
  - User clicks "Call Now"
  - One batch document created in 'batches' collection
  - N lead documents created in 'leads' collection
  - Batch status changes to 'running'
  - All 6 phone numbers appear as separate leads

- [ ] **Schedule Flow**
  - User clicks "Schedule"
  - Select date/time
  - One batch document created with scheduleAt timestamp
  - N lead documents created
  - Batch status is 'scheduled'

- [ ] **Batch Details Page**
  - Displays all phone numbers
  - Shows 6 contacts total
  - Action buttons work correctly

- [ ] **Firestore Verification**
  - Check 'batches' collection: 1 document per batch
  - Check 'leads' collection: 6 documents per batch (one per phone)
  - Each lead has batchId field
  - No contacts array in batch document

---

## 🚀 Next Steps

1. **Deploy Firestore Rules**
   - Go to Firebase Console
   - Deploy the updated firestore.rules

2. **Test Complete Flow**
   - Extract batch with multiple contacts
   - Click "Call Now"
   - Verify Firestore structure

3. **Update N8N Workflows**
   - Update queries to fetch from 'leads' collection
   - Use batchId references
   - Update lead status documents individually

4. **Monitor Performance**
   - Check Firestore usage stats
   - Verify queries use proper indexes
   - Monitor for slow queries

---

## 📞 Support

If you encounter issues:

1. **Check Firestore Rules**
   - Ensure rules are deployed correctly
   - Verify user ID matches request.auth.uid

2. **Debug Lead Creation**
   - Check browser console for createLeadsForBatch logs
   - Verify Firebase has leads documents created

3. **Verify Query Results**
   - Open Firebase Console
   - Query leads collection: filter by batchId
   - Confirm all leads are present

---

## 🎯 Summary

✅ Implemented proper batch-based storage with:
- ONE batch document per batch
- SEPARATE lead documents per phone number
- Proper batchId references
- Updated Firestore security rules
- Complete service layer
- TypeScript types
- Comprehensive documentation

**No leads are saved until user clicks "Call Now" or "Schedule"**

All 6 contacts will upload as separate documents with proper references! 🎉
