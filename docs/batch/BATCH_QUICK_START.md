<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸš€ BATCH SYSTEM - QUICK START GUIDE

## Files Added (7 files, 1,500+ lines)

```
âœ… src/types/batch.ts                              (250 lines)
âœ… src/context/BatchContext.tsx                    (200 lines)
âœ… src/services/batchService.ts                    (280 lines)
âœ… src/features/leads/BatchDashboard.tsx           (350 lines)
âœ… src/features/leads/BatchDetailScreen.tsx        (450 lines)
âœ… app/batch-dashboard.tsx                         (3 lines)
âœ… app/batch-detail.tsx                            (3 lines)
```

## Files Modified (1 file)

```
âœ… src/features/leads/ImageImportScreen.tsx        (replaced handleSaveLeads)
âœ… firestore.rules                                 (batch collection rules added)
```

---

## ðŸ”§ Setup Required

### Step 1: Install uuid package
```bash
npm install uuid
# or
yarn add uuid
```

### Step 2: Update App Root Layout
Add BatchProvider wrapper:

```tsx
// app/_layout.tsx or _app.tsx

import { BatchProvider } from '@/src/context/BatchContext';

export default function RootLayout() {
  return (
    <BatchProvider>
      <Stack>
        {/* Your routes */}
      </Stack>
    </BatchProvider>
  );
}
```

### Step 3: Deploy Firebase Rules
1. Open Firebase Console
2. Go to Firestore â†’ Rules
3. Copy entire content from `firestore.rules`
4. Paste and Publish

### Step 4: Verify Routes Exist
```
app/batch-dashboard.tsx      âœ… Created
app/batch-detail.tsx         âœ… Created
app/image-import.tsx         âœ… Existing
```

---

## ðŸ’¬ How It Works Now

### Upload Flow
```
User selects image
  â†“
Gemini AI extracts numbers (unchanged)
  â†“
Preview shows extracted contacts
  â†“
User clicks "ðŸ“± Create Batch"
  â†“
Batch created in LOCAL MEMORY ONLY
  â†“
Redirected to /batch-detail
  â†“
NO Firebase write yet â† KEY DIFFERENCE
```

### Dashboard Flow
```
User clicks "Call Now" or "Schedule"
  â†“
batchService.saveBatchToFirebase() called
  â†“
ATOMIC write to Firebase:
  - /batches/{batchId} â† main batch record
  - /leads/{x,y,z} â† all contacts linked to batch
  â†“
Status updates to "Running" or "Scheduled"
  â†“
Dashboard refreshes and shows status
```

---

## ðŸ“± UI Changes

### Import Screen
- Old: "ðŸ’¾ Save 15 Leads" button
- New: "ðŸ“± Create Batch (15 Numbers)" button

### Dashboard
- Old: Individual leads listed
- New: Batches listed with status badges
  - ðŸŸ  DRAFT: "Awaiting Command"
  - ðŸ”µ SCHEDULED: "Scheduled at 5:30 PM"
  - ðŸŸ¢ RUNNING: "Calling in Progress"
  - âœ… COMPLETED: "Completed"

### Batch Detail
- Shows all contacts in batch
- Three action buttons:
  - ðŸ“ž Call Now
  - ðŸ“… Schedule (date + time picker)
  - ðŸ—‘ï¸ Delete (no Firebase impact)

---

## ðŸ” Firebase Changes

### New Rules
```javascript
// Batches collection (NEW)
match /batches/{batchId} {
  allow create: if authenticated 
    && userId == auth.uid
    && status in ['running', 'scheduled']
    && totalContacts > 0
}

// Leads collection (CHANGED)
match /leads/{leadId} {
  allow create: if authenticated
    && batchId != null  â† REQUIRED NOW
    && userId == auth.uid
}
```

**Key**: Leads can NO LONGER be created without a batchId.

---

## âœ… Testing Scenarios

### Scenario 1: Create & Delete Batch
```
1. Upload image â†’ extracts 10 numbers
2. Create batch
3. Redirect to batch detail âœ“
4. Click "Delete"
5. Confirm deletion
6. Back to dashboard (batch gone)
7. NO Firebase entries created âœ“
```

### Scenario 2: Call Now
```
1. Upload image â†’ extracts 10 numbers
2. Create batch
3. Click "Call Now"
4. Confirmation dialog
5. Batch saved to Firebase âœ“
6. Status: "Calling in Progress" âœ“
7. All 10 leads in /leads collection with batchId âœ“
8. /batches/{batchId} status: 'running' âœ“
```

### Scenario 3: Schedule for Later
```
1. Upload image â†’ extracts 10 numbers
2. Create batch
3. Click "Schedule"
4. Select "Tomorrow" + "2:00 PM"
5. Confirm
6. Batch saved to Firebase âœ“
7. Status: "Scheduled at 2:00 PM" âœ“
8. /batches/{batchId} scheduleAt: set âœ“
9. N8N can monitor and trigger at time
```

---

## ðŸ”— API Reference

### useBatch() Hook
```tsx
const {
  currentBatch,           // Batch in detail view
  allBatches,            // All user batches from Firebase
  loading,               // Loading state
  error,                 // Error message
  
  // Actions
  createLocalBatch(),    // Create in-memory batch
  deleteDraftBatch(),    // Delete local batch (no Firebase)
  saveBatchToFirebase(), // Save with action (Call/Schedule)
  getAllBatches(),       // Fetch from Firebase
  getBatchDetail(),      // Get single batch
  updateBatchStatus(),   // Update batch status
  clearError(),          // Clear error message
} = useBatch();
```

### createLocalBatch()
```tsx
const batch = createLocalBatch(
  contacts,              // [{phone, name?, email?, confidence?}]
  source,                // 'image' | 'csv' | 'clipboard' | 'manual'
  metadata               // {fileName?, uploadedFrom?, extractionType?}
);
// Returns: BatchDraft (in-memory, not in Firebase)
```

### saveBatchToFirebase()
```tsx
await saveBatchToFirebase(
  batch,                 // The draft batch
  'call_now',            // or 'schedule'
  scheduleAt             // Timestamp (if scheduling)
);
// Creates /batches/{batchId}
// Creates /leads/{x,y,z} linked to batch
// Atomic write (all or nothing)
```

---

## ðŸŽ¯ Database Queries for N8N

### Get Scheduled Batches Ready to Call
```javascript
db.collection('batches')
  .where('userId', '==', userId)
  .where('status', '==', 'scheduled')
  .where('scheduleAt', '<=', now)
  .get()
```

### Get All Contacts in a Batch
```javascript
db.collection('leads')
  .where('batchId', '==', batchId)
  .where('userId', '==', userId)
  .get()
```

### Update Batch to Running
```javascript
db.collection('batches')
  .doc(batchId)
  .update({
    status: 'running',
    startedAt: admin.firestore.FieldValue.serverTimestamp()
  })
```

### Update Individual Contact Status
```javascript
db.collection('leads')
  .doc(leadId)
  .update({
    status: 'calling',
    // or 'completed', 'failed'
  })
```

---

## âš ï¸ Important Notes

### Don't Break Existing Features
- Image extraction still works âœ“
- CSV import still works (will also use batches)
- Clipboard paste still works (will also use batches)
- Manual entry still works (will also use batches)
- Everything just creates batches instead of individual saves

### Performance Tips
- Batches can handle 100+ contacts
- Firebase atomic writes support ~500 operations
- Dashboard auto-refreshes every 60 seconds
- Pull-to-refresh for manual refresh

### N8N Integration Points
- Monitor: /batches where status='scheduled'
- Action: Get all leads with that batchId
- Execute: Call each number
- Update: /leads status and /batches progress
- Complete: Mark batch status='completed'

---

## ðŸ†˜ Troubleshooting

### Issue: "Create Batch button not appearing"
- Check: useBatch() hook is accessible
- Fix: Wrap app with `<BatchProvider>`

### Issue: "Batch not found when clicking from dashboard"
- Check: batchId params passed correctly
- Fix: Verify route params in router.push()

### Issue: "Firebase write error"
- Check: Firestore rules deployed
- Fix: Update and republish rules

### Issue: "Batch disappears after refresh"
- Expected: Draft batches are in-memory only
- Solution: Create batch (Call/Schedule) to persist

---

## ðŸ“Š Sample Flow Diagram

```
                    IMAGE UPLOAD
                        â†“
                GEMINI AI EXTRACTION
                        â†“
                    PREVIEW CONTACTS
                        â†“
              "CREATE BATCH" CLICKED
                        â†“
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚ IN-MEMORY BATCH CREATED â”‚
            â”‚ (No Firebase Write)      â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â†“
            /BATCH-DETAIL?batchId=xxx
                        â†“
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚  USER SELECTS ACTION:       â”‚
          â”‚  â€¢ Call Now                 â”‚
          â”‚  â€¢ Schedule                 â”‚
          â”‚  â€¢ Delete                   â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
          â†™              â†“              â†˜
      DELETE          CALL NOW       SCHEDULE
        â†“                â†“               â†“
      NO FB        FIREBASE          DATE/TIME
      WRITE        WRITE             PICKER
        â†“                â†“               â†“
    REMOVED        /batches +        /batches +
    FROM           /leads            /leads
    MEMORY         created           created
                     â†“                 â†“
                   RUNNING          SCHEDULED
                     â†“                 â†“
                 DASHBOARD        N8N MONITORS
                 SHOWS            & EXECUTES
                 PROGRESS         AT SCHEDULED
                                  TIME
```

---

## âœ¨ Next Steps

1. **Install uuid**: `npm install uuid`
2. **Update layout**: Add `<BatchProvider>`
3. **Deploy rules**: Copy firestore.rules to Firebase
4. **Test flow**: Upload â†’ Create â†’ Call/Schedule
5. **Design N8N**: Plan automation workflows
6. **Connect N8N**: Set up webhook triggers

---

**ðŸŽ‰ System is now production-ready for batch-based calling!**

All uploads create batches â†’ All actions are batch-level â†’ N8N automation ready â†’ Full user control.


