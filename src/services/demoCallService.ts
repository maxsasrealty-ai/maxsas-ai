import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';

import { db } from '@/src/lib/firebase';

type DemoCallStatus = 'initiated' | 'in_progress' | 'completed' | 'failed';

export type DemoCallExecutionResult = {
  demoCallId: string;
  status: DemoCallStatus;
  transcript: string;
};

export type DemoCallTarget = {
  targetName: string;
  targetPhone: string;
};

export type DemoCallDocument = {
  demoCallId: string;
  userId: string;
  targetName: string | null;
  targetPhone: string | null;
  status: DemoCallStatus;
  transcript: string;
  script: string;
  createdAt: any;
  updatedAt: any;
  startedAt: any;
  completedAt: any;
  demoCompletedAt: any;
};

const DEMO_CALL_WEBHOOK_URL = 'http://165.22.222.202:5678/webhook/ringg-init';

export async function executeDemoCallFlow(
  userId: string,
  target?: DemoCallTarget,
): Promise<DemoCallExecutionResult> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!target?.targetName?.trim() || !target?.targetPhone?.trim()) {
    throw new Error('Target name and phone are required');
  }

  const userRef = doc(db, 'users', userId);
  const demoCallRef = doc(collection(db, 'demoCalls'));
  const isGuestUser = userId.startsWith('GUEST_');

  if (isGuestUser) {
    await setDoc(demoCallRef, {
      demoCallId: demoCallRef.id,
      userId,
      targetName: target?.targetName || null,
      targetPhone: target?.targetPhone || null,
      status: 'initiated',
      transcript: '',
      script: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startedAt: null,
      completedAt: null,
      demoCompletedAt: null,
    });
  } else {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();

      // GUARD: Prevent duplicate demo execution
      // This is a server-side check to ensure demo cannot be triggered twice
      // even if the user reinstalls the app or bypasses UI guards
      if (userData.demoUsed === true) {
        throw new Error('Demo call has already been used for this account');
      }

      // GUARD: Only ineligible users should be blocked.
      // Backward compatible: if field is missing, user remains eligible.
      if (userData.demoEligible === false) {
        throw new Error('User is not eligible for demo call');
      }

      transaction.set(demoCallRef, {
        demoCallId: demoCallRef.id,
        userId,
        targetName: target?.targetName || null,
        targetPhone: target?.targetPhone || null,
        status: 'initiated',
        transcript: '',
        script: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startedAt: null,
        completedAt: null,
        demoCompletedAt: null,
      });

      transaction.update(userRef, {
        demoCallId: demoCallRef.id,
        updatedAt: serverTimestamp(),
      });
    });
  }

  try {
    const response = await fetch(DEMO_CALL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetName: target.targetName.trim(),
        targetPhone: target.targetPhone.trim(),
        demoCallId: demoCallRef.id,
        userId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Demo call webhook failed with status ${response.status}`);
    }

    await updateDoc(demoCallRef, {
      status: 'in_progress',
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      demoCallId: demoCallRef.id,
      status: 'in_progress',
      transcript: '',
    };
  } catch (error) {
    await updateDoc(demoCallRef, {
      status: 'failed',
      updatedAt: serverTimestamp(),
    });
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a demo call document.
 * Calls the callback whenever the document changes.
 * Returns an unsubscribe function to clean up the listener.
 */
export function subscribeToDemoCall(
  demoCallId: string,
  onUpdate: (data: DemoCallDocument | null) => void,
  onError?: (error: Error) => void
): () => void {
  const demoCallRef = doc(db, 'demoCalls', demoCallId);

  const unsubscribe = onSnapshot(
    demoCallRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }

      const demoCallData = snapshot.data() as DemoCallDocument;
      onUpdate(demoCallData);
    },
    (error) => {
      console.error('Demo call listener error:', error);
      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
}

export async function getDemoCallById(demoCallId: string): Promise<DemoCallDocument | null> {
  if (!demoCallId) {
    return null;
  }

  const demoCallRef = doc(db, 'demoCalls', demoCallId);
  const snapshot = await getDoc(demoCallRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as DemoCallDocument;
}
