/**
 * Wallet Service
 * Manages user wallet balance and batch payment reservations
 * 
 * Business Rules:
 * - ₹14 per call
 * - Balance deducted ONLY after batch completes
 * - Reserved balance blocks funds for running batches
 */

import { getAuth } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wallet, WalletOperationResult, WalletTransaction } from '../types/batch';

// Business constant
const COST_PER_CALL = 14; // ₹14 per call

/**
 * Gets wallet for current user
 * Creates wallet if it doesn't exist
 * 
 * @param userId - User ID
 * @returns Wallet data
 */
export async function getWallet(userId: string): Promise<Wallet> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const walletRef = doc(db, 'wallets', userId);
  const walletSnap = await getDoc(walletRef);

  if (!walletSnap.exists()) {
    // Return default wallet structure (not saved yet)
    return {
      userId,
      balance: 0,
      lockedAmount: 0,
      totalSpent: 0,
      totalRecharged: 0,
      updatedAt: Timestamp.now(),
    };
  }

  const data = walletSnap.data();
  const lockedAmount = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
  return {
    userId: data.userId,
    balance: data.balance || 0,
    lockedAmount,
    totalSpent: data.totalSpent || 0,
    totalRecharged: data.totalRecharged || 0,
    updatedAt: data.updatedAt || data.lastUpdated || Timestamp.now(),
  };
}

/**
 * Checks if user has sufficient balance before starting a batch
 * 
 * @param userId - User ID
 * @param totalCalls - Number of calls in the batch
 * @returns Result with success status and balance info
 */
export async function checkBalanceBeforeBatch(
  userId: string,
  totalCalls: number
): Promise<WalletOperationResult> {
  if (!userId) {
    return {
      success: false,
      errorMessage: 'User not authenticated',
    };
  }

  if (totalCalls <= 0) {
    return {
      success: false,
      errorMessage: 'Invalid number of calls',
    };
  }

  try {
    const wallet = await getWallet(userId);
    
    const availableBalance = wallet.balance - wallet.lockedAmount;
    const requiredAmount = totalCalls * COST_PER_CALL;

    console.log('💰 Balance check:');
    console.log('  - Total balance:', wallet.balance);
    console.log('  - Locked:', wallet.lockedAmount);
    console.log('  - Available:', availableBalance);
    console.log('  - Required:', requiredAmount);

    if (availableBalance < requiredAmount) {
      return {
        success: false,
        availableBalance,
        requiredAmount,
        errorMessage: `Insufficient balance. Available: ₹${availableBalance}, Required: ₹${requiredAmount}. Please recharge.`,
      };
    }

    return {
      success: true,
      availableBalance,
      requiredAmount,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to check balance',
    };
  }
}

/**
 * Reserves balance when batch starts
 * Uses Firestore transaction to ensure atomic operation
 * 
 * @param userId - User ID
 * @param batchId - Batch ID
 * @param totalCalls - Number of calls in the batch
 * @returns Result with success status
 */
export async function reserveBalanceForBatch(
  userId: string,
  batchId: string,
  totalCalls: number
): Promise<WalletOperationResult> {
  if (!userId) {
    return {
      success: false,
      errorMessage: 'User not authenticated',
    };
  }

  if (!batchId) {
    return {
      success: false,
      errorMessage: 'Batch ID is required',
    };
  }

  if (totalCalls <= 0) {
    return {
      success: false,
      errorMessage: 'Invalid number of calls',
    };
  }

  try {
    const reserveAmount = totalCalls * COST_PER_CALL;

    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      let currentBalance = 0;
      let currentReserved = 0;

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        currentBalance = data.balance || 0;
        currentReserved = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
      }

      const availableBalance = currentBalance - currentReserved;

      // Double-check balance before reserving
      if (availableBalance < reserveAmount) {
        throw new Error(
          `Insufficient balance. Available: ₹${availableBalance}, Required: ₹${reserveAmount}`
        );
      }

      // Reserve the balance
      const newReserved = currentReserved + reserveAmount;

      if (walletSnap.exists()) {
        transaction.update(walletRef, {
          lockedAmount: newReserved,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create wallet if it doesn't exist (edge case)
        transaction.set(walletRef, {
          userId,
          balance: currentBalance,
          lockedAmount: newReserved,
          totalSpent: 0,
          totalRecharged: 0,
          updatedAt: serverTimestamp(),
        });
      }

      console.log(`✅ Reserved ₹${reserveAmount} for batch ${batchId}`);
      console.log(`  - New reserved balance: ₹${newReserved}`);
    });

    return {
      success: true,
      requiredAmount: reserveAmount,
    };
  } catch (error) {
    console.error('Error reserving balance:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to reserve balance',
    };
  }
}

/**
 * Finalizes payment when batch completes
 * Deducts from both reserved balance and actual balance
 * 
 * @param userId - User ID
 * @param batchId - Batch ID
 * @param completedCalls - Number of calls actually completed
 * @returns Result with success status
 */
export async function finalizeBatchPayment(
  userId: string,
  batchId: string,
  completedCalls: number
): Promise<WalletOperationResult> {
  if (!userId) {
    return {
      success: false,
      errorMessage: 'User not authenticated',
    };
  }

  if (!batchId) {
    return {
      success: false,
      errorMessage: 'Batch ID is required',
    };
  }

  if (completedCalls < 0) {
    return {
      success: false,
      errorMessage: 'Invalid number of completed calls',
    };
  }

  try {
    const usedAmount = completedCalls * COST_PER_CALL;

    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }

      const data = walletSnap.data();
      const currentBalance = data.balance || 0;
      const currentReserved = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
      const currentTotalSpent = data.totalSpent || 0;

      // Deduct from both reserved and actual balance
      const newBalance = currentBalance - usedAmount;
      const newReserved = Math.max(0, currentReserved - usedAmount);
      const newTotalSpent = currentTotalSpent + usedAmount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance to finalize payment');
      }

      transaction.update(walletRef, {
        balance: newBalance,
        lockedAmount: newReserved,
        totalSpent: newTotalSpent,
        updatedAt: serverTimestamp(),
      });

      // Record transaction
      const transactionRef = collection(db, 'wallets', userId, 'transactions');
      const transactionDoc = {
        transactionId: `txn_${Date.now()}`,
        userId,
        type: 'deduction' as const,
        amount: usedAmount,
        previousBalance: currentBalance,
        newBalance,
        batchId,
        description: `Batch calling charges: ${completedCalls} calls @ ₹${COST_PER_CALL}/call`,
        createdAt: serverTimestamp(),
      };
      transaction.set(doc(transactionRef, transactionDoc.transactionId), transactionDoc);

      const debitRef = collection(db, 'transactions');
      const debitDoc = {
        userId,
        batchId,
        amount: usedAmount,
        type: 'debit',
        description: 'Batch calling charges',
        timestamp: serverTimestamp(),
      };
      transaction.set(doc(debitRef, `debit_${Date.now()}`), debitDoc);

      console.log(`💳 Finalized payment for batch ${batchId}`);
      console.log(`  - Calls completed: ${completedCalls}`);
      console.log(`  - Amount charged: ₹${usedAmount}`);
      console.log(`  - New balance: ₹${newBalance}`);
      console.log(`  - New reserved: ₹${newReserved}`);
    });

    return {
      success: true,
      requiredAmount: usedAmount,
    };
  } catch (error) {
    console.error('Error finalizing batch payment:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to finalize payment',
    };
  }
}

/**
 * Adds balance to user's wallet (for admin/recharge operations)
 * 
 * @param userId - User ID
 * @param amount - Amount to add
 * @returns Result with success status
 */
export async function addBalanceToWallet(
  userId: string,
  amount: number
): Promise<WalletOperationResult> {
  if (!userId) {
    return {
      success: false,
      errorMessage: 'User not authenticated',
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      errorMessage: 'Amount must be greater than 0',
    };
  }

  try {
    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      let currentBalance = 0;
      let currentTotalRecharged = 0;
      let currentReserved = 0;

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        currentBalance = data.balance || 0;
        currentTotalRecharged = data.totalRecharged || 0;
        currentReserved = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
      }

      const newBalance = currentBalance + amount;
      const newTotalRecharged = currentTotalRecharged + amount;
      if (walletSnap.exists()) {
        transaction.update(walletRef, {
          balance: newBalance,
          totalRecharged: newTotalRecharged,
          lockedAmount: currentReserved,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: newBalance,
          lockedAmount: 0,
          totalSpent: 0,
          totalRecharged: newTotalRecharged,
          updatedAt: serverTimestamp(),
        });
      }

      // Record transaction
      const transactionRef = collection(db, 'wallets', userId, 'transactions');
      const transactionDoc = {
        transactionId: `txn_${Date.now()}`,
        userId,
        type: 'recharge' as const,
        amount,
        previousBalance: currentBalance,
        newBalance,
        description: `Wallet recharge: ₹${amount}`,
        createdAt: serverTimestamp(),
      };
      transaction.set(doc(transactionRef, transactionDoc.transactionId), transactionDoc);

      console.log(`💰 Added ₹${amount} to wallet`);
      console.log(`  - New balance: ₹${newBalance}`);
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error adding balance:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to add balance',
    };
  }
}

/**
 * Adds test balance to the current user's wallet (dev-only helper)
 * No transaction record is created.
 */
export async function addTestBalance(amount: number): Promise<WalletOperationResult> {
  const userId = getAuth().currentUser?.uid;

  if (!userId) {
    return {
      success: false,
      errorMessage: 'User not authenticated',
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      errorMessage: 'Amount must be greater than 0',
    };
  }

  try {
    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      let currentBalance = 0;
      let currentReserved = 0;
      let currentTotalRecharged = 0;

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        currentBalance = data.balance || 0;
        currentReserved = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
        currentTotalRecharged = data.totalRecharged || 0;
      }

      const newBalance = currentBalance + amount;
      const newTotalRecharged = currentTotalRecharged + amount;
      if (walletSnap.exists()) {
        transaction.update(walletRef, {
          balance: newBalance,
          totalRecharged: newTotalRecharged,
          lockedAmount: currentReserved,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: newBalance,
          lockedAmount: 0,
          totalSpent: 0,
          totalRecharged: newTotalRecharged,
          updatedAt: serverTimestamp(),
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding test balance:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed to add test balance',
    };
  }
}

/**
 * Gets current wallet balance (for display)
 * 
 * @returns Available and total balance
 */
export async function getCurrentBalance(): Promise<{
  totalBalance: number;
  reservedBalance: number;
  availableBalance: number;
} | null> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error('User not authenticated');
    return null;
  }

  try {
    const wallet = await getWallet(userId);
    const availableBalance = wallet.balance - wallet.lockedAmount;

    return {
      totalBalance: wallet.balance,
      reservedBalance: wallet.lockedAmount,
      availableBalance,
    };
  } catch (error) {
    console.error('Error getting current balance:', error);
    return null;
  }
}

/**
 * Real-time listener for wallet balance
 * 
 * @param userId - User ID
 * @param callback - Callback function receiving wallet updates
 * @returns Unsubscribe function
 */
export function subscribeToWallet(
  userId: string,
  callback: (wallet: Wallet | null) => void
): () => void {
  if (!userId) {
    console.error('User ID is required for wallet subscription');
    callback(null);
    return () => {};
  }

  const walletRef = doc(db, 'wallets', userId);
  
  const unsubscribe = onSnapshot(
    walletRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        // Wallet doesn't exist yet
        callback({
          userId,
          balance: 0,
          lockedAmount: 0,
          totalSpent: 0,
          totalRecharged: 0,
          updatedAt: Timestamp.now(),
        });
        return;
      }

      const data = snapshot.data();
      const lockedAmount = data.lockedAmount ?? data.reservedBalance ?? data.reservedAmount ?? 0;
      callback({
        userId: data.userId,
        balance: data.balance || 0,
        lockedAmount,
        totalSpent: data.totalSpent || 0,
        totalRecharged: data.totalRecharged || 0,
        updatedAt: data.updatedAt || data.lastUpdated || Timestamp.now(),
      });
    },
    (error) => {
      console.error('Error in wallet subscription:', error);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Get transaction history for a user
 * 
 * @param userId - User ID
 * @param limitCount - Maximum number of transactions to fetch (default 50)
 * @returns Array of wallet transactions
 */
export async function getTransactionHistory(
  userId: string,
  limitCount: number = 50
): Promise<WalletTransaction[]> {
  if (!userId) {
    console.error('User ID is required');
    return [];
  }

  try {
    const transactionsRef = collection(db, 'wallets', userId, 'transactions');
    const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const snapshot = await getDocs(q);
    
    const transactions: WalletTransaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        transactionId: data.transactionId,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        previousBalance: data.previousBalance,
        newBalance: data.newBalance,
        batchId: data.batchId,
        description: data.description,
        createdAt: data.createdAt,
      });
    });

    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Real-time listener for transaction history
 * 
 * @param userId - User ID
 * @param callback - Callback function receiving transaction updates
 * @param limitCount - Maximum number of transactions (default 50)
 * @returns Unsubscribe function
 */
export function subscribeToTransactions(
  userId: string,
  callback: (transactions: WalletTransaction[]) => void,
  limitCount: number = 50
): () => void {
  if (!userId) {
    console.error('User ID is required for transaction subscription');
    callback([]);
    return () => {};
  }

  const transactionsRef = collection(db, 'wallets', userId, 'transactions');
  const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const transactions: WalletTransaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          transactionId: data.transactionId,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          previousBalance: data.previousBalance,
          newBalance: data.newBalance,
          batchId: data.batchId,
          description: data.description,
          createdAt: data.createdAt,
        });
      });
      callback(transactions);
    },
    (error) => {
      console.error('Error in transaction subscription:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Calculate deduction preview
 * 
 * @param totalContacts - Number of contacts
 * @returns Amount that will be deducted
 */
export function calculateDeductionPreview(totalContacts: number): number {
  return totalContacts * COST_PER_CALL;
}

/**
 * Export cost per call constant
 */
export { COST_PER_CALL };
