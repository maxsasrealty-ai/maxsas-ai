import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { COST_PER_CALL } from '@/src/services/walletService';

export type LedgerTransactionType = 'lead_debit' | 'batch_debit' | 'recharge';

export type LedgerTransaction = {
  transactionId: string;
  userId: string;
  batchId: string | null;
  leadId: string | null;
  type: LedgerTransactionType;
  amount: number;
  minutesCharged: number;
  rate: number;
  createdAt: any;
};

type RecordLeadDebitInput = {
  userId: string;
  batchId: string;
  leadId: string;
  minutesCharged: number;
  rate?: number;
};

export async function recordLeadDebitAndAccumulateBatch(input: RecordLeadDebitInput): Promise<string> {
  const { userId, batchId, leadId, minutesCharged } = input;
  const rate = input.rate ?? COST_PER_CALL;
  const safeMinutes = Math.max(0, minutesCharged);
  const amount = Number((safeMinutes * rate).toFixed(2));

  if (!userId || !batchId || !leadId) {
    throw new Error('userId, batchId and leadId are required');
  }

  const transactionRef = doc(collection(db, 'transactions'));
  const batchRef = doc(db, 'batches', batchId);

  await runTransaction(db, async (transaction) => {
    const batchSnap = await transaction.get(batchRef);

    if (!batchSnap.exists()) {
      throw new Error('Batch not found');
    }

    const batchData = batchSnap.data();
    const currentBatchTotal = Number(batchData.batchTotalCost || 0);

    transaction.set(transactionRef, {
      transactionId: transactionRef.id,
      userId,
      batchId,
      leadId,
      type: 'lead_debit',
      amount,
      minutesCharged: safeMinutes,
      rate,
      createdAt: serverTimestamp(),
    });

    transaction.update(batchRef, {
      batchTotalCost: Number((currentBatchTotal + amount).toFixed(2)),
      updatedAt: serverTimestamp(),
    });
  });

  return transactionRef.id;
}

export async function finalizeCompletedBatchBilling(userId: string, batchId: string): Promise<void> {
  if (!userId || !batchId) {
    throw new Error('userId and batchId are required');
  }

  const batchRef = doc(db, 'batches', batchId);
  const walletRef = doc(db, 'wallets', userId);
  const transactionRef = doc(collection(db, 'transactions'));

  await runTransaction(db, async (transaction) => {
    const [batchSnap, walletSnap] = await Promise.all([
      transaction.get(batchRef),
      transaction.get(walletRef),
    ]);

    if (!batchSnap.exists()) {
      throw new Error('Batch not found');
    }

    if (!walletSnap.exists()) {
      throw new Error('Wallet not found');
    }

    const batchData = batchSnap.data();
    const walletData = walletSnap.data();

    if (batchData.status !== 'completed') {
      throw new Error('Batch is not completed');
    }

    if (batchData.billingLedgerStatus === 'finalized') {
      return;
    }

    const batchTotalCost = Number(batchData.batchTotalCost || 0);
    const currentBalance = Number(walletData.balance || 0);
    const currentLocked = Number(walletData.lockedAmount || 0);
    const currentTotalSpent = Number(walletData.totalSpent || 0);

    if (batchTotalCost < 0) {
      throw new Error('Invalid batchTotalCost');
    }

    if (currentBalance < batchTotalCost) {
      throw new Error('Insufficient wallet balance for batch finalization');
    }

    const newBalance = Number((currentBalance - batchTotalCost).toFixed(2));
    const newLockedAmount = Math.max(0, Number((currentLocked - batchTotalCost).toFixed(2)));
    const newTotalSpent = Number((currentTotalSpent + batchTotalCost).toFixed(2));

    transaction.update(walletRef, {
      balance: newBalance,
      lockedAmount: newLockedAmount,
      totalSpent: newTotalSpent,
      updatedAt: serverTimestamp(),
    });

    transaction.set(transactionRef, {
      transactionId: transactionRef.id,
      userId,
      batchId,
      leadId: null,
      type: 'batch_debit',
      amount: batchTotalCost,
      minutesCharged: 0,
      rate: COST_PER_CALL,
      createdAt: serverTimestamp(),
    });

    transaction.update(batchRef, {
      billingLedgerStatus: 'finalized',
      billedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getBalanceHistoryTransactions(userId: string, maxItems: number = 100): Promise<LedgerTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      transactionId: data.transactionId || document.id,
      userId: data.userId,
      batchId: data.batchId ?? null,
      leadId: data.leadId ?? null,
      type: data.type,
      amount: Number(data.amount || 0),
      minutesCharged: Number(data.minutesCharged || 0),
      rate: Number(data.rate || 0),
      createdAt: data.createdAt,
    } as LedgerTransaction;
  });
}

export async function getBatchLeadDebitTransactions(userId: string, batchId: string): Promise<LedgerTransaction[]> {
  if (!userId || !batchId) {
    throw new Error('userId and batchId are required');
  }

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('batchId', '==', batchId),
    where('type', '==', 'lead_debit'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      transactionId: data.transactionId || document.id,
      userId: data.userId,
      batchId: data.batchId ?? null,
      leadId: data.leadId ?? null,
      type: data.type,
      amount: Number(data.amount || 0),
      minutesCharged: Number(data.minutesCharged || 0),
      rate: Number(data.rate || 0),
      createdAt: data.createdAt,
    } as LedgerTransaction;
  });
}

export async function getBatchDebitTransactions(userId: string, maxItems: number = 100): Promise<LedgerTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('type', '==', 'batch_debit'),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      transactionId: data.transactionId || document.id,
      userId: data.userId,
      batchId: data.batchId ?? null,
      leadId: data.leadId ?? null,
      type: data.type,
      amount: Number(data.amount || 0),
      minutesCharged: Number(data.minutesCharged || 0),
      rate: Number(data.rate || 0),
      createdAt: data.createdAt,
    } as LedgerTransaction;
  });
}
