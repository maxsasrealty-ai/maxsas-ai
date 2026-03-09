<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸš€ N8N AUTOMATION READINESS GUIDE

## Overview

Your Maxsas AI Real Estate app is now **fully prepared for n8n automation** integration. All phases have been completed with a standardized lead schema, comprehensive dashboard, follow-up management, and activity history.

---

## PHASE 1 âœ… DATABASE STRUCTURE

### Standardized Firestore Lead Schema

Every lead in Firebase now contains:

```typescript
{
  // Core Information
  phone: "9876543210",
  source: "manual | csv | clipboard | image",
  userId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Status Tracking (for n8n)
  status: "new" | "interested" | "not_interested" | "follow_up" | "closed",
  intakeAction: "none" | "call" | "email" | "sms",
  intakeStatus: "pending" | "in_progress" | "completed" | "failed",

  // Automation Readiness
  automationTriggered: boolean,
  automationError?: string,

  // Follow-up Management
  followUpRequired: boolean,
  scheduleAt?: Timestamp,
  followUpNotes?: string,
  lastActionAt?: Timestamp,

  // Metadata & History
  notes: string,
  name?: string,
  interest?: string,
  budget?: string,
  history: [
    {
      action: string,
      timestamp: Timestamp,
      details?: string,
      updatedBy?: string
    }
  ]
}
```

### Implementation Details

**File**: `src/lib/leadSchema.ts`
- Defines complete Lead interface
- Provides `createLeadSchema()` function
- Includes `validateLeadSchema()` for data integrity

**How to Use**:
```typescript
import { addLeadWithSchema } from '@/src/lib/leadService';

// Automatically enforces schema
await addLeadWithSchema(
  '9876543210',
  'manual', // source
  { notes: 'Client from website' } // optional overrides
);
```

---

## PHASE 2 âœ… DASHBOARD IMPROVEMENTS

### Real-time Statistics Display

**Component**: `src/components/ui/DashboardStats.tsx`

Displays 9 key metrics in a horizontal scroll:
- âœ… Total Leads
- âœ… New Leads (status: new)
- âœ… Pending Automation (intakeStatus: pending)
- âœ… Interested Leads
- âœ… Not Interested Leads
- âœ… Follow-up Leads
- âœ… Scheduled Leads
- âœ… Closed Leads
- âœ… Follow-ups Due Today

**Status Messages**:
- "3 new leads added"
- "5 leads waiting for automation"
- "2 follow-ups due today"
- "No automation triggered yet"

**Integration**:
```tsx
import { DashboardStats } from '@/src/components/ui/DashboardStats';

<DashboardStats refresh={statsRefresh} />
```

---

## PHASE 3 âœ… FOLLOW-UP SYSTEM

### Follow-up Scheduling Screen

**File**: `src/features/leads/FollowUpScheduleScreen.tsx`
**Route**: `/follow-up-schedule?leadId=...&phone=...`

**Features**:
- ðŸ“… Quick date selection (Yesterday, Today, Tomorrow, +1d, +3d, +7d)
- ðŸ• Time picker (9:00, 11:00, 14:00, 16:00, 18:00)
- ðŸ“ Follow-up notes (custom reason)
- âœ… Automatic history tracking

**Usage**:
```typescript
router.push({
  pathname: '/follow-up-schedule',
  params: { leadId: 'lead_123', phone: '9876543210' }
});
```

### Scheduled Follow-ups Screen

**File**: `src/features/leads/ScheduledFollowUpsScreen.tsx`
**Route**: `/scheduled-follow-ups`

**Features**:
- ðŸ“‹ Lists all scheduled follow-ups sorted by date
- â° Time remaining/overdue indicator
- ðŸ‘ Mark as Interested button
- âœ… Mark as Completed button
- ðŸ”„ Pull-to-refresh

### Lead Status Actions

Quick action buttons on Lead Dashboard:
- ðŸ‘ **Interested**: Marks lead as interested
- ðŸ“… **Follow-up**: Marks status as follow_up
- â± **Schedule**: Opens follow-up scheduler

---

## PHASE 4 âœ… ACTIVITY HISTORY

### History Tracking System

**File**: `src/lib/leadService.ts`

Every action automatically logs to `history` array:

```typescript
// When status changes
{
  action: "status_changed_to_interested",
  details: "Lead expressed interest during follow-up",
  timestamp: Timestamp,
  updatedBy: userId
}

// When follow-up is scheduled
{
  action: "follow_up_scheduled",
  details: "Follow-up scheduled for Mar 15, 2026 14:00",
  timestamp: Timestamp,
  updatedBy: userId
}

// When automation triggers
{
  action: "automation_triggered",
  details: "Automation workflow initiated",
  timestamp: Timestamp,
  updatedBy: userId
}
```

### Utility Functions

`src/lib/leadService.ts` provides:

```typescript
// Update lead status (auto-logs to history)
await updateLeadStatus(leadId, 'interested', 'Additional notes');

// Schedule follow-up (auto-logs and updates status)
await scheduleFollowUp(leadId, new Date(), 'Why following up');

// Add custom history entry
await addHistoryEntry(leadId, 'action_name', 'details');

// Update automation status
await updateIntakeStatus(leadId, 'in_progress', 'action_type');

// Trigger n8n workflow
await triggerAutomation(leadId);
```

---

## PHASE 5 âœ… UI/UX INTEGRATION

### Updated Lead Dashboard

**File**: `src/features/leads/LeadsScreen.tsx`

**New Features**:
- âœ… Dashboard stats at top (real-time counters)
- âœ… Tabs for 5 statuses (New, Interested, Not Interested, Follow-up, Closed)
- âœ… Phone number as primary display (instead of name)
- âœ… Source badge (ðŸ“Œ manual/csv/image)
- âœ… Quick status buttons (Interested, Follow-up, Schedule)
- âœ… Automation status indicator (â³ Awaiting / âœ“ Actioned)
- âœ… Pull-to-refresh functionality

### New Routes Created

- `/follow-up-schedule` - Schedule a follow-up
- `/scheduled-follow-ups` - View all scheduled follow-ups

### No Breaking Changes

âœ… All existing imports, routes, and screens work as before
âœ… ImageImportScreen still saves with schema
âœ… CSV/Clipboard imports use schema
âœ… All Firebase rules unchanged

---

## FOR N8N INTEGRATION

### What N8N Can Now Do

N8N workflows can:

1. **Monitor Leads**
   ```
   Query leads where intakeStatus = "pending"
   ```

2. **Take Actions**
   ```
   Update intakeStatus to "in_progress"
   Update intakeAction to "call" or "email" or "sms"
   ```

3. **Schedule Tasks**
   ```
   Create reminders based on scheduleAt timestamp
   ```

4. **Track Progress**
   ```
   Read history array to see all past actions
   Only take action if not previously triggered
   ```

5. **Report Status**
   ```
   Access automationTriggered flag
   Read automationError for debugging
   ```

### N8N Webhook Setup Example

```javascript
// Check for pending leads
GET /leads?where=intakeStatus:pending

// Update lead after action
PUT /leads/{leadId}
{
  "intakeStatus": "in_progress",
  "intakeAction": "call",
  "lastActionAt": Timestamp.now()
}

// Mark complete
PUT /leads/{leadId}
{
  "intakeStatus": "completed",
  "automationTriggered": true,
  "history": [...arrayUnion(completionEntry)]
}
```

---

## QUICK REFERENCE

### Service Functions

| Function | Purpose |
|----------|---------|
| `addLeadWithSchema()` | Save lead with schema enforcement |
| `updateLeadStatus()` | Change lead status |
| `scheduleFollowUp()` | Schedule follow-up |
| `updateIntakeStatus()` | Update automation status |
| `addHistoryEntry()` | Log custom action |
| `triggerAutomation()` | Notify n8n to process |
| `getDashboardStats()` | Get all metrics |
| `getScheduledFollowUps()` | Get pending follow-ups |

### Database Queries N8N Will Use

```
// Find pending leads
where('intakeStatus', '==', 'pending')

// Find leads scheduled for today
where('scheduleAt', '>=', today)
where('scheduleAt', '<=', tomorrow)

// Find leads by source
where('source', '==', 'image')

// Find unactioned leads
where('automationTriggered', '==', false)

// Find leads needing follow-up
where('followUpRequired', '==', true)
```

---

## TESTING BEFORE N8N

### Manual Testing Checklist

- [ ] Add a lead manually â†’ Check it has all schema fields
- [ ] Upload image â†’ Check source is "image"
- [ ] Import CSV â†’ Check source is "csv"
- [ ] Mark as interested â†’ Check history has entry
- [ ] Schedule follow-up â†’ Check scheduleAt timestamp
- [ ] Check dashboard stats â†’ Verify counts
- [ ] View scheduled follow-ups â†’ Sort by date works
- [ ] Try quick status buttons â†’ History updates
- [ ] Open DevTools â†’ Check Firebase console

### Firebase Rules Validation

Current rules already support:
- âœ… User isolation (userId field)
- âœ… Timestamp validation
- âœ… Required fields enforcement
- âœ… Schema validation

No changes needed for n8n integration!

---

## MIGRATION FROM OLD SCHEMA

**If you have existing leads without schema**:

1. Create a migration function:
```typescript
export const migrateLeadSchema = async (leadId: string) => {
  const leadRef = doc(db, 'leads', leadId);
  await updateDoc(leadRef, {
    intakeStatus: 'pending',
    status: 'new',
    automationTriggered: false,
    history: arrayUnion({
      action: 'migrated_to_schema',
      timestamp: serverTimestamp()
    })
  });
};
```

2. Run migration on all existing leads
3. Verify in Firebase console

---

## NEXT STEPS FOR N8N

1. âœ… **Current**: App ready for n8n
2. ðŸ”„ **Design**: N8N workflows (call scheduling, email, etc.)
3. ðŸ”„ **Configure**: Webhook endpoints in Firebase
4. ðŸ”„ **Test**: Trigger workflows manually
5. ðŸ”„ **Deploy**: Connect to production

---

## SUPPORT

### Key Files to Reference
- `src/lib/leadSchema.ts` - Schema definitions
- `src/lib/leadService.ts` - All service functions
- `src/features/leads/LeadsScreen.tsx` - Dashboard
- `src/components/ui/DashboardStats.tsx` - Stats component

### Common Issues

**Q: History array growing too large?**
A: Consider archiving old history entries to a separate collection

**Q: Need custom automation actions?**
A: Add to intakeAction field in schema, handle in n8n

**Q: Want more dashboard metrics?**
A: Extend getDashboardStats() function in leadService.ts

---

## ðŸŽ‰ YOU'RE ALL SET!

Your app is:
- âœ… Fully normalized
- âœ… Automation-ready
- âœ… History-tracked
- âœ… Dashboard-enabled
- âœ… N8N-compatible

Ready to connect to n8n! ðŸš€


