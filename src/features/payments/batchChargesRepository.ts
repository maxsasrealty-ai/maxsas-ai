import {
    collection,
    doc,
    onSnapshot,
    query,
    Unsubscribe,
    where,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

import { BatchChargeSummary, BatchLeadBillingRow } from './batchChargesModels';

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const normalizeError = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const isConnectedLead = (status: string) => {
  const normalized = status.toLowerCase();
  return normalized === 'connected' || normalized === 'completed';
};

const mapBatchDoc = (id: string, data: Record<string, unknown>): BatchChargeSummary => ({
  batchId: asString(data.batchId, id),
  batchTotalCost: asNumber(data.batchTotalCost),
  status: asString(data.status) || 'running',
  totalContacts: asNumber(data.totalContacts),
  connectedCount: asNumber(data.connectedCount),
  completedCount: asNumber(data.completedCount),
  failedCount: asNumber(data.failedCount),
  runningCount: asNumber(data.runningCount),
  processingLock: Boolean(data.processingLock),
  completedAt: data.completedAt && typeof data.completedAt === 'object' ? (data.completedAt as any) : null,
  userId: asString(data.userId),
});

const mapLeadDoc = (id: string, data: Record<string, unknown>): BatchLeadBillingRow => {
  const status = asString(data.status, 'failed');
  const connected = isConnectedLead(status);

  const totalCost = asNumber(data.totalCost);
  const callCost = asNumber(data.callCost);
  const successFee = asNumber(data.successFee, asNumber(data.successFeeApplied));

  return {
    leadId: asString(data.leadId, id),
    batchId: asString(data.batchId),
    phone: asString(data.phone, 'N/A'),
    status,
    displayStatus: connected ? 'Connected' : 'Failed',
    duration: asNumber(data.duration, asNumber(data.callDuration)),
    minutesCharged: asNumber(data.minutesCharged),
    callCost,
    successFee,
    totalCost,
    uiTotalCost: connected ? totalCost : 0,
  };
};

export const batchChargesRepository = {
  subscribeCompletedBatchesByUser(
    userId: string,
    onData: (rows: BatchChargeSummary[]) => void,
    onError: (message: string) => void
  ): Unsubscribe {
    if (!userId) {
      onData([]);
      return () => {};
    }

    const q = query(
      collection(db, 'batches'),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((batchDoc) => mapBatchDoc(batchDoc.id, batchDoc.data() as Record<string, unknown>))
          .sort((left, right) => {
            const leftMs = left.completedAt?.toMillis?.() ?? 0;
            const rightMs = right.completedAt?.toMillis?.() ?? 0;
            return rightMs - leftMs;
          });

        onData(rows);
      },
      (error) => {
        onError(normalizeError(error, 'Failed to listen completed batches'));
      }
    );
  },

  subscribeBatchById(
    batchId: string,
    onData: (row: BatchChargeSummary | null) => void,
    onError: (message: string) => void
  ): Unsubscribe {
    if (!batchId) {
      onData(null);
      return () => {};
    }

    return onSnapshot(
      doc(db, 'batches', batchId),
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null);
          return;
        }

        onData(mapBatchDoc(snapshot.id, snapshot.data() as Record<string, unknown>));
      },
      (error) => {
        onError(normalizeError(error, 'Failed to listen selected batch'));
      }
    );
  },

  subscribeLeadsByBatchId(
    batchId: string,
    onData: (rows: BatchLeadBillingRow[]) => void,
    onError: (message: string) => void
  ): Unsubscribe {
    if (!batchId) {
      onData([]);
      return () => {};
    }

    const q = query(collection(db, 'leads'), where('batchId', '==', batchId));

    return onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((leadDoc) => mapLeadDoc(leadDoc.id, leadDoc.data() as Record<string, unknown>))
          .sort((left, right) => left.phone.localeCompare(right.phone));

        onData(rows);
      },
      (error) => {
        onError(normalizeError(error, 'Failed to listen leads for selected batch'));
      }
    );
  },
};
