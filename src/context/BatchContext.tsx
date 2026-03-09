import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { getBatchDetail as fetchBatchDetail, saveBatchToFirebase, subscribeToBatches } from '../services/batchService';
import { subscribeToLeadsForUser } from '../services/leadService';
import {
    Batch,
    BatchContextType,
    BatchDraft,
    BatchSource,
    ExtractedContact,
} from '../types/batch';

export const BatchContext = createContext<BatchContextType | undefined>(undefined);

export const BatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentBatch, setCurrentBatch] = useState<Batch | BatchDraft | null>(null);
  const [allBatches, setAllBatches] = useState<(Batch | BatchDraft)[]>([]);
  const [firebaseBatches, setFirebaseBatches] = useState<Batch[]>([]);
  const [localDrafts, setLocalDrafts] = useState<BatchDraft[]>([]);
  const [leadStatsByBatch, setLeadStatsByBatch] = useState<Record<string, { pending: number; running: number; completed: number; failed: number; retries: number }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);


  // Real-time listener for Firebase batches
  useEffect(() => {
    if (!userId) {
      setFirebaseBatches([]);
      setAllBatches([]);
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToBatches(
      userId,
      (batches) => {
        setFirebaseBatches(batches);
        setLoading(false);
      },
      (error) => {
        console.error('❌ BatchContext: Listener error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Real-time listener for all user leads
  useEffect(() => {
    if (!userId) {
      setLeadStatsByBatch({});
      return;
    }

    const unsubscribe = subscribeToLeadsForUser(
      userId,
      (leads) => {
        const nextStats: Record<string, { pending: number; running: number; completed: number; failed: number; retries: number }> = {};

        leads.forEach((lead) => {
          if (!lead.batchId) return;
          if (!nextStats[lead.batchId]) {
            nextStats[lead.batchId] = { pending: 0, running: 0, completed: 0, failed: 0, retries: 0 };
          }

          const stats = nextStats[lead.batchId];
          const status = String(lead.status || '').toLowerCase();
          const callStatus = String(lead.callStatus || '').toLowerCase();

          if (status === 'queued') stats.pending += 1;
          if (status === 'calling' || callStatus === 'in_progress') stats.running += 1;
          if (status === 'completed') stats.completed += 1;
          if (status === 'failed' || status === 'failed_retryable' || status === 'failed_permanent' || ['failed', 'busy', 'unreachable'].includes(callStatus)) {
            stats.failed += 1;
          }

          if (lead.retryCount) stats.retries += lead.retryCount;
        });

        setLeadStatsByBatch(nextStats);
      },
      (leadError) => {
        console.error('❌ BatchContext: Lead listener error:', leadError);
      }
    );

    return () => unsubscribe();
  }, [userId]);


  // Merge Firebase batches with local drafts whenever either changes
  useEffect(() => {
    const deriveUiBatchStatus = (batch: Batch): Batch => {
      const stats = leadStatsByBatch[batch.batchId];

      if (!stats) {
        return batch;
      }

      const totalFromStats = stats.pending + stats.running + stats.completed + stats.failed;
      const totalLeads = batch.totalContacts || totalFromStats;
      const terminalCount = stats.completed + stats.failed;
      const hasLeadData = totalFromStats > 0;
      const isTerminalByLeads =
        hasLeadData &&
        totalLeads > 0 &&
        stats.pending === 0 &&
        stats.running === 0 &&
        terminalCount >= totalLeads;

      if (batch.status === 'running' && isTerminalByLeads) {
        return {
          ...batch,
          status: 'completed',
          runningCount: 0,
          completedCount: stats.completed,
          failedCount: stats.failed,
          completedAt: batch.completedAt || batch.updatedAt || Timestamp.now(),
        };
      }

      return {
        ...batch,
        runningCount: stats.running,
        completedCount: stats.completed,
        failedCount: stats.failed,
      };
    };

    const derivedFirebaseBatches = firebaseBatches.map(deriveUiBatchStatus);
    const firebaseBatchIds = new Set(firebaseBatches.map(b => b.batchId));
    const uniqueLocalDrafts = localDrafts.filter(b => !firebaseBatchIds.has(b.batchId));
    
    const combined = [...uniqueLocalDrafts, ...derivedFirebaseBatches];

    setAllBatches(combined);
  }, [firebaseBatches, leadStatsByBatch, localDrafts]);

  const createLocalBatch = useCallback((
    contacts: ExtractedContact[],
    source: BatchSource,
    metadata?: any
  ): BatchDraft => {
    const batchId = uuidv4();
    const now = Timestamp.now();

    const draftBatch: BatchDraft = {
      batchId,
      createdAt: now,
      contacts,
      status: 'draft',
      source,
      action: null,
      totalContacts: contacts.length,
      metadata,
    };

    console.log('📝 Creating local draft batch:', batchId);
    setCurrentBatch(draftBatch);
    
    // Add to local drafts (will auto-merge with Firebase batches)
    setLocalDrafts((prev) => [draftBatch, ...prev]);
    
    return draftBatch;
  }, []);

  const deleteDraftBatch = useCallback((batchId: string) => {
    console.log('🗑️ Deleting draft batch:', batchId);
    
    // Only delete from local state - NO Firebase write
    if (currentBatch?.batchId === batchId) {
      setCurrentBatch(null);
    }
    setLocalDrafts((prev) => prev.filter((b) => b.batchId !== batchId));
  }, [currentBatch]);

  const saveBatchToFirebaseHandler = useCallback(
    async (batch: BatchDraft | Batch, action: 'call_now' | 'schedule', scheduleAt?: Timestamp) => {
      console.log('🔥 [Context] saveBatchToFirebaseHandler ENTERED - START');
      const startTime = Date.now();
      
      try {
        setLoading(true);
        setError(null);

        // ===== DETAILED DEBUG LOGS - LAYER 2: CONTEXT =====
        console.log('\n========== [BatchContext] saveBatchToFirebaseHandler START ==========');
        console.log('🔥 [Context] Function called');
        console.log('📥 [Context] Incoming parameters:', {
          batchId: batch?.batchId,
          batchStatus: batch?.status,
          batchSource: batch?.source,
          action,
          scheduleAt: scheduleAt?.toDate?.() || 'undefined',
          timestamp: new Date().toISOString(),
        });
        console.log('📦 [Context] Batch object structure:', {
          batchId: batch?.batchId,
          status: batch?.status,
          source: batch?.source,
          totalContacts: batch?.totalContacts,
          contactsArrayType: Array.isArray(batch?.contacts) ? 'array' : typeof batch?.contacts,
          contactsExpectedLength: batch?.contacts?.length || 0,
          hasCreatedAt: !!batch?.createdAt,
          firstContactSample: batch?.contacts?.[0],
        });
        console.log('📋 [Context] Sample of first 3 contacts:', batch?.contacts?.slice(0, 3).map((c, i) => ({ index: i, phone: c.phone, name: c.name, hasPhone: !!c.phone })));

        // ===== STRICT RUNTIME VALIDATION =====
        // Validation 1: Batch object exists
        if (!batch) {
          const errorCode = 'VALIDATION_BATCH_MISSING';
          const detailedMsg = `Batch object is null or undefined. Cannot proceed with save operation.`;
          
          console.error(`❌ [${errorCode}]:`, detailedMsg);
          Alert.alert('⚠️ Validation Error', detailedMsg);
          setError(detailedMsg);
          setLoading(false);
          
          return {
            success: false,
            errorMessage: detailedMsg,
            errorCode,
            errorDetails: { batch: null },
          };
        }

        // Validation 2: Batch ID exists
        if (!batch.batchId || typeof batch.batchId !== 'string' || batch.batchId.trim().length === 0) {
          const errorCode = 'VALIDATION_BATCH_ID_INVALID';
          const detailedMsg = `Batch ID is missing or invalid: "${batch.batchId}". Please create a new batch.`;
          
          console.error(`❌ [${errorCode}]:`, detailedMsg);
          Alert.alert('⚠️ Validation Error', detailedMsg);
          setError(detailedMsg);
          setLoading(false);
          
          return {
            success: false,
            errorMessage: detailedMsg,
            errorCode,
            errorDetails: { batchId: batch.batchId },
          };
        }

        // Validation 3: Contacts array exists
        if (!batch.contacts) {
          const errorCode = 'VALIDATION_CONTACTS_MISSING';
          const detailedMsg = `No contacts array found in batch "${batch.batchId}". Please add contacts before saving.`;
          
          console.error(`❌ [${errorCode}]:`, detailedMsg);
          Alert.alert('⚠️ Validation Error', detailedMsg);
          setError(detailedMsg);
          setLoading(false);
          
          return {
            success: false,
            errorMessage: detailedMsg,
            errorCode,
            errorDetails: { batchId: batch.batchId, hasContacts: false },
          };
        }

        // Validation 4: Contacts array is not empty
        if (!Array.isArray(batch.contacts) || batch.contacts.length === 0) {
          const errorCode = 'VALIDATION_CONTACTS_EMPTY';
          const detailedMsg = `Batch "${batch.batchId}" has no contacts (${batch.contacts?.length || 0} found). Please add at least one contact before saving.`;
          
          console.error(`❌ [${errorCode}]:`, detailedMsg);
          Alert.alert('⚠️ Validation Error', detailedMsg);
          setError(detailedMsg);
          setLoading(false);
          
          return {
            success: false,
            errorMessage: detailedMsg,
            errorCode,
            errorDetails: { 
              batchId: batch.batchId, 
              contactsLength: batch.contacts?.length || 0,
              isArray: Array.isArray(batch.contacts),
            },
          };
        }

        // Validation 5: Each contact has a valid phone field
        const invalidContacts = batch.contacts.filter((contact) => {
          return !contact.phone || typeof contact.phone !== 'string' || contact.phone.trim().length === 0;
        });

        if (invalidContacts.length > 0) {
          const errorCode = 'VALIDATION_INVALID_PHONES';
          const detailedMsg = `${invalidContacts.length} out of ${batch.contacts.length} contacts have missing or invalid phone numbers. Please fix these before saving:\n\n${invalidContacts.slice(0, 3).map((c, i) => `${i + 1}. ${c.name || 'Unknown'} - "${c.phone || 'EMPTY'}"`).join('\n')}${invalidContacts.length > 3 ? `\n... and ${invalidContacts.length - 3} more` : ''}`;

          console.error(`❌ [${errorCode}]:`, detailedMsg, {
            batchId: batch.batchId,
            totalContacts: batch.contacts.length,
            invalidCount: invalidContacts.length,
            invalidContactsSample: invalidContacts.slice(0, 3),
          });
          Alert.alert('⚠️ Invalid Phone Numbers', detailedMsg);
          setError(detailedMsg);
          setLoading(false);
          
          return {
            success: false,
            errorMessage: detailedMsg,
            errorCode,
            errorDetails: {
              batchId: batch.batchId,
              totalContacts: batch.contacts.length,
              invalidCount: invalidContacts.length,
              invalidPhones: invalidContacts.slice(0, 5),
            },
          };
        }

        console.log('✅ [Context] All 5 validations PASSED');
        console.log('📦 [Context] Batch validated successfully:', {
          batchId: batch.batchId,
          contactsCount: batch.contacts.length,
          action,
          willCreate: action === 'call_now' ? 'running batch' : 'scheduled batch',
        });

        // If we reach here, all validations passed - prepare batch for service layer
        const batchToSave: BatchDraft = {
          ...batch,
          contacts: batch.contacts,
        } as BatchDraft;

        console.log('📤 [Context] Calling Firebase service layer to write documents...');
        console.log('🔄 [Context] DEBUG: About to await saveBatchToFirebase');
        console.log('🔍 [Context] saveBatchToFirebase function exists:', typeof saveBatchToFirebase);

        // Save to Firebase
        const batchIdResult = await saveBatchToFirebase(batchToSave, action, scheduleAt);
        
        console.log('✅ [Context] Firebase service call completed successfully');
        console.log('📊 [Context] Service returned batchId:', {
          batchId: batchIdResult,
          isString: typeof batchIdResult === 'string',
          elapsedMs: Date.now() - startTime,
        });

        // ===== DETAILED DEBUG LOGS - AFTER FIREBASE SAVE =====
        console.log('\n✅ [Context] Firebase save SUCCESSFUL');
        console.log('📊 [Context] Firebase operation results:', {
          batchId: batch.batchId,
          contactsCreated: batch.contacts.length,
          action,
          newStatus: action === 'call_now' ? 'running' : 'scheduled',
          timestamp: new Date().toISOString(),
          elapsedMs: Date.now() - startTime,
        });

        // Update local state to reflect saved status
        const updatedBatch: Batch = {
          ...batchToSave,
          status: action === 'call_now' ? 'running' : 'scheduled',
          action,
          scheduleAt: action === 'schedule' ? (scheduleAt || Timestamp.now()) : undefined,
          processingLock: false,
          lockOwner: null,
          lockExpiresAt: null,
          priority: 1,
          updatedAt: Timestamp.now(),
        } as Batch;

        console.log('🔄 [Context] Updating local state:', {
          currentBatchId: currentBatch?.batchId,
          updatedBatchId: updatedBatch.batchId,
          newStatus: updatedBatch.status,
        });

        // Update currentBatch if it's the same
        if (currentBatch?.batchId === batch.batchId) {
          setCurrentBatch(updatedBatch);
        }

        // Remove draft from localDrafts (real-time listener will add from Firebase)
        console.log('🗑️ [Context] Removing draft batch from local state');
        setLocalDrafts((prev) => prev.filter(b => b.batchId !== batch.batchId));
        
        // Note: No need to update allBatches - real-time listener will handle it

        console.log('========== [BatchContext] saveBatchToFirebaseHandler END (SUCCESS) ==========\n');
        setLoading(false);
        
        // Return explicit success
        return {
          success: true,
          errorMessage: undefined,
        };
      } catch (err) {
        const errorCode = 'FIREBASE_OPERATION_FAILED';
        const errorMessage = err instanceof Error ? err.message : String(err);
        const detailedMsg = `Failed to save batch to Firebase.\n\nError: ${errorMessage}\n\nPlease check your internet connection and try again.`;
        
        console.error(`\n❌ [${errorCode}] Error saving batch:`, {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          elapsedMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        
        setError(detailedMsg);
        Alert.alert(
          '❌ Firebase Error',
          detailedMsg,
          [
            {
              text: 'OK',
              onPress: () => console.log('Error acknowledged by user'),
            },
          ]
        );
        
        console.log('========== [BatchContext] saveBatchToFirebaseHandler END (ERROR) ==========\n');
        setLoading(false);
        
        // Return explicit failure without throwing
        return {
          success: false,
          errorMessage: detailedMsg,
          errorCode,
          errorDetails: {
            originalError: errorMessage,
            timestamp: new Date().toISOString(),
            elapsedMs: Date.now() - startTime,
          },
        };
      }
    },
    [currentBatch]
  );

  const getAllBatches = useCallback(async (): Promise<void> => {
    // Kept for backward compatibility; batches are driven by real-time listeners.
    if (!userId) {
      setError('User not authenticated');
      return;
    }
  }, [userId]);

  const getBatchDetail = useCallback(
    async (batchId: string) => {
      try {
        setLoading(true);
        setError(null);
        const batch = await fetchBatchDetail(batchId);
        if (batch) {
          setCurrentBatch(batch);
        }
        setLoading(false);
        return batch;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch batch');
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const updateBatchStatus = useCallback(
    async (batchId: string, status: any) => {
      try {
        setLoading(true);
        setError(null);
        // This will be implemented when batch starts running
        // For now, it's a placeholder
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update batch');
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: BatchContextType = {
    currentBatch,
    allBatches,
    leadStatsByBatch,
    loading,
    error,
    createLocalBatch,
    deleteDraftBatch,
    saveBatchToFirebase: saveBatchToFirebaseHandler,
    getAllBatches,
    getBatchDetail,
    updateBatchStatus,
    clearError,
  };

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
};

export const useBatch = (): BatchContextType => {
  const context = React.useContext(BatchContext);
  if (!context) {
    throw new Error('useBatch must be used within BatchProvider');
  }
  return context;
};
