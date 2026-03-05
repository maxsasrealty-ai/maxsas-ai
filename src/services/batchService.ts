import { getAuth } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Batch, BatchDraft, ExtractedContact } from '../types/batch';
import { createLeadsForBatch, getLeadsForBatch, syncLeadStatusesWithBatch } from './leadService';
import { finalizeCompletedBatchBilling } from './ledgerService';

/**
 * PHASE 4 - FIREBASE WRITE LOGIC
 * 
 * ARCHITECTURE:
 * - ONE batch document in 'batches' collection (metadata only)
 * - SEPARATE lead documents in 'leads' collection (one per phone number)
 * - Each lead references its batchId
 * 
 * Firebase ONLY receives data when user presses "Call Now" or "Schedule"
 * No leads are saved until then.
 */

/**
 * Saves a batch to Firebase
 * Creates ONE batch document and MULTIPLE lead documents
 * 
 * @param batch - The batch draft to save
 * @param action - What action to perform (call_now or schedule)
 * @param scheduleAt - When to schedule (if action is schedule)
 * @returns The batch ID
 */
export async function saveBatchToFirebase(
  batch: BatchDraft,
  action: 'call_now' | 'schedule',
  scheduleAt?: Timestamp
): Promise<string> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // ===== DETAILED DEBUG LOGS - LAYER 3: SERVICE =====
  console.log('\n========== [batchService] saveBatchToFirebase START ==========');
  console.log('🔐 [Service] Auth check - User ID:', userId);
  console.log('📥 [Service] Incoming parameters:', {
    batchId: batch?.batchId,
    batchStatus: batch?.status,
    batchSource: batch?.source,
    action,
    scheduleAt: scheduleAt?.toDate?.() || 'undefined',
  });
  console.log('📦 [Service] Batch object structure:', {
    batchId: batch?.batchId,
    status: batch?.status,
    source: batch?.source,
    totalContacts: batch?.totalContacts,
    contactsCount: batch?.contacts?.length,
    contactsArrayType: Array.isArray(batch?.contacts) ? 'valid array' : typeof batch?.contacts,
    hasCreatedAt: !!batch?.createdAt,
  });
  console.log('📋 [Service] Sample of first 3 contacts:', batch?.contacts?.slice(0, 3).map((c, i) => ({ index: i, phone: c.phone, name: c.name })));

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!batch) {
    throw new Error('Batch object is required');
  }

  if (!batch.batchId) {
    throw new Error('Batch ID is required');
  }

  if (!batch.contacts || batch.contacts.length === 0) {
    console.error('❌ Batch has no contacts:', { batch });
    throw new Error('Batch has no contacts');
  }

  // SCHEDULE VALIDATION: Ensure scheduleAt is in the future
  if (action === 'schedule' && scheduleAt) {
    const now = Timestamp.now();
    const scheduleSeconds = scheduleAt.seconds;
    const nowSeconds = now.seconds;
    
    // Must be at least 1 minute in future
    if (scheduleSeconds <= nowSeconds + 60) {
      console.error('❌ Schedule time validation failed:', {
        scheduleAt: scheduleAt.toDate(),
        now: now.toDate(),
        message: 'Cannot schedule batch within 60 seconds',
      });
      throw new Error(
        'Cannot schedule batch within 60 seconds. ' +
        'Please select a time at least 1 minute in the future.'
      );
    }
    
    // Prevent scheduling too far in future (e.g., > 365 days)
    const MAX_SCHEDULE_DAYS = 365;
    const maxFutureSeconds = nowSeconds + (MAX_SCHEDULE_DAYS * 86400);
    if (scheduleSeconds > maxFutureSeconds) {
      console.error('❌ Schedule time too far in future:', {
        scheduleAt: scheduleAt.toDate(),
        maxAllowed: new Date(maxFutureSeconds * 1000),
        message: `Cannot schedule batch more than ${MAX_SCHEDULE_DAYS} days in future`,
      });
      throw new Error(
        `Cannot schedule batch more than ${MAX_SCHEDULE_DAYS} days in future`
      );
    }
    
    console.log('✅ Schedule time validation passed:', {
      scheduleAt: scheduleAt.toDate(),
      minutesFromNow: Math.floor((scheduleSeconds - nowSeconds) / 60),
    });
  }

  console.log('📦 Batch to save:', {
    batchId: batch.batchId,
    contacts: batch.contacts.length,
    action,
    status: action === 'call_now' ? 'running' : 'scheduled',
    scheduleAt: action === 'schedule' ? scheduleAt?.toDate() : 'N/A',
  });

  try {
    // Step 1: Create ONE batch document in 'batches' collection
    const batchRef = doc(collection(db, 'batches'), batch.batchId);

    const batchData: any = {
      batchId: batch.batchId,
      userId,
      status: action === 'call_now' ? 'running' : 'scheduled',
      processingLock: false, // Kept for backward compatibility
      lockOwner: null, // PHASE 4: Dispatcher instance ID
      lockExpiresAt: null, // PHASE 4: Lock expiration
      priority: 1, // PHASE 4: Default priority
      lastDispatchedAt: Timestamp.fromMillis(0), // PHASE 0: Fair batch rotation
      action,
      source: batch.source,
      totalContacts: batch.contacts.length,
      createdAt: batch.createdAt,
      updatedAt: Timestamp.now(), // PHASE 4: Last update timestamp
      scheduleAt: action === 'schedule' ? (scheduleAt || Timestamp.now()) : null,
      startedAt: action === 'call_now' ? Timestamp.now() : null,
      completedAt: null,
      completedCount: 0,
      failedCount: 0,
      runningCount: 0,
    };

    console.log('\n📝 [Service] Creating batch document in Firestore');
    console.log('🎯 [Service] Document path: batches/' + batch.batchId);
    console.log('📋 [Service] Document data to write:', {
      batchId: batchData.batchId,
      userId: batchData.userId,
      status: batchData.status,
      action: batchData.action,
      source: batchData.source,
      totalContacts: batchData.totalContacts,
      createdAt: batchData.createdAt?.toDate?.() || batchData.createdAt,
      scheduleAt: batchData.scheduleAt?.toDate?.() || batchData.scheduleAt,
    });
    
    await setDoc(batchRef, batchData);
    
    console.log('✅ [Service] Batch document created successfully!');
    console.log('📊 [Service] setDoc result:', {
      batchId: batch.batchId,
      documentCreated: true,
      path: 'batches/' + batch.batchId,
      timestamp: new Date().toISOString(),
    });

    // Step 2: Create SEPARATE lead documents for each contact
    console.log('\n👥 [Service] Creating separate lead documents');
    console.log('📈 [Service] Creating', batch.contacts.length, 'lead documents for batch:', batch.batchId);
    console.log('📋 [Service] Lead creation details:', {
      totalLeads: batch.contacts.length,
      batchId: batch.batchId,
      firstLeadPhone: batch.contacts[0]?.phone,
      lastLeadPhone: batch.contacts[batch.contacts.length - 1]?.phone,
    });
    
    await createLeadsForBatch(batch.batchId, batch.contacts);
    
    console.log('✅ [Service] Leads created successfully!');
    console.log('📊 [Service] createLeadsForBatch result:', {
      leadsCreated: batch.contacts.length,
      batchId: batch.batchId,
      timestamp: new Date().toISOString(),
    });

    console.log('\n✅ [Service] ENTIRE BATCH SAVE OPERATION COMPLETED SUCCESSFULLY');
    console.log('📦 [Service] Final summary:', {
      batchId: batch.batchId,
      userId,
      batchDocumentCreated: true,
      leadsCreated: batch.contacts.length,
      action,
      status: action === 'call_now' ? 'running' : 'scheduled',
      totalFirebaseWrites: batch.contacts.length + 1, // +1 for batch doc
    });
    console.log('========== [batchService] saveBatchToFirebase END (SUCCESS) ==========\n');
    
    return batch.batchId;
  } catch (error) {
    console.error('❌ [Service] Error saving batch to Firebase:', error);
    console.error('📋 [Service] Error details:', {
      batchId: batch?.batchId,
      userId,
      action,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
    });
    console.log('========== [batchService] saveBatchToFirebase END (ERROR) ==========\n');
    throw error;
  }
}

/**
 * Gets all batches for the current user
 */
export async function getBatchesForUser(): Promise<Batch[]> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const q = query(collection(db, 'batches'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const batches: Batch[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        batchId: data.batchId,
        userId: data.userId,
        status: data.status,
        processingLock: data.processingLock ?? false, // Kept for backward compatibility
        lockOwner: data.lockOwner ?? null, // PHASE 4
        lockExpiresAt: data.lockExpiresAt || null, // PHASE 4
        priority: data.priority ?? 1, // PHASE 4
        lastDispatchedAt: data.lastDispatchedAt ?? Timestamp.fromMillis(0), // PHASE 0: Backward-safe default
        action: data.action,
        source: data.source,
        totalContacts: data.totalContacts,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || data.createdAt, // PHASE 4
        startedAt: data.startedAt || null,
        scheduleAt: data.scheduleAt || null,
        completedAt: data.completedAt || null,
        completedCount: data.completedCount || 0,
        failedCount: data.failedCount || 0,
        runningCount: data.runningCount || 0,
        batchTotalCost: data.batchTotalCost ?? 0,
        connectedCount: data.connectedCount ?? 0,
        interestedCount: data.interestedCount ?? 0,
        billingLedgerStatus: data.billingLedgerStatus ?? 'pending',
        billedAt: data.billedAt ?? null,
        contacts: [], // Contacts are in separate leads collection
        metadata: data.metadata || {},
      } as Batch;
    });

    // Sort by createdAt descending (newest first)
    return batches.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } catch (error) {
    console.error('Error getting batches:', error);
    throw error;
  }
}

/**
 * Subscribes to real-time batch updates for current user
 * Uses Firestore onSnapshot for live dashboard updates
 * 
 * @param callback - Function called with updated batches array
 * @param onError - Optional error handler
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToBatches(
  userId: string | null,
  callback: (batches: Batch[]) => void,
  onError?: (error: Error) => void
): () => void {

  if (!userId) {
    const error = new Error('User not authenticated');
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
    return () => {};
  }

  console.log('👀 Setting up real-time listener for batches, userId:', userId);

  const q = query(
    collection(db, 'batches'),
    where('userId', '==', userId)
  );

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log('🔄 Real-time batch update received:', snapshot.docs.length, 'batches');

      const batches: Batch[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          batchId: data.batchId,
          userId: data.userId,
          status: data.status,
          processingLock: data.processingLock ?? false, // Kept for backward compatibility
          lockOwner: data.lockOwner ?? null, // PHASE 4
          lockExpiresAt: data.lockExpiresAt || null, // PHASE 4
          priority: data.priority ?? 1, // PHASE 4
          lastDispatchedAt: data.lastDispatchedAt ?? Timestamp.fromMillis(0), // PHASE 0: Backward-safe default
          action: data.action,
          source: data.source,
          totalContacts: data.totalContacts,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt, // PHASE 4
          startedAt: data.startedAt || null,
          scheduleAt: data.scheduleAt || null,
          completedAt: data.completedAt || null,
          completedCount: data.completedCount || 0,
          failedCount: data.failedCount || 0,
          runningCount: data.runningCount || 0,
          batchTotalCost: data.batchTotalCost ?? 0,
          connectedCount: data.connectedCount ?? 0,
          interestedCount: data.interestedCount ?? 0,
          billingLedgerStatus: data.billingLedgerStatus ?? 'pending',
          billedAt: data.billedAt ?? null,
          contacts: [], // Contacts are in separate leads collection
          metadata: data.metadata || {},
        } as Batch;
      });

      // Sort by createdAt descending (newest first)
      const sortedBatches = batches.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      
      console.log('✅ Processed batches:', sortedBatches.map(b => ({
        id: b.batchId,
        status: b.status,
        total: b.totalContacts
      })));

      callback(sortedBatches);
    },
    (error) => {
      console.error('❌ Error in batch listener:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  );

  console.log('✅ Batch listener active');
  return unsubscribe;
}

/**
 * Gets a single batch with all its leads
 */
export async function getBatchDetail(batchId: string): Promise<Batch | null> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!batchId) {
    throw new Error('batchId is required');
  }

  try {
    // Step 1: Get batch document
    const batchRef = doc(db, 'batches', batchId);
    const batchSnap = await getDoc(batchRef);

    if (!batchSnap.exists()) {
      console.warn('⚠️ Batch not found:', batchId);
      return null;
    }

    const batchData = batchSnap.data();

    // Verify user ownership
    if (batchData.userId !== userId) {
      throw new Error('Unauthorized access to batch');
    }

    // Step 2: Get all leads for this batch (separately)
    console.log('🔍 Fetching leads for batch:', batchId);
    const leads = await getLeadsForBatch(batchId);

    // Convert leads to ExtractedContact format for compatibility
    const contacts: ExtractedContact[] = leads.map((lead) => ({
      phone: lead.phone,
    }));

    const batch: Batch = {
      batchId: batchData.batchId,
      userId: batchData.userId,
      status: batchData.status,
      processingLock: batchData.processingLock ?? false,
      lockOwner: batchData.lockOwner ?? null,
      lockExpiresAt: batchData.lockExpiresAt || null,
      priority: batchData.priority ?? 1,
      action: batchData.action,
      source: batchData.source,
      totalContacts: batchData.totalContacts,
      createdAt: batchData.createdAt,
      updatedAt: batchData.updatedAt || batchData.createdAt,
      scheduleAt: batchData.scheduleAt || null,
      startedAt: batchData.startedAt || null,
      completedAt: batchData.completedAt || null,
      completedCount: batchData.completedCount || 0,
      failedCount: batchData.failedCount || 0,
      runningCount: batchData.runningCount || 0,
      batchTotalCost: batchData.batchTotalCost ?? 0,
      connectedCount: batchData.connectedCount ?? 0,
      interestedCount: batchData.interestedCount ?? 0,
      billingLedgerStatus: batchData.billingLedgerStatus ?? 'pending',
      billedAt: batchData.billedAt ?? null,
      contacts,
    } as Batch;

    return batch;
  } catch (error) {
    console.error('Error getting batch detail:', error);
    throw error;
  }
}


/**
 * Updates batch status (called when batch transitions between states)
 */
export async function updateBatchStatus(
  batchId: string,
  status: 'running' | 'completed' | 'failed'
): Promise<void> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const batchRef = doc(db, 'batches', batchId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = Timestamp.now();
    }

    await setDoc(batchRef, updateData, { merge: true });

    if (status === 'completed') {
      await syncLeadStatusesWithBatch(batchId);
      await finalizeCompletedBatchBilling(batchId);
    }
  } catch (error) {
    console.error('Error updating batch status:', error);
    throw error;
  }
}
