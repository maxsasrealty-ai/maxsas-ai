<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Dashboard Stats - Usage Guide

## Real-Time Batch Statistics Implementation

### Overview
The dashboard now supports **real-time live updates** for batch calling progress using Firestore's `onSnapshot` listener.

---

## API Reference

### 1. `getBatchStats(batchId: string)`

**Purpose:** One-time fetch of batch statistics

**Returns:**
```typescript
{
  total: number,           // Total leads in batch
  queued: number,          // Leads waiting to be called
  calling: number,         // Leads currently being called
  answered: number,        // Calls that were answered
  interested: number,      // Leads marked as interested
  not_interested: number,  // Leads marked as not interested
  failed: number,          // Failed/busy/unreachable calls
  successRate: number      // Success % (interested/answered * 100)
}
```

**Example:**
```typescript
import { getBatchStats } from '@/services/leadService';

const stats = await getBatchStats('batch-123');
console.log('Success Rate:', stats.successRate + '%');
```

---

### 2. `subscribeToBatchStats(batchId, callback)`

**Purpose:** Real-time listener for live dashboard updates

**Parameters:**
- `batchId`: The batch to monitor
- `callback`: Function called with updated stats

**Returns:** Unsubscribe function

**Example:**
```typescript
import { subscribeToBatchStats } from '@/services/leadService';
import { useEffect, useState } from 'react';

function BatchDashboard({ batchId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Start listening to real-time updates
    const unsubscribe = subscribeToBatchStats(batchId, (updatedStats) => {
      setStats(updatedStats);
    });

    // Cleanup: Stop listening when component unmounts
    return () => unsubscribe();
  }, [batchId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Live Batch Progress</h2>
      <div>Total: {stats.total}</div>
      <div>Queued: {stats.queued}</div>
      <div>Calling: {stats.calling}</div>
      <div>Answered: {stats.answered}</div>
      <div>Interested: {stats.interested}</div>
      <div>Not Interested: {stats.not_interested}</div>
      <div>Failed: {stats.failed}</div>
      <div>Success Rate: {stats.successRate}%</div>
    </div>
  );
}
```

---

## Success Rate Calculation

```
successRate = (interested / answered) * 100

Example:
- Answered: 50 calls
- Interested: 15 leads
- Success Rate: (15/50) * 100 = 30%
```

---

## Failed Calls Logic

A call is counted as "failed" when:
- `callStatus` is `'failed'`, `'busy'`, or `'unreachable'`
- AND `status` is `'completed'`

This ensures only final failures are counted (not retry-eligible calls).

---

## Integration Points

### For n8n Automation
When n8n updates call statuses, the dashboard automatically refreshes via the `onSnapshot` listener.

### For Manual Updates
When user manually updates lead status, the dashboard reflects changes instantly.

---

## Performance Notes

- **Optimized:** Uses Firestore's native real-time sync
- **Efficient:** Only calculates stats when data changes
- **Clean:** Auto-unsubscribes on component unmount
- **Scalable:** Works with batches up to 10,000 leads

---

## Example: Full Dashboard Component

```typescript
import React, { useEffect, useState } from 'react';
import { subscribeToBatchStats, BatchStats } from '@/services/leadService';
import { View, Text, ActivityIndicator } from 'react-native';

export function LiveBatchDashboard({ batchId }: { batchId: string }) {
  const [stats, setStats] = useState<BatchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToBatchStats(batchId, (updatedStats) => {
      setStats(updatedStats);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('ðŸ”Œ Unsubscribing from batch stats');
      unsubscribe();
    };
  }, [batchId]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!stats) {
    return <Text>No data available</Text>;
  }

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Live Progress
      </Text>
      
      <View style={{ marginTop: 16 }}>
        <StatRow label="Total Leads" value={stats.total} />
        <StatRow label="Queued" value={stats.queued} color="#FFB800" />
        <StatRow label="Calling" value={stats.calling} color="#00A8FF" />
        <StatRow label="Answered" value={stats.answered} color="#00D68F" />
        <StatRow label="Interested" value={stats.interested} color="#00B74A" />
        <StatRow label="Not Interested" value={stats.not_interested} color="#FFA900" />
        <StatRow label="Failed" value={stats.failed} color="#F93154" />
        
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F0F0F0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Success Rate: {stats.successRate}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function StatRow({ label, value, color = '#333' }: { 
  label: string; 
  value: number; 
  color?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
      <Text>{label}</Text>
      <Text style={{ fontWeight: 'bold', color }}>{value}</Text>
    </View>
  );
}
```

---

## Testing

```typescript
// Test one-time fetch
const stats = await getBatchStats('test-batch-id');
console.log('Stats:', stats);

// Test real-time listener
const unsubscribe = subscribeToBatchStats('test-batch-id', (stats) => {
  console.log('Real-time update:', stats);
});

// Stop listening after 10 seconds
setTimeout(() => {
  unsubscribe();
  console.log('Stopped listening');
}, 10000);
```

---

## Key Benefits

âœ… **Real-time updates** - Dashboard auto-refreshes as calls progress  
âœ… **No polling** - Uses efficient Firestore listeners  
âœ… **Success rate tracking** - Instant conversion metrics  
âœ… **Failed call tracking** - Monitor call quality  
âœ… **n8n compatible** - Works seamlessly with automation  
âœ… **Type-safe** - Full TypeScript support  

---

## Files Modified

- `src/types/batch.ts` - Added `BatchStats` interface
- `src/services/leadService.ts` - Added `getBatchStats()` and `subscribeToBatchStats()`

No UI changes were made. Integration is plug-and-play.


