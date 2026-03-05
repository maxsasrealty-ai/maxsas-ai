import {
    collection,
    doc,
    getDocs,
    increment,
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

export async function finalizeCompletedBatchBilling(batchId: string): Promise<void> {
  if (!batchId) {
    throw new Error('batchId is required');
  }

  const batchRef = doc(db, 'batches', batchId);
  const deterministicLedgerId = `batch_debit_${batchId}`;
  const deterministicLedgerRef = doc(db, 'transactions', deterministicLedgerId);

  await runTransaction(db, async (transaction) => {
    const batchSnap = await transaction.get(batchRef);

    if (!batchSnap.exists()) {
      throw new Error('Batch not found');
    }

    const batchData = batchSnap.data();

    if (batchData.billingLedgerStatus === 'finalized') {
      return;
    }

    const ledgerSnap = await transaction.get(deterministicLedgerRef);
    if (ledgerSnap.exists()) {
      return;
    }

    const userId = batchData.userId;
    if (!userId) {
      throw new Error('Batch userId is missing');
    }

    const batchTotalCost = Number(batchData.batchTotalCost ?? 0);
    if (batchTotalCost < 0) {
      throw new Error('Invalid batchTotalCost');
    }

    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await transaction.get(walletRef);

    if (!walletSnap.exists()) {
      throw new Error('Wallet not found');
    }

    const walletData = walletSnap.data();
    const currentBalance = Number(walletData.balance ?? 0);

    if (currentBalance < batchTotalCost) {
      throw new Error('Insufficient wallet balance for batch finalization');
    }

    transaction.update(walletRef, {
      balance: increment(-batchTotalCost),
      totalSpent: increment(batchTotalCost),
      updatedAt: serverTimestamp(),
    });

    transaction.update(batchRef, {
      billingLedgerStatus: 'finalized',
      billedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(deterministicLedgerRef, {
      transactionId: deterministicLedgerId,
      userId,
      batchId,
      leadId: null,
      type: 'batch_debit',
      amount: batchTotalCost,
      minutesCharged: 0,
      rate: COST_PER_CALL,
      createdAt: serverTimestamp(),
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
