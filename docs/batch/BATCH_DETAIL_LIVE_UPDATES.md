<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Batch Detail Screen - Live Updates Implementation

## Overview
Enhanced BatchDetailScreen with real-time listeners for batch leads and live status updates. The screen now automatically updates whenever lead statuses, call attempts, or retry information changes.

## Features Implemented

### 1. Real-Time Lead Listener
**File**: `src/services/leadService.ts`

Added `subscribeToBatchLeads()` function:
- Subscribes to all leads in a batch using `onSnapshot`
- Automatically updates UI when any lead changes
- Returns unsubscribe function for cleanup
- Handles real-time updates for:
  - `callStatus` changes (pending â†’ in_progress â†’ answered/failed)
  - `attempts` increments
  - `aiDisposition` updates
  - `retryCount` changes
  - `nextRetryAt` scheduling

```typescript
export function subscribeToBatchLeads(
  batchId: string,
  callback: (leads: Lead[]) => void
): () => void
```

### 2. Live Statistics Calculation
**File**: `src/features/leads/BatchDetailScreen.tsx`

Added real-time stats computation:
- **Completed calls**: Count of leads with status = 'completed'
- **Pending calls**: Count of leads with status = 'queued'
- **In progress**: Count of calling/answered leads
- **Total retries**: Sum of all retry counts
- **Average retries**: Total retries Ã· total leads
- **Next retry times**: Array of upcoming retry timestamps

```typescript
const calculateStats = () => {
  // Returns: total, completed, pending, inProgress, totalRetries, avgRetries, nextRetryTimes
}
```

### 3. Progress Bar Component
**File**: `src/features/leads/BatchDetailScreen.tsx`

Visual progress indicator showing:
- Percentage complete (completed / total)
- Progress bar with green fill showing completion
- Stats breakdown: completed, pending, in-progress counts
- Updates in real-time as calls complete

```
Progress: [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘] 35%
âœ“ 7 completed  â± 13 pending  ðŸ“ž 2 calling
```

### 4. Live Statistics Cards
Display real-time metrics:
- **Completed Card**: Shows completed count with checkmark icon, green color
- **Pending Card**: Shows pending count with timer icon, blue color
- **Retry Info Card**: Shows total retries, average retries, and scheduled retries

### 5. Enhanced Contact List for Live Batches
**For Draft Batches**: Shows static contact list with phone numbers
**For Running/Scheduled Batches**: Shows live contact list with:
- Phone number
- **Status Badge**: Color-coded status (completed/calling/interested/not_interested/follow_up)
  - Green: completed âœ“
  - Orange: calling ðŸ“ž
  - Blue: interested ðŸ‘
  - Red: not interested ðŸ‘Ž
- **Meta Information**:
  - Retry count with orange refresh icon
  - Attempt count
  - Next retry time (if scheduled)

### 6. Auto-Refresh UI
The screen automatically refreshes whenever:
- Lead callStatus changes
- Lead attempts increase
- Lead aiDisposition updates
- Lead retryCount changes
- New retries are scheduled (nextRetryAt)

## Component Structure

### State Management
```typescript
const [liveLeads, setLiveLeads] = useState<Lead[]>([]);
const [statsLoading, setStatsLoading] = useState(true);
```

### useEffect Hook - Real-Time Listener Setup
```typescript
useEffect(() => {
  if (!batch || batch.status === 'draft') return;
  
  const unsubscribe = subscribeToBatchLeads(batch.batchId, (leads) => {
    setLiveLeads(leads);
    setStatsLoading(false);
  });
  
  return () => unsubscribe();
}, [batch?.batchId, batch?.status, batch]);
```

### Conditional Rendering
- **Draft batches**: Shows original static contact list
- **Live batches**: Shows real-time contact list with status colors and metadata
- **Loading state**: Shows spinner during real-time updates

## Styling

Added comprehensive styles for:
- `liveStatsSection`: Container for all live stats
- `progressContainer`: Progress bar and stats container
- `progressBar` & `progressFill`: Visual progress indicator
- `statsCardsContainer`: Grid layout for stat cards
- `statCard`: Individual stat card styling
- `retryInfoCard`: Retry information card with orange background
- `liveContactRow`: Enhanced contact row for live batches
- `statusBadge`: Colored badge showing current contact status
- `liveContactMeta`: Metadata display (retries, attempts, next retry)

## Usage Example

```tsx
// The component automatically:
// 1. Fetches the batch details
// 2. Sets up real-time listener on batch load
// 3. Updates stats whenever leads change
// 4. Displays progress bar and live stats
// 5. Shows enhanced contact list with status colors
// 6. Cleans up listener on unmount or batch change
```

## Performance Optimizations

1. **Lazy initialization**: Only subscribes for non-draft batches
2. **Efficient cleanup**: Unsubscribes when component unmounts or batch changes
3. **Single listener**: Subscribes once per batch, receives all updates
4. **Computed stats**: Recalculates only when leads array changes
5. **Conditional rendering**: Different UI for draft vs. live batches

## Real-Time Updates Flow

```
Firestore â†’ onSnapshot listener â†’ setLiveLeads â†’ calculateStats â†’ Component re-render
```

Each lead update in Firestore triggers:
1. Leads array updates in state
2. Stats recalculate automatically
3. Progress bar updates
4. Contact list shows new status colors
5. Retry info updates if applicable

## Files Modified

1. **src/services/leadService.ts**
   - Added `subscribeToBatchLeads()` function (+70 lines)

2. **src/features/leads/BatchDetailScreen.tsx**
   - Added imports: `subscribeToBatchLeads`, `Lead` type
   - Added state: `liveLeads`, `statsLoading`
   - Added useEffect: Real-time listener setup
   - Added function: `calculateStats()`
   - Added JSX: Progress bar section, stats cards, retry info
   - Added JSX: Enhanced live contact list
   - Added styles: 30+ new style definitions
   - Total: ~450 lines added/modified

## Testing Checklist

- [ ] Draft batch shows static contact list
- [ ] Running batch shows real-time contact list
- [ ] Progress bar updates when leads complete
- [ ] Completed count increments correctly
- [ ] Pending count decrements as calls complete
- [ ] Retry info shows when retries > 0
- [ ] Status badges show correct colors
- [ ] Metadata displays retries and attempts
- [ ] Next retry time displays correctly
- [ ] UI updates automatically without page refresh
- [ ] Loading indicator shows during updates
- [ ] Component cleans up on unmount
- [ ] No memory leaks from unsubscribed listeners

## Integration Notes

The real-time listener requires:
1. Batch status is not 'draft'
2. User is authenticated
3. Firestore security rules allow reading leads collection
4. batchId is valid and exists

The component gracefully handles:
- No leads in batch (empty list message)
- Network disconnects (loading indicator)
- Listener errors (console logging)
- Batch status changes (resets live data)

## Next Steps (Optional)

1. Add filtering by status (show only completed, pending, etc.)
2. Add sorting options (by retry count, last attempt time, etc.)
3. Add manual retry button for individual contacts
4. Add search by phone number in live list
5. Add export/download updated contact list
6. Add call recording playback for completed calls


