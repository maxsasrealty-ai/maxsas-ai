import {
    collection,
    doc,
    DocumentData,
    limit,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Timestamp,
    where,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationType =
  | 'batch_completed'
  | 'qualified_lead'
  | 'manual_retry_required'
  | 'wallet_low'
  | 'wallet_recharge_success'
  | 'billing_transaction'
  | 'ai_insight';

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  priority: NotificationPriority;
  isRead: boolean;
  entityId?: string;
  entityType?: 'batch' | 'lead' | 'wallet' | 'transaction' | 'system';
  metadata?: Record<string, string | number | boolean | null>;
  dedupeKey: string;
  eventAt: Date | null;
  createdAt: Date | null;
}

type NotificationWrite = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  dedupeKey: string;
  ctaLabel?: string;
  ctaRoute?: string;
  priority?: NotificationPriority;
  entityId?: string;
  entityType?: 'batch' | 'lead' | 'wallet' | 'transaction' | 'system';
  metadata?: Record<string, string | number | boolean | null>;
  eventAt?: unknown;
};

const QUALIFIED_DISPOSITIONS = new Set(['interested', 'callback_requested', 'meeting_scheduled']);

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

const toEpochSecond = (value: unknown): number => {
  const date = toDate(value);
  if (!date) return 0;
  return Math.floor(date.getTime() / 1000);
};

const todayKey = (): string => {
  const now = new Date();
  const mm = `${now.getMonth() + 1}`.padStart(2, '0');
  const dd = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}${mm}${dd}`;
};

const safeBatchLabel = (batchId: string | undefined): string => {
  if (!batchId) return 'Batch';
  return `Batch #${batchId.slice(0, 8)}`;
};

const toNotificationModel = (id: string, data: DocumentData): UserNotification => ({
  id,
  userId: String(data.userId || ''),
  type: data.type as NotificationType,
  title: String(data.title || ''),
  body: String(data.body || ''),
  ctaLabel: data.ctaLabel ? String(data.ctaLabel) : undefined,
  ctaRoute: data.ctaRoute ? String(data.ctaRoute) : undefined,
  priority: (data.priority as NotificationPriority) || 'medium',
  isRead: Boolean(data.isRead),
  entityId: data.entityId ? String(data.entityId) : undefined,
  entityType: data.entityType as UserNotification['entityType'],
  metadata: (data.metadata as Record<string, string | number | boolean | null>) || undefined,
  dedupeKey: String(data.dedupeKey || id),
  eventAt: toDate(data.eventAt),
  createdAt: toDate(data.createdAt),
});

export function subscribeToUserNotifications(
  userId: string,
  callback: (notifications: UserNotification[]) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(80));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((snap) => toNotificationModel(snap.id, snap.data()));
      callback(items);
    },
    (error) => {
      console.error('Failed to subscribe to notifications:', error);
      callback([]);
    }
  );
}

export async function upsertUserNotification(input: NotificationWrite): Promise<void> {
  const notificationsRef = collection(db, 'users', input.userId, 'notifications');
  const notificationRef = doc(notificationsRef, input.dedupeKey);
  const eventAtDate = toDate(input.eventAt) || new Date();

  await setDoc(
    notificationRef,
    {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      ctaLabel: input.ctaLabel || null,
      ctaRoute: input.ctaRoute || null,
      priority: input.priority || 'medium',
      isRead: false,
      entityId: input.entityId || null,
      entityType: input.entityType || 'system',
      metadata: input.metadata || null,
      dedupeKey: input.dedupeKey,
      eventAt: eventAtDate,
      createdAt: eventAtDate,
    },
    { merge: true }
  );
}

export function startOperationalNotificationEngine(userId: string): () => void {
  if (!userId) return () => {};

  const unsubs: (() => void)[] = [];

  const batchesQ = query(collection(db, 'batches'), where('userId', '==', userId));
  unsubs.push(
    onSnapshot(batchesQ, (snapshot) => {
      snapshot.docs.forEach((batchDoc) => {
        const batch = batchDoc.data();
        const status = String(batch.status || '').toLowerCase();
        const batchId = String(batch.batchId || batchDoc.id);
        const completedAt = batch.completedAt || batch.updatedAt || batch.createdAt;

        if (status === 'completed') {
          const completedKey = `batch_completed_${batchId}_${toEpochSecond(completedAt)}`;
          void upsertUserNotification({
            userId,
            type: 'batch_completed',
            dedupeKey: completedKey,
            title: 'Your campaign finished successfully',
            body: `${safeBatchLabel(batchId)} completed. Your AI caller has finished outreach and logged outcomes.`,
            ctaLabel: 'View Batch',
            ctaRoute: '/leads',
            priority: 'high',
            entityId: batchId,
            entityType: 'batch',
            eventAt: completedAt,
          });

          const interestedCount = Number(batch.interestedCount || 0);
          if (interestedCount > 0) {
            const insightKey = `ai_insight_interest_${batchId}_${toEpochSecond(completedAt)}`;
            void upsertUserNotification({
              userId,
              type: 'ai_insight',
              dedupeKey: insightKey,
              title: 'New Buyer Interest Detected',
              body: `${interestedCount} qualified lead${interestedCount > 1 ? 's are' : ' is'} ready for follow-up from ${safeBatchLabel(batchId)}.`,
              ctaLabel: 'Review Leads',
              ctaRoute: '/leads',
              priority: 'high',
              entityId: batchId,
              entityType: 'batch',
              metadata: { interestedCount },
              eventAt: completedAt,
            });
          }
        }
      });
    })
  );

  const leadsQ = query(collection(db, 'leads'), where('userId', '==', userId));
  unsubs.push(
    onSnapshot(leadsQ, (snapshot) => {
      snapshot.docs.forEach((leadDoc) => {
        const lead = leadDoc.data();
        const leadId = String(lead.leadId || leadDoc.id);
        const batchId = String(lead.batchId || '');
        const eventAt = lead.lastActionAt || lead.lastAttemptAt || lead.createdAt;
        const disposition = String(lead.aiDisposition || '').toLowerCase();
        const status = String(lead.status || '').toLowerCase();

        if (QUALIFIED_DISPOSITIONS.has(disposition)) {
          const qualifiedKey = `qualified_lead_${leadId}_${toEpochSecond(eventAt)}`;
          void upsertUserNotification({
            userId,
            type: 'qualified_lead',
            dedupeKey: qualifiedKey,
            title: 'A potential buyer showed interest',
            body: `New qualified lead ready for follow-up from ${safeBatchLabel(batchId)}.`,
            ctaLabel: 'Open Leads',
            ctaRoute: '/leads',
            priority: 'high',
            entityId: leadId,
            entityType: 'lead',
            metadata: {
              batchId,
              aiDisposition: disposition,
            },
            eventAt,
          });
        }

        if (status === 'failed_retryable') {
          const retryKey = `manual_retry_${leadId}_${toEpochSecond(eventAt)}`;
          void upsertUserNotification({
            userId,
            type: 'manual_retry_required',
            dedupeKey: retryKey,
            title: 'Quick retry can recover this lead',
            body: `Manual retry required for a lead in ${safeBatchLabel(batchId)}.`,
            ctaLabel: 'Retry in Batch',
            ctaRoute: '/batch-dashboard',
            priority: 'medium',
            entityId: leadId,
            entityType: 'lead',
            metadata: {
              batchId,
              status,
            },
            eventAt,
          });
        }
      });
    })
  );

  const walletDocRef = doc(db, 'wallets', userId);
  unsubs.push(
    onSnapshot(walletDocRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const wallet = snapshot.data();
      const balance = Number(wallet.balance || 0);
      const lockedAmount = Number(wallet.lockedAmount || 0);
      const available = Math.max(0, balance - lockedAmount);
      const lowBalanceThreshold = 150;

      if (available < lowBalanceThreshold) {
        const lowWalletKey = `wallet_low_${todayKey()}`;
        void upsertUserNotification({
          userId,
          type: 'wallet_low',
          dedupeKey: lowWalletKey,
          title: 'Wallet balance is getting low',
          body: `Only Rs.${Math.round(available)} left. Recharge now to keep AI calls running without interruption.`,
          ctaLabel: 'Recharge Wallet',
          ctaRoute: '/wallet',
          priority: 'high',
          entityId: userId,
          entityType: 'wallet',
          metadata: {
            available,
            threshold: lowBalanceThreshold,
          },
          eventAt: wallet.updatedAt,
        });
      }
    })
  );

  const transactionsQ = query(collection(db, 'wallets', userId, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
  unsubs.push(
    onSnapshot(transactionsQ, (snapshot) => {
      snapshot.docs.forEach((transactionDoc) => {
        const tx = transactionDoc.data();
        const transactionId = String(tx.transactionId || transactionDoc.id);
        const txType = String(tx.type || '').toLowerCase();
        const amount = Number(tx.amount || 0);
        const eventAt = tx.createdAt || Timestamp.now();

        if (txType === 'recharge') {
          const rechargeKey = `wallet_recharge_${transactionId}`;
          void upsertUserNotification({
            userId,
            type: 'wallet_recharge_success',
            dedupeKey: rechargeKey,
            title: 'Wallet recharge successful - your AI calls are ready',
            body: `Rs.${Math.round(amount)} added successfully. Your campaigns are ready to run.`,
            ctaLabel: 'View Wallet',
            ctaRoute: '/wallet',
            priority: 'medium',
            entityId: transactionId,
            entityType: 'transaction',
            metadata: { amount, transactionType: txType },
            eventAt,
          });
          return;
        }

        if (txType === 'batch_debit' || txType === 'deduction' || txType === 'refund') {
          const billingKey = `billing_tx_${transactionId}`;
          const verb = txType === 'refund' ? 'recorded as refund' : 'recorded successfully';
          void upsertUserNotification({
            userId,
            type: 'billing_transaction',
            dedupeKey: billingKey,
            title: 'Billing update recorded',
            body: `Transaction of Rs.${Math.round(amount)} ${verb}.`,
            ctaLabel: 'See Transactions',
            ctaRoute: '/transaction-history',
            priority: 'low',
            entityId: transactionId,
            entityType: 'transaction',
            metadata: { amount, transactionType: txType },
            eventAt,
          });
        }
      });
    })
  );

  return () => {
    unsubs.forEach((unsubscribe) => unsubscribe());
  };
}
