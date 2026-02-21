/**
 * System Service
 * PHASE 2: Manages global system runtime configuration and concurrency control
 * 
 * Controls global limits for AI Call Dispatcher:
 * - Active concurrent calls across all users
 * - Maximum allowed system capacity
 * - Ringg channel limit
 * - Dispatcher instance count
 * - Maintenance mode flag
 */

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SystemRuntime } from '../types/batch';

const SYSTEM_DOC_PATH = 'system/runtime';

/**
 * Default system configuration
 */
const DEFAULT_SYSTEM_RUNTIME: SystemRuntime = {
  activeCalls: 0,
  maxAllowedCalls: 40,
  ringgChannelLimit: 50,
  dispatcherInstanceCount: 1,
  maintenanceMode: false,
  updatedAt: Timestamp.now(),
};

/**
 * Gets current system runtime configuration
 * Creates document with defaults if it doesn't exist
 * 
 * @returns SystemRuntime data
 */
export async function getRuntime(): Promise<SystemRuntime> {
  try {
    const runtimeRef = doc(db, SYSTEM_DOC_PATH);
    const runtimeSnap = await getDoc(runtimeRef);

    if (!runtimeSnap.exists()) {
      // Initialize with default values
      await setDoc(runtimeRef, {
        ...DEFAULT_SYSTEM_RUNTIME,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ System runtime initialized with defaults');
      return DEFAULT_SYSTEM_RUNTIME;
    }

    const data = runtimeSnap.data();
    return {
      activeCalls: data.activeCalls || 0,
      maxAllowedCalls: data.maxAllowedCalls || 40,
      ringgChannelLimit: data.ringgChannelLimit || 50,
      dispatcherInstanceCount: data.dispatcherInstanceCount || 1,
      maintenanceMode: data.maintenanceMode || false,
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  } catch (error) {
    console.error('Error getting system runtime:', error);
    throw new Error('Failed to fetch system configuration');
  }
}

/**
 * Atomically increments the active calls counter
 * Uses Firestore transaction to ensure atomic operation
 * 
 * @param count - Number of calls to add (default 1)
 * @returns New active calls count
 */
export async function incrementActiveCalls(count: number = 1): Promise<number> {
  if (count <= 0) {
    throw new Error('Increment count must be positive');
  }

  try {
    const newCount = await runTransaction(db, async (transaction) => {
      const runtimeRef = doc(db, SYSTEM_DOC_PATH);
      const runtimeSnap = await transaction.get(runtimeRef);

      let currentActiveCalls = 0;

      if (runtimeSnap.exists()) {
        currentActiveCalls = runtimeSnap.data().activeCalls || 0;
      }

      const newActiveCalls = currentActiveCalls + count;

      if (runtimeSnap.exists()) {
        transaction.update(runtimeRef, {
          activeCalls: newActiveCalls,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Initialize document if it doesn't exist
        transaction.set(runtimeRef, {
          ...DEFAULT_SYSTEM_RUNTIME,
          activeCalls: newActiveCalls,
          updatedAt: serverTimestamp(),
        });
      }

      return newActiveCalls;
    });

    console.log(`✅ Incremented active calls by ${count}. New count: ${newCount}`);
    return newCount;
  } catch (error) {
    console.error('Error incrementing active calls:', error);
    throw new Error('Failed to increment active calls');
  }
}

/**
 * Atomically decrements the active calls counter
 * Uses Firestore transaction to ensure atomic operation
 * Prevents going below 0
 * 
 * @param count - Number of calls to remove (default 1)
 * @returns New active calls count
 */
export async function decrementActiveCalls(count: number = 1): Promise<number> {
  if (count <= 0) {
    throw new Error('Decrement count must be positive');
  }

  try {
    const newCount = await runTransaction(db, async (transaction) => {
      const runtimeRef = doc(db, SYSTEM_DOC_PATH);
      const runtimeSnap = await transaction.get(runtimeRef);

      let currentActiveCalls = 0;

      if (runtimeSnap.exists()) {
        currentActiveCalls = runtimeSnap.data().activeCalls || 0;
      }

      // Prevent negative values
      const newActiveCalls = Math.max(0, currentActiveCalls - count);

      if (runtimeSnap.exists()) {
        transaction.update(runtimeRef, {
          activeCalls: newActiveCalls,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Initialize document if it doesn't exist (edge case)
        transaction.set(runtimeRef, {
          ...DEFAULT_SYSTEM_RUNTIME,
          activeCalls: 0,
          updatedAt: serverTimestamp(),
        });
      }

      return newActiveCalls;
    });

    console.log(`✅ Decremented active calls by ${count}. New count: ${newCount}`);
    return newCount;
  } catch (error) {
    console.error('Error decrementing active calls:', error);
    throw new Error('Failed to decrement active calls');
  }
}

/**
 * Updates system runtime configuration
 * 
 * @param updates - Partial SystemRuntime fields to update
 * @returns Updated SystemRuntime
 */
export async function updateRuntime(
  updates: Partial<Omit<SystemRuntime, 'updatedAt'>>
): Promise<SystemRuntime> {
  try {
    const runtimeRef = doc(db, SYSTEM_DOC_PATH);

    await runTransaction(db, async (transaction) => {
      const runtimeSnap = await transaction.get(runtimeRef);

      if (runtimeSnap.exists()) {
        transaction.update(runtimeRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Initialize with defaults + updates
        transaction.set(runtimeRef, {
          ...DEFAULT_SYSTEM_RUNTIME,
          ...updates,
          updatedAt: serverTimestamp(),
        });
      }
    });

    console.log('✅ System runtime updated:', updates);

    // Fetch and return updated runtime
    return await getRuntime();
  } catch (error) {
    console.error('Error updating system runtime:', error);
    throw new Error('Failed to update system configuration');
  }
}

/**
 * Checks if system can accept more calls
 * 
 * @param additionalCalls - Number of calls to check capacity for
 * @returns True if system has capacity
 */
export async function hasCapacity(additionalCalls: number = 1): Promise<boolean> {
  try {
    const runtime = await getRuntime();

    if (runtime.maintenanceMode) {
      console.warn('⚠️ System in maintenance mode');
      return false;
    }

    const availableCapacity = runtime.maxAllowedCalls - runtime.activeCalls;
    return availableCapacity >= additionalCalls;
  } catch (error) {
    console.error('Error checking system capacity:', error);
    return false;
  }
}
