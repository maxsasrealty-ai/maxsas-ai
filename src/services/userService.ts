/**
 * User Service
 * Handles user document operations with backward compatibility
 * for concurrency control fields added in PHASE 1
 */

import { getAuth } from 'firebase/auth';
import {
    doc,
    getDoc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserTier } from '../types/batch';

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
};

export type UserDemoStatus = {
  demoEligible: boolean;
  demoUsed: boolean;
  hasSeenDemo: boolean;
};

/**
 * Gets user document from Firestore
 * Provides backward-compatible defaults for missing concurrency control fields
 * 
 * @param userId - User ID to fetch
 * @returns User data with all required fields
 */
export async function getUser(userId: string): Promise<User> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const data = userSnap.data();

  // Backward-compatible: Provide defaults for fields that may not exist
  const user: User = {
    userId: data.userId || data.uid || userId,
    email: data.email || '',
    displayName: data.displayName || undefined,
    // PHASE 1 fields with backward-compatible defaults
    maxCurrentCalls: data.maxCurrentCalls ?? 2,
    currentActiveCalls: data.currentActiveCalls ?? 0,
    tier: (data.tier as UserTier) ?? 'free',
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || data.lastUpdated || Timestamp.now(),
  };

  // If any fields were missing, update the document
  if (
    data.maxCurrentCalls === undefined ||
    data.currentActiveCalls === undefined ||
    data.tier === undefined ||
    data.updatedAt === undefined
  ) {
    await initializeMissingUserFields(userId, user);
  }

  return user;
}

/**
 * Gets current logged-in user's data
 * 
 * @returns User data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  try {
    return await getUser(currentUser.uid);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Initializes missing concurrency control fields for existing users
 * Only updates fields that are missing, preserves existing data
 * 
 * @param userId - User ID
 * @param userData - User data with defaults
 */
async function initializeMissingUserFields(
  userId: string,
  userData: User
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) {
        return;
      }

      const data = userSnap.data();
      const updates: any = {};

      // Only add fields that are missing
      if (data.userId === undefined && data.uid !== undefined) {
        updates.userId = data.uid;
      }
      if (data.maxCurrentCalls === undefined) {
        updates.maxCurrentCalls = userData.maxCurrentCalls;
      }
      if (data.currentActiveCalls === undefined) {
        updates.currentActiveCalls = userData.currentActiveCalls;
      }
      if (data.tier === undefined) {
        updates.tier = userData.tier;
      }
      if (data.createdAt === undefined) {
        updates.createdAt = userData.createdAt;
      }
      if (data.updatedAt === undefined) {
        updates.updatedAt = serverTimestamp();
      }

      // Only perform update if there are missing fields
      if (Object.keys(updates).length > 0) {
        transaction.update(userRef, updates);
        console.log(`✅ Initialized missing user fields for ${userId}:`, Object.keys(updates));
      }
    });
  } catch (error) {
    console.error('Error initializing user fields:', error);
    // Don't throw - this is a background update
  }
}

/**
 * Updates user tier
 * Only automation/admin should call this
 * 
 * @param userId - User ID
 * @param tier - New tier
 */
export async function updateUserTier(
  userId: string,
  tier: UserTier
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    tier,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Updated user ${userId} tier to ${tier}`);
}

/**
 * Updates user's max concurrent calls limit
 * Only automation/admin should call this
 * 
 * @param userId - User ID
 * @param maxCalls - New max concurrent calls limit
 */
export async function updateUserMaxCalls(
  userId: string,
  maxCalls: number
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (maxCalls < 0) {
    throw new Error('Max calls must be a positive number');
  }

  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    maxCurrentCalls: maxCalls,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Updated user ${userId} max concurrent calls to ${maxCalls}`);
}

/**
 * Atomically increments user's active calls counter
 * Used by AI Call Dispatcher
 * 
 * @param userId - User ID
 * @param count - Number to increment (default 1)
 * @returns New active calls count
 */
export async function incrementUserActiveCalls(
  userId: string,
  count: number = 1
): Promise<number> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (count <= 0) {
    throw new Error('Increment count must be positive');
  }

  const newCount = await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const data = userSnap.data();
    const currentActive = data.currentActiveCalls ?? 0;
    const maxAllowed = data.maxCurrentCalls ?? 2;
    const newActive = currentActive + count;

    // Check if increment would exceed limit
    if (newActive > maxAllowed) {
      throw new Error(
        `Cannot increment: would exceed max limit (${newActive} > ${maxAllowed})`
      );
    }

    transaction.update(userRef, {
      currentActiveCalls: newActive,
      updatedAt: serverTimestamp(),
    });

    return newActive;
  });

  console.log(`✅ Incremented user ${userId} active calls to ${newCount}`);
  return newCount;
}

/**
 * Atomically decrements user's active calls counter
 * Used by AI Call Dispatcher
 * 
 * @param userId - User ID
 * @param count - Number to decrement (default 1)
 * @returns New active calls count
 */
export async function decrementUserActiveCalls(
  userId: string,
  count: number = 1
): Promise<number> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (count <= 0) {
    throw new Error('Decrement count must be positive');
  }

  const newCount = await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const data = userSnap.data();
    const currentActive = data.currentActiveCalls ?? 0;
    
    // Prevent going below 0
    const newActive = Math.max(0, currentActive - count);

    transaction.update(userRef, {
      currentActiveCalls: newActive,
      updatedAt: serverTimestamp(),
    });

    return newActive;
  });

  console.log(`✅ Decremented user ${userId} active calls to ${newCount}`);
  return newCount;
}

/**
 * Subscribes to real-time user document updates
 * 
 * @param userId - User ID to subscribe to
 * @param callback - Function called with updated user data
 * @param onError - Optional error handler
 * @returns Unsubscribe function
 */
export function subscribeToUser(
  userId: string,
  callback: (user: User) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    const error = new Error('User ID is required');
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
    return () => {};
  }

  const userRef = doc(db, 'users', userId);

  const unsubscribe = onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        if (onError) {
          onError(new Error('User not found'));
        }
        return;
      }

      const data = snapshot.data();

      // Backward-compatible defaults
      const user: User = {
        userId: data.userId || data.uid || userId,
        email: data.email || '',
        displayName: data.displayName || undefined,
        maxCurrentCalls: data.maxCurrentCalls ?? 2,
        currentActiveCalls: data.currentActiveCalls ?? 0,
        tier: (data.tier as UserTier) ?? 'free',
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || data.lastUpdated || Timestamp.now(),
      };

      callback(user);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      }
    }
  );

  return unsubscribe;
}

/**
 * Checks if user has available capacity for new calls
 * 
 * @param userId - User ID
 * @param additionalCalls - Number of calls to check capacity for
 * @returns True if user has capacity
 */
export async function hasUserCapacity(
  userId: string,
  additionalCalls: number = 1
): Promise<boolean> {
  try {
    const user = await getUser(userId);
    const availableCapacity = user.maxCurrentCalls - user.currentActiveCalls;
    return availableCapacity >= additionalCalls;
  } catch (error) {
    console.error('Error checking user capacity:', error);
    return false;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    name: (data.name as string) || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
  };
}

export async function isUserProfileComplete(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return !!(profile?.name?.trim() && profile?.phone?.trim());
}

export async function upsertUserProfile(
  userId: string,
  profile: { name: string; phone: string; email?: string }
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  const existingSnap = await getDoc(userRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : null;

  const resolvedEmail = profile.email || existingData?.email || '';
  const resolvedMaxCurrentCalls = existingData?.maxCurrentCalls ?? 2;
  const resolvedCurrentActiveCalls = existingData?.currentActiveCalls ?? 0;
  const resolvedTier = existingData?.tier ?? 'free';
  const resolvedDemoEligible = existingData?.demoEligible ?? true;
  const resolvedDemoUsed = existingData?.demoUsed ?? false;
  const resolvedHasSeenDemo = existingData?.hasSeenDemo ?? false;

  const sanitizedName = profile.name.trim().replace(/\s+/g, ' ');
  const nameRegex = /^[A-Za-z ]+$/;

  if (!sanitizedName || !nameRegex.test(sanitizedName)) {
    throw new Error('Name must contain only alphabets and spaces.');
  }

  const digitsOnly = profile.phone.replace(/\D/g, '');
  const normalizedPhone = digitsOnly.length === 12 && digitsOnly.startsWith('91')
    ? digitsOnly.slice(2)
    : digitsOnly;
  const phoneRegex = /^[987]\d{9}$/;

  if (!phoneRegex.test(normalizedPhone)) {
    throw new Error('Phone number must be 10 digits and start with 9, 8, or 7.');
  }

  await setDoc(
    userRef,
    {
      userId,
      name: sanitizedName,
      phone: normalizedPhone,
      email: resolvedEmail,
      maxCurrentCalls: resolvedMaxCurrentCalls,
      currentActiveCalls: resolvedCurrentActiveCalls,
      tier: resolvedTier,
      demoEligible: resolvedDemoEligible,
      demoUsed: resolvedDemoUsed,
      hasSeenDemo: resolvedHasSeenDemo,
      createdAt: existingData?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Gets demo call status from Firestore user document
 * 
 * IMPORTANT: This is the single source of truth for demo eligibility.
 * No local storage is used. Status persists across app reinstalls.
 * 
 * @param userId - User ID to query
 * @returns Demo eligibility and usage status from Firestore
 */
export async function getUserDemoStatus(userId: string): Promise<UserDemoStatus> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      demoEligible: false,
      demoUsed: false,
      hasSeenDemo: false,
    };
  }

  const data = userSnap.data();

  return {
    demoEligible: data.demoEligible !== false,
    demoUsed: Boolean(data.demoUsed),
    hasSeenDemo: Boolean(data.hasSeenDemo),
  };
}

export async function markUserHasSeenDemo(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    hasSeenDemo: true,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserCurrentDemoCallId(userId: string): Promise<string | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return typeof data.demoCallId === 'string' && data.demoCallId.trim() !== ''
    ? data.demoCallId
    : null;
}

export async function markDemoCallCompleted(userId: string, demoCallId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!demoCallId) {
    throw new Error('Demo call ID is required');
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    demoUsed: true,
    demoCallId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates user document after demo transcript is viewed
 * Sets demoTranscriptViewed = true, demoEligible = false, and demoUsed = true
 * 
 * GUARD: This permanently disables demo for this user in Firestore.
 * Prevents demo from reappearing after app reinstall.
 * 
 * @param userId - User ID to update
 */
export async function updateDemoTranscriptViewed(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    demoTranscriptViewed: true,
    demoEligible: false,
    demoUsed: true,
    updatedAt: serverTimestamp(),
  });
}
