import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PricingInfoCard } from '../../components/pricing/PricingInfoCard';
import { PricingModal } from '../../components/pricing/PricingModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { FeatureComingSoonModal } from '../../components/ui/FeatureComingSoonModal';
import { ScheduleConfirmationModal } from '../../components/ui/ScheduleConfirmationModal';
import { canAccessScheduledCalling, isScheduleEnabled } from '../../config/featureFlags';
import { useBatch } from '../../context/BatchContext';
import { useWallet } from '../../context/WalletContext';
import { usePricing } from '../../hooks/usePricing';
import { db } from '../../lib/firebase';
import { subscribeToBatchLeads } from '../../services/leadService';
import { Batch, BatchDraft, Lead } from '../../types/batch';

// Color constants
const colors = {
  primary: '#0a7ea4',
  dark: '#11181C',
  gray: '#687076',
};

// Responsive sizing helpers
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const maxScaleWidth = Math.min(width, 420);
const maxScaleHeight = Math.min(height, 800);

const scale = (size: number) => (maxScaleWidth / 375) * size;
const verticalScale = (size: number) => (maxScaleHeight / 667) * size;

const MAX_CONTENT_WIDTH = 800;
const SECTION_GAP = verticalScale(10);

/**
 * PHASE 3 & 5 - BATCH DETAIL SCREEN
 * Shows all contacts in batch and available actions
 * Actions: Call Now, Schedule, Delete Batch
 */

export const BatchDetailScreen: React.FC = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { currentBatch, allBatches, getBatchDetail, saveBatchToFirebase, deleteDraftBatch } =
    useBatch();
  const { pricing } = usePricing();
  const { checkBalance, getDeductionPreview, availableBalance, costPerCall } = useWallet();
  const [batch, setBatch] = useState<(Batch | BatchDraft) | null>(null);
  
  // LIVE DATA STATES
  const [liveLeads, setLiveLeads] = useState<Lead[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Custom Modal States (replacing Alert.alert)
  const [showCallNowModal, setShowCallNowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showScheduleComingSoonModal, setShowScheduleComingSoonModal] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [leadFilter, setLeadFilter] = useState<'pending' | 'completed' | 'failed' | 'retrying'>('pending');

  const MAX_RETRY_COUNT = 3;

  useEffect(() => {
    if (!batchId) return;

    console.log('🔍 Looking for batch:', batchId);
    console.log('📦 Current batch:', currentBatch?.batchId);
    console.log('📚 All batches:', allBatches.length);

    // First check if it's the current batch
    if (currentBatch?.batchId === batchId) {
      console.log('✅ Found in currentBatch');
      setBatch(currentBatch);
      return;
    }

    // Then check allBatches (for draft batches)
    const foundBatch = allBatches.find(b => b.batchId === batchId);
    if (foundBatch) {
      console.log('✅ Found in allBatches');
      setBatch(foundBatch);
      return;
    }

    // Finally, try to fetch from Firebase (for saved batches)
    console.log('🔥 Fetching from Firebase...');
    getBatchDetail(batchId)
      .then((b) => {
        console.log('✅ Fetched from Firebase:', b?.batchId);
        setBatch(b);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch batch:', err);
        Alert.alert('Error', err.message);
      });
  }, [batchId, currentBatch, allBatches, getBatchDetail]);

  // REAL-TIME LISTENER FOR BATCH LEADS
  useEffect(() => {
    if (!batch || batch.status === 'draft') {
      setStatsLoading(false);
      return;
    }

    console.log('🔌 Setting up real-time listener for batch:', batch.batchId);
    setStatsLoading(true);

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToBatchLeads(batch.batchId, (leads) => {
        console.log('📊 Received live leads update:', leads.length);
        setLiveLeads(leads);
        setStatsLoading(false);
      });
    } catch (error) {
      console.error('❌ Error setting up leads listener:', error);
      setStatsLoading(false);
    }

    // Cleanup: unsubscribe when component unmounts or batch changes
    return () => {
      if (unsubscribe) {
        console.log('🔌 Unsubscribing from batch leads');
        unsubscribe();
      }
    };
  }, [batch?.batchId, batch?.status, batch]);

  // CALCULATE LIVE STATS FROM LEADS
  const calculateStats = useCallback(() => {
    if (!liveLeads || liveLeads.length === 0) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        totalRetries: 0,
        avgRetries: 0,
        nextRetryTimes: [] as (Timestamp | null)[],
      };
    }

    const total = liveLeads.length;
    const completed = liveLeads.filter((l) => l.status === 'completed').length;
    const pending = liveLeads.filter((l) => l.status === 'queued').length;
    const inProgress = liveLeads.filter((l) => l.status === 'calling' || l.callStatus === 'in_progress').length;
    const totalRetries = liveLeads.reduce((sum, l) => sum + (l.retryCount || 0), 0);
    const avgRetries = Math.round(totalRetries / total);
    const nextRetryTimes = liveLeads
      .filter((l) => l.nextRetryAt)
      .map((l) => l.nextRetryAt);

    return {
      total,
      completed,
      pending,
      inProgress,
      totalRetries,
      avgRetries,
      nextRetryTimes,
    };
  }, [liveLeads]);

  const stats = useMemo(() => calculateStats(), [calculateStats]);

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLeadDisplayStatus = (lead: Lead) => {
    if (lead.callStatus === 'failed' || lead.callStatus === 'busy' || lead.callStatus === 'unreachable') {
      return { label: 'Failed', color: '#ef4444', emoji: '🔴' };
    }

    if (lead.status === 'completed') {
      return { label: 'Completed', color: '#22c55e', emoji: '🟢' };
    }

    if (lead.callStatus === 'in_progress' || lead.status === 'calling') {
      return { label: 'In Progress', color: '#3b82f6', emoji: '🔵' };
    }

    return { label: 'Pending', color: '#f59e0b', emoji: '🟡' };
  };

  const filteredLeads = useMemo(() => {
    if (batch?.status === 'draft') return liveLeads;

    return liveLeads.filter((lead) => {
      if (leadFilter === 'retrying') {
        return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;
      }

      const status = getLeadDisplayStatus(lead).label;
      if (leadFilter === 'pending') return status === 'Pending';
      if (leadFilter === 'completed') return status === 'Completed';
      if (leadFilter === 'failed') return status === 'Failed';
      return true;
    });
  }, [batch?.status, leadFilter, liveLeads]);

  if (!batch) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const handleCallNow = async () => {
    console.log('--- TRIGGERED: handleCallNow ---');
    console.log('🎯 Showing Call Now confirmation modal');
    setShowCallNowModal(true);
  };

  // ACTUAL Firebase save logic for Call Now
  const handleCallNowConfirm = async () => {
    try {
      console.log('✅ User confirmed Call Now');
      setSaving(true);
      
      // WALLET BALANCE CHECK
      const totalContacts = batch?.totalContacts || batch?.contacts?.length || 0;
      const requiredAmount = getDeductionPreview(totalContacts);
      
      console.log('💰 Checking wallet balance...');
      console.log(`  - Total contacts: ${totalContacts}`);
      console.log(`  - Required: ₹${requiredAmount} (${totalContacts} × ₹${costPerCall})`);
      console.log(`  - Available: ₹${availableBalance}`);
      
      const balanceCheck = await checkBalance(totalContacts);
      
      if (!balanceCheck.success) {
        console.error('❌ Insufficient balance');
        setSaving(false);
        setShowCallNowModal(false);
        const available = balanceCheck.availableBalance ?? availableBalance;
        const required = balanceCheck.requiredAmount ?? requiredAmount;
        const shortfall = Math.max(0, required - available);
        
        Alert.alert(
          '⚠️ Recharge Required',
          `You need ₹${shortfall.toLocaleString()} more to start this batch`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Recharge Now', 
              onPress: () => router.push('/wallet'),
              style: 'default',
            },
          ]
        );
        return;
      }
      
      console.log('✅ Balance check passed');
      
      // ===== 
      // ===== DETAILED DEBUG LOGS - LAYER 1: UI =====
      console.log('📱 [BatchDetailScreen] Call Now Handler');
      console.log('📦 [UI] Incoming batch object:', {
        batchId: batch?.batchId,
        status: batch?.status,
        source: batch?.source,
        totalContacts: batch?.totalContacts,
        contactsArrayLength: batch?.contacts?.length,
        createdAt: batch?.createdAt,
      });
      console.log('📋 [UI] First 3 contacts sample:', batch?.contacts?.slice(0, 3).map(c => ({ phone: c.phone, name: c.name })));
      console.log('🎯 [UI] Action:', 'call_now');
      console.log('🔄 [UI] About to call saveBatchToFirebase...');
      console.log('🔍 [UI] saveBatchToFirebase function exists:', typeof saveBatchToFirebase);
      
      console.log('🚀 [UI] Calling saveBatchToFirebase NOW...');
      let result;
      try {
        result = await saveBatchToFirebase(batch, 'call_now');
        console.log('✅ [UI] Promise resolved');
      } catch (promiseError) {
        console.error('❌ [UI] Promise rejected with error:', promiseError);
        throw promiseError;
      }
      
      console.log('✅ [UI] Got result back from saveBatchToFirebase');
      console.log('📊 [UI] Result from Firebase save:', {
        success: result?.success,
        errorCode: result?.errorCode,
        errorMessage: result?.errorMessage,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : 'no result object',
      });
      
      if (result?.success) {
        console.log('✅ [UI] Save successful - closing modal');
        setShowCallNowModal(false);
        Alert.alert('Success', 'Batch sent to calling system!');
        setTimeout(() => router.push('/batch-dashboard'), 1500);
      } else {
        console.error('❌ [UI] Save failed', {
          errorCode: result?.errorCode,
          errorMessage: result?.errorMessage,
        });
        if (result?.errorMessage) {
          Alert.alert('❌ Save Failed', result.errorMessage);
        }
      }
    } catch (err) {
      console.error('❌ [UI] Unexpected error in handleCallNowConfirm:', err);
      console.error('📋 Error details:', {
        errorType: err instanceof Error ? 'Error' : typeof err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'no stack',
      });
      Alert.alert('Unexpected Error', err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    console.log('--- TRIGGERED: handleSchedule ---');
    const scheduleAccess = canAccessScheduledCalling();

    if (!isScheduleEnabled || !scheduleAccess) {
      console.log('🔒 Schedule feature locked - showing coming soon modal');
      setShowScheduleComingSoonModal(true);
      return;
    }

    console.log('🎯 Opening schedule modal');
    setShowScheduleModal(true);
  };

  // ACTUAL Firebase save logic for Schedule
  const handleScheduleConfirm = async (scheduleDateTime: Date, timeInfo: { hours: number; minutes: number }) => {
    try {
      console.log('✅ User confirmed schedule');
      setSaving(true);

      const totalContacts = batch?.totalContacts || batch?.contacts?.length || 0;
      const requiredAmount = getDeductionPreview(totalContacts);
      const balanceCheck = await checkBalance(totalContacts);

      if (!balanceCheck.success) {
        setSaving(false);
        setShowScheduleModal(false);
        const available = balanceCheck.availableBalance ?? availableBalance;
        const required = balanceCheck.requiredAmount ?? requiredAmount;
        const shortfall = Math.max(0, required - available);
        Alert.alert(
          '⚠️ Recharge Required',
          `You need ₹${shortfall.toLocaleString()} more to start this batch`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Recharge Now',
              onPress: () => router.push('/wallet'),
              style: 'default',
            },
          ]
        );
        return;
      }
      
      // ===== DETAILED DEBUG LOGS - LAYER 1: UI =====
      console.log('📱 [BatchDetailScreen] Schedule Handler');
      console.log('📦 [UI] Incoming batch object:', {
        batchId: batch?.batchId,
        status: batch?.status,
        source: batch?.source,
        totalContacts: batch?.totalContacts,
        contactsArrayLength: batch?.contacts?.length,
        createdAt: batch?.createdAt,
      });
      console.log('📋 [UI] First 3 contacts sample:', batch?.contacts?.slice(0, 3).map(c => ({ phone: c.phone, name: c.name })));
      console.log('🎯 [UI] Action:', 'schedule');
      console.log(`💰 [UI] Required: ₹${requiredAmount} for ${totalContacts} contacts`);
      console.log('📅 [UI] Schedule date/time:', scheduleDateTime.toISOString());
      console.log('⏰ [UI] Timestamp object:', Timestamp.fromDate(scheduleDateTime));
      console.log('🔄 [UI] About to call saveBatchToFirebase...');
      
      const result = await saveBatchToFirebase(
        batch,
        'schedule',
        Timestamp.fromDate(scheduleDateTime)
      );
      
      console.log('📊 [UI] Result from Firebase save:', {
        success: result.success,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });
      
      if (result.success) {
        console.log('✅ [UI] Schedule successful - closing modal');
        setShowScheduleModal(false);
        Alert.alert('Success', 'Batch scheduled successfully!');
        setTimeout(() => router.push('/batch-dashboard'), 1500);
      } else {
        console.error('❌ [UI] Schedule failed', {
          errorCode: result.errorCode,
          errorMessage: result.errorMessage,
        });
        if (result.errorMessage) {
          Alert.alert('❌ Schedule Failed', result.errorMessage);
        }
      }
    } catch (err) {
      console.error('❌ [UI] Unexpected error in handleScheduleConfirm:', err);
      Alert.alert('Unexpected Error', err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBatch = () => {
    console.log('--- TRIGGERED: handleDeleteBatch ---');
    console.log('🎯 Showing delete confirmation modal');
    setShowDeleteModal(true);
  };

  // ACTUAL delete logic
  const handleDeleteConfirm = () => {
    if (!batch?.batchId) {
      return;
    }

    const deletingBatchId = batch.batchId;

    // UX: Navigate back immediately with no perceived delay
    setShowDeleteModal(false);
    router.back();

    // Perform local state cleanup without blocking navigation
    requestAnimationFrame(() => {
      try {
        console.log('✅ User confirmed delete');
        console.log('🗑️ Calling deleteDraftBatch with:', deletingBatchId);
        deleteDraftBatch(deletingBatchId);
        console.log('✅ Delete successful!');
      } catch (err) {
        console.error('❌ Error deleting:', err);
      }
    });
  };

  // ===== OPTIONAL: DIAGNOSTIC FUNCTION FOR TESTING =====
  // If needed to test Firebase writes, uncomment the button in the UI
  // This function is intentionally not called by any button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTestFirebaseWrite = async () => {
    console.log('\n========== [DIAGNOSTIC] Test Firebase Write ==========');
    
    try {
      setSaving(true);
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert('Error', 'Not authenticated - please login first');
        return;
      }

      const testBatchId = `test-batch-${Date.now()}`;
      const testLeadId = `test-lead-${Date.now()}`;

      console.log('🧪 TEST: Creating minimal batch document');
      console.log('📝 Batch ID:', testBatchId);
      console.log('👤 User ID:', userId);

      // Step 1: Create test batch document
      const testBatchData = {
        batchId: testBatchId,
        userId: userId,
        status: 'running',
        action: 'call_now',
        source: 'manual',
        totalContacts: 1,
        createdAt: Timestamp.now(),
      };

      console.log('📋 Batch Data to write:', {
        batchId: testBatchData.batchId,
        userId: testBatchData.userId,
        status: testBatchData.status,
        action: testBatchData.action,
        source: testBatchData.source,
        totalContacts: testBatchData.totalContacts,
        createdAt: testBatchData.createdAt?.toDate?.() || 'invalid',
      });

      const batchDocRef = doc(collection(db, 'batches'), testBatchId);
      await setDoc(batchDocRef, testBatchData);
      console.log('✅ Batch write SUCCESS');

      // Step 2: Create test lead document
      console.log('\n🧪 TEST: Creating minimal lead document');
      console.log('📝 Lead ID:', testLeadId);
      console.log('🔗 References batch:', testBatchId);

      const testLeadData = {
        leadId: testLeadId,
        batchId: testBatchId,
        userId: userId,
        phone: '+1-555-TEST-0001',
        name: 'Firebase Test Lead',
        status: 'queued',
        createdAt: Timestamp.now(),
      };

      const leadDocRef = doc(collection(db, 'leads'), testLeadId);
      await setDoc(leadDocRef, testLeadData);
      console.log('✅ Lead write SUCCESS');

      console.log('\n========== TEST COMPLETE ==========');
      console.log('✅ Firebase connection is WORKING');
      console.log('📊 Test Results:');
      console.log('   - Batch Document: Created in /batches/' + testBatchId);
      console.log('   - Lead Document: Created in /leads/' + testLeadId);
      console.log('   - User ID: ' + userId);

      Alert.alert(
        '✅ Firebase Test Passed',
        `Connection verified!\n\nBatch ID: ${testBatchId.substring(0, 20)}...\nLead ID: ${testLeadId.substring(0, 20)}...\n\nDocuments created in Firebase.`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Test result acknowledged by user');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Firebase write FAILED:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Detailed diagnostic logging
      console.error('\n📋 [DIAGNOSTIC] Firebase Error Details:', {
        errorMessage: errorMsg,
        errorCode: error instanceof Error && 'code' in error ? (error as any).code : 'unknown',
        errorDetails: error,
        timestamp: new Date().toISOString(),
        testData: {
          batchId: 'test-batch-[timestamp]',
          source: 'manual (valid)',
          status: 'running (valid)',
          action: 'call_now (valid)',
          totalContacts: '1 (valid)',
        },
      });
      
      const detailedMsg = errorMsg.includes('Missing or insufficient permissions')
        ? `Permission Denied!\n\nThe Firestore security rules are rejecting this write.\n\nVerify:\n✓ You are logged in\n✓ Firestore rules deployed correctly\n✓ Using valid source: 'manual'\n\nError: ${errorMsg}`
        : `Firebase Error:\n\n${errorMsg}\n\nCheck your internet connection and Firebase configuration.`;
      
      Alert.alert(
        '❌ Firebase Test Failed',
        detailedMsg,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Error acknowledged by user');
            },
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={scale(18)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Batch Details</Text>
            <Text style={styles.headerSubtitle}>
              {batch.status.toUpperCase()} • {batch.source.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Batch Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Batch ID</Text>
            <Text style={styles.infoValue}>{batch.batchId.substring(0, 12)}</Text>
          </View>
          <View style={[styles.infoRow, styles.borderTop]}>
            <Text style={styles.infoLabel}>Total Contacts</Text>
            <Text style={styles.infoValue}>{batch.totalContacts}</Text>
          </View>
          <View style={[styles.infoRow, styles.borderTop]}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(batch.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          </View>
          {batch.status === 'scheduled' && batch.scheduleAt && (
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Scheduled</Text>
              <Text style={styles.infoValue}>
                {new Date(batch.scheduleAt.seconds * 1000).toLocaleDateString()}
              </Text>
            </View>
          )}
          </View>
        </View>

      {/* Action Buttons - Only for Draft Status */}
        {batch.status === 'draft' && (
          <View style={styles.actionSection}>
          <View style={styles.pricingSection}>
            <PricingInfoCard compact onPressDetails={() => setShowPricingModal(true)} />
          </View>
          {/* Call Now Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCallNow}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size={scale(18)} />
            ) : (
              <>
                <Ionicons name="call" size={scale(18)} color="#fff" />
                <Text style={styles.actionButtonText}>Call Now</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Schedule Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.scheduleButton,
              !isScheduleEnabled && styles.scheduleLockedButton,
            ]}
            onPress={handleSchedule}
            disabled={saving}
          >
            {!isScheduleEnabled && (
              <View style={styles.scheduleLockBadge}>
                <Ionicons name="lock-closed" size={scale(10)} color="rgba(255,255,255,0.9)" />
              </View>
            )}
            <Ionicons name="calendar" size={scale(18)} color="#fff" />
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteBatch}
            disabled={saving}
          >
            <Ionicons name="trash" size={scale(18)} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
          </View>
        )}

      {/* Status Info for Non-Draft */}
        {batch.status !== 'draft' && (
          <View style={styles.statusSection}>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  batch.status === 'running'
                    ? '#e8f5e9'
                    : batch.status === 'scheduled'
                      ? '#e3f2fd'
                      : '#f3e5f5',
              },
            ]}
          >
            <Ionicons
              name={
                batch.status === 'running'
                  ? 'call'
                  : batch.status === 'scheduled'
                    ? 'calendar'
                    : 'checkmark-circle'
              }
              size={scale(20)}
              color={
                batch.status === 'running'
                  ? '#4caf50'
                  : batch.status === 'scheduled'
                    ? '#2196f3'
                    : '#9c27b0'
              }
            />
            <Text style={styles.statusText}>
              {batch.status === 'running'
                ? 'Calling in progress'
                : batch.status === 'scheduled'
                  ? 'Scheduled for calling'
                  : 'Batch completed'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.billingLinkButton}
            onPress={() => router.push({ pathname: '/batch-billing-detail', params: { batchId: batch.batchId } })}
          >
            <Ionicons name="receipt-outline" size={scale(16)} color={colors.primary} />
            <Text style={styles.billingLinkText}>View Billing Detail</Text>
          </TouchableOpacity>
          </View>
        )}

      {/* LIVE STATS - Real-time update section for non-draft batches */}
        {batch.status !== 'draft' && (
          <View style={styles.liveStatsSection}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%',
                  },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressStatText}>
                <Text style={{ fontWeight: '700', color: '#4caf50' }}>{stats.completed}</Text>
                {' '}completed
              </Text>
              <Text style={styles.progressStatText}>
                <Text style={{ fontWeight: '700', color: '#2196f3' }}>{stats.pending}</Text>
                {' '}pending
              </Text>
              {stats.inProgress > 0 && (
                <Text style={styles.progressStatText}>
                  <Text style={{ fontWeight: '700', color: '#ff9800' }}>{stats.inProgress}</Text>
                  {' '}calling
                </Text>
              )}
            </View>
          </View>

          {/* Live Stats Cards */}
          <View style={styles.statsCardsContainer}>
            {/* Completed Calls */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle" size={scale(20)} color="#4caf50" />
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <Text style={[styles.statValue, { color: '#4caf50' }]}>{stats.completed}</Text>
              <Text style={styles.statSubtext}>of {stats.total}</Text>
            </View>

            {/* Pending Calls */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="time" size={scale(20)} color="#2196f3" />
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <Text style={[styles.statValue, { color: '#2196f3' }]}>{stats.pending}</Text>
              <Text style={styles.statSubtext}>waiting</Text>
            </View>
          </View>

          {/* Retry Info */}
          {stats.totalRetries > 0 && (
            <View style={styles.retryInfoCard}>
              <View style={styles.retryHeader}>
                <Ionicons name="refresh" size={scale(18)} color="#ff9800" />
                <Text style={styles.retryLabel}>Retry Information</Text>
              </View>
              <View style={styles.retryStatsRow}>
                <View style={styles.retryStatItem}>
                  <Text style={styles.retryStatValue}>{stats.totalRetries}</Text>
                  <Text style={styles.retryStatLabel}>Total Retries</Text>
                </View>
                <View style={styles.retryStatItem}>
                  <Text style={styles.retryStatValue}>{stats.avgRetries}</Text>
                  <Text style={styles.retryStatLabel}>Avg per Contact</Text>
                </View>
              </View>
              {stats.nextRetryTimes.length > 0 && (
                <View style={styles.nextRetryContainer}>
                  <Ionicons name="alert-circle" size={scale(16)} color="#ff9800" />
                  <Text style={styles.nextRetryText}>
                    {stats.nextRetryTimes.length} contact(s) scheduled for retry
                  </Text>
                </View>
              )}
            </View>
          )}

          {statsLoading && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#0a7ea4" />
              <Text style={styles.loadingText}>Live data updating...</Text>
            </View>
          )}
          </View>
        )}

      {/* Contacts List */}
        <View style={styles.contactsSection}>
          <View style={styles.contactsHeaderRow}>
            <Text style={styles.sectionTitle}>
              📞 {batch.status === 'draft' ? batch.totalContacts : stats.total} Contact(s)
            </Text>
            {batch.status !== 'draft' && statsLoading && (
              <ActivityIndicator size="small" color="#0a7ea4" />
            )}
          </View>
          {batch.status !== 'draft' && (
            <View style={styles.filterTabs}>
              {([
                { key: 'pending', label: 'Show Pending' },
                { key: 'completed', label: 'Show Completed' },
                { key: 'failed', label: 'Show Failed' },
                { key: 'retrying', label: 'Show Retrying' },
              ] as const).map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.filterTab,
                    leadFilter === tab.key && styles.filterTabActive,
                  ]}
                  onPress={() => setLeadFilter(tab.key)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      leadFilter === tab.key && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.contactsContainer}>
          {batch.status === 'draft' && batch.contacts && batch.contacts.length > 0 ? (
            // DRAFT BATCH - Compact static list
            batch.contacts.slice(0, isSmallDevice ? 8 : 15).map((contact, index) => (
              <View key={index} style={styles.contactRow}>
                <View style={styles.contactMainRow}>
                  <View style={styles.contactLeft}>
                  <View style={styles.contactIndex}>
                    <Text style={styles.contactIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.contactPhone} numberOfLines={1}>{contact.phone}</Text>
                </View>
                  <View style={styles.contactRight}>
                  {typeof contact.confidence === 'number' && (
                    <Text style={styles.contactConfidence}>{(contact.confidence * 100).toFixed(0)}%</Text>
                  )}
                </View>
                </View>
              </View>
            ))
          ) : batch.status !== 'draft' && filteredLeads.length > 0 ? (
            // LIVE BATCH - Compact list with status badge
            filteredLeads.slice(0, isSmallDevice ? 8 : 15).map((lead, index) => {
              const displayStatus = getLeadDisplayStatus(lead);
              const retryCount = lead.retryCount || 0;
              const lastAttempt = formatTime(lead.lastAttemptAt || null);
              const nextRetry = formatTime(lead.nextRetryAt || null);
              const disposition = lead.aiDisposition || 'unknown';

              return (
                <View key={lead.leadId} style={styles.contactRow}>
                  <View style={styles.contactMainRow}>
                    <View style={styles.contactLeft}>
                      <View style={[styles.contactIndex, { borderColor: displayStatus.color, borderWidth: 2 }]}>
                        <Text style={styles.contactIndexText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.contactPhone} numberOfLines={1}>{lead.phone}</Text>
                    </View>
                    <View style={styles.contactRight}>
                      <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
                        <Text style={styles.statusBadgeText} numberOfLines={1}>
                          {displayStatus.emoji} {displayStatus.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.contactMetaRow}>
                    <Text style={styles.contactMetaText} numberOfLines={1}>
                      Retry: {retryCount}/{MAX_RETRY_COUNT} – Next at {nextRetry}
                    </Text>
                    <Text style={styles.contactMetaText} numberOfLines={1}>
                      Last: {lastAttempt} · Status: {lead.callStatus} · AI: {disposition}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noContacts}>No contacts in this batch</Text>
          )}
          {batch.status === 'draft' && batch.contacts && batch.contacts.length > (isSmallDevice ? 8 : 15) && (
            <View style={[styles.contactRow, styles.contactRowFooter]}>
              <Text style={styles.contactMoreText}>
                +{batch.contacts.length - (isSmallDevice ? 8 : 15)} more contacts
              </Text>
            </View>
          )}
          {batch.status !== 'draft' && filteredLeads.length > (isSmallDevice ? 8 : 15) && (
            <View style={[styles.contactRow, styles.contactRowFooter]}>
              <Text style={styles.contactMoreText}>
                +{filteredLeads.length - (isSmallDevice ? 8 : 15)} more contacts
              </Text>
            </View>
          )}
          </View>
        </View>

      {/* Call Now Confirmation Modal */}
        <ConfirmationModal
          visible={showCallNowModal}
          title="Call Batch Now"
          message="Confirm this action to start the batch immediately."
          confirmText="Call Now"
          confirmColor="#4caf50"
          loading={saving}
          onCancel={() => setShowCallNowModal(false)}
          onConfirm={handleCallNowConfirm}
          icon="call"
          summaryItems={[
            { label: 'Batch', value: `#${batch?.batchId?.slice(0, 8) || '-'}` },
            { label: 'Leads', value: `${batch?.totalContacts || 0}` },
            { label: 'Cost', value: `₹${getDeductionPreview(batch?.totalContacts || 0).toLocaleString()}` },
          ]}
        />

      {/* Schedule Confirmation Modal */}
        <ScheduleConfirmationModal
          visible={showScheduleModal}
          totalContacts={batch?.totalContacts || 0}
          loading={saving}
          onCancel={() => setShowScheduleModal(false)}
          onConfirm={handleScheduleConfirm}
        />

      {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={showDeleteModal}
          title="Delete Batch"
          message={`Delete this batch with ${batch?.totalContacts} contacts? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="#f44336"
          loading={saving}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          icon="trash"
        />

        <PricingModal
          visible={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          pricing={pricing}
        />

        <FeatureComingSoonModal
          visible={showScheduleComingSoonModal}
          onClose={() => setShowScheduleComingSoonModal(false)}
          title="Scheduled Calling – Coming Soon"
          message="Scheduled calling will be available soon as part of our advanced plans. We're preparing something powerful for you."
          footnote="Early access rolling out after launch."
          buttonText="Got it"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    paddingVertical: verticalScale(12),
  },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: scale(14),
    paddingBottom: verticalScale(16),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    backgroundColor: colors.primary,
    borderRadius: scale(10),
    marginBottom: SECTION_GAP,
  },
  headerBackButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: scale(10),
  },
  headerTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: scale(9),
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(2),
  },
  infoSection: {
    marginBottom: SECTION_GAP,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eef0f3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
  },
  infoLabel: {
    fontSize: scale(10),
    color: colors.gray,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: scale(10),
    color: colors.dark,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionSection: {
    marginBottom: SECTION_GAP,
    gap: verticalScale(8),
  },
  pricingSection: {
    marginBottom: verticalScale(2),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    borderRadius: scale(10),
    gap: scale(6),
    minHeight: verticalScale(40),
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  scheduleButton: {
    backgroundColor: '#2196f3',
  },
  scheduleLockedButton: {
    opacity: 0.9,
  },
  scheduleLockBadge: {
    position: 'absolute',
    top: verticalScale(5),
    right: scale(7),
    width: scale(17),
    height: scale(17),
    borderRadius: scale(8.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107,114,128,0.45)',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  testButton: {
    backgroundColor: '#ff9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: scale(11),
    fontWeight: '600',
  },
  statusSection: {
    marginBottom: SECTION_GAP,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    gap: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusText: {
    fontSize: scale(10),
    fontWeight: '600',
    color: colors.dark,
    flex: 1,
  },
  billingLinkButton: {
    marginTop: verticalScale(8),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#bfe5ef',
    backgroundColor: '#eef8fb',
  },
  billingLinkText: {
    fontSize: scale(10),
    color: colors.primary,
    fontWeight: '700',
  },
  contactsSection: {
    marginBottom: SECTION_GAP,
  },
  sectionTitle: {
    fontSize: scale(11),
    fontWeight: '600',
    color: colors.dark,
    marginBottom: verticalScale(6),
  },
  contactsContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eef0f3',
    maxHeight: verticalScale(320),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  filterTab: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(10),
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#0a7ea4',
  },
  filterTabText: {
    fontSize: scale(9),
    color: colors.gray,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
    flexWrap: 'wrap',
    gap: verticalScale(4),
  },
  contactRowFooter: {
    justifyContent: 'center',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(8),
  },
  contactMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  contactMetaRow: {
    width: '100%',
    gap: verticalScale(2),
  },
  contactMetaText: {
    fontSize: scale(8),
    color: colors.gray,
    fontWeight: '500',
  },
  contactIndex: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIndexText: {
    color: '#fff',
    fontSize: scale(8),
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: scale(10),
    fontWeight: '600',
    color: colors.dark,
  },
  contactConfidence: {
    fontSize: scale(9),
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
    backgroundColor: 'rgba(10, 126, 164, 0.12)',
  },
  contactMoreText: {
    fontSize: scale(9),
    color: colors.gray,
    fontWeight: '600',
  },
  noContacts: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(10),
    textAlign: 'center',
    color: colors.gray,
    fontSize: scale(10),
  },
  // LIVE STATS STYLES
  liveStatsSection: {
    marginBottom: SECTION_GAP,
    gap: verticalScale(8),
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#eef0f3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  progressLabel: {
    fontSize: scale(10),
    fontWeight: '600',
    color: colors.dark,
  },
  progressPercent: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#4caf50',
  },
  progressBar: {
    height: verticalScale(10),
    backgroundColor: '#e0e0e0',
    borderRadius: scale(6),
    overflow: 'hidden',
    marginBottom: verticalScale(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: scale(6),
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(8),
  },
  progressStatText: {
    fontSize: scale(9),
    color: colors.gray,
    fontWeight: '500',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#eef0f3',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: scale(9),
    color: colors.gray,
    fontWeight: '500',
  },
  statValue: {
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  statSubtext: {
    fontSize: scale(8),
    color: colors.gray,
  },
  retryInfoCard: {
    backgroundColor: '#fff8f0',
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#ffe0b2',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  retryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(6),
  },
  retryLabel: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#ff9800',
  },
  retryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  retryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  retryStatValue: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#ff9800',
  },
  retryStatLabel: {
    fontSize: scale(8),
    color: colors.gray,
    marginTop: verticalScale(1),
  },
  nextRetryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(4),
    paddingTop: verticalScale(3),
    borderTopWidth: 1,
    borderTopColor: '#ffcc80',
  },
  nextRetryText: {
    fontSize: scale(9),
    color: '#ff9800',
    fontWeight: '500',
    flex: 1,
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    gap: scale(6),
  },
  loadingText: {
    fontSize: scale(9),
    color: colors.gray,
    fontWeight: '500',
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  liveContactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  liveContactInfo: {
    flex: 1,
    marginLeft: scale(8),
  },
  liveContactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
    minHeight: verticalScale(18),
  },
  statusBadgeText: {
    fontSize: scale(8),
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  liveContactMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
  },
  metaText: {
    fontSize: scale(8),
    color: colors.gray,
    fontWeight: '500',
  },
  liveContactMainInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  nextRetryBanner: {
    backgroundColor: '#ff9800',
    borderRadius: scale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(4),
  },
  nextRetryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  nextRetryBannerText: {
    fontSize: scale(8),
    fontWeight: '600',
    color: '#fff',
  },
  retryNowButton: {
    backgroundColor: '#2196f3',
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(6),
  },
});
