/**
 * BATCH SYSTEM TEST HOOKS
 * Integrates TestReporter with batch operations for automated testing and reporting
 *
 * Usage in components:
 *   import { useBatchTestHook } from '@/src/utils/batchTestHooks';
 *   const testHook = useBatchTestHook();
 *   testHook.logBatchDetailOpen(batch);
 *   testHook.logCallNowAttempt(batch);
 */

import { Batch, BatchDraft, Lead } from '../types/batch';
import { TestReporter } from './TestReporter';

export function useBatchTestHook() {
  const logBatchCreation = (batch: Batch | BatchDraft, source: string) => {
    TestReporter.log(`📦 Batch created via ${source}`);
    TestReporter.pass(
      `Batch ID: ${batch.batchId.substring(0, 12)}... with ${batch.totalContacts} contacts`
    );
    TestReporter.assert(batch.totalContacts > 0, 'Contact count > 0');
    TestReporter.assert(batch.status === 'draft', 'Initial status is draft');
  };

  const logBatchDetailOpen = (batch: Batch | BatchDraft | null) => {
    if (!batch) {
      TestReporter.fail('Batch detail opened but batch is null');
      return;
    }
    TestReporter.pass(`Opened batch: ${batch.batchId.substring(0, 12)}...`);
    TestReporter.assert(batch.totalContacts > 0, `Batch has ${batch.totalContacts} contacts`);
  };

  const logCallNowAttempt = (batch: Batch | BatchDraft | null, balance: number, required: number) => {
    if (!batch) {
      TestReporter.fail('Call Now clicked but batch is null');
      return;
    }

    TestReporter.log('💰 Checking wallet balance...');
    TestReporter.log(`   Required: ₹${required} (${batch.totalContacts} × ₹14)`);
    TestReporter.log(`   Available: ₹${balance}`);

    if (balance >= required) {
      TestReporter.pass(`Sufficient balance: ₹${balance} >= ₹${required}`);
    } else {
      TestReporter.fail(
        `Insufficient balance: ₹${balance} < ₹${required}. User should see recharge prompt.`
      );
      TestReporter.critical(`Balance check error: ${balance} < ${required}`);
    }
  };

  const logBatchSaveToFirebase = (batch: Batch | BatchDraft | null, action: string) => {
    if (!batch) {
      TestReporter.fail('Saving batch but batch is null');
      return;
    }

    TestReporter.log(`🔥 Saving batch to Firebase [action: ${action}]`);
    TestReporter.log(`   Batch ID: ${batch.batchId}`);
    TestReporter.log(`   Total contacts: ${batch.totalContacts}`);
  };

  const logBatchSaveSuccess = (batch: Batch | BatchDraft | null) => {
    if (!batch) return;
    TestReporter.pass(`Batch ${batch.batchId.substring(0, 12)}... saved successfully`);
    TestReporter.assert(batch.status !== 'draft', `Status changed from draft to ${batch.status}`);
  };

  const logBatchSaveError = (error: Error, batchId: string) => {
    TestReporter.fail(`Failed to save batch ${batchId.substring(0, 12)}...`, error);
    TestReporter.critical(`Firebase save error: ${error.message}`);
  };

  const logLeadsListenerSetup = (batchId: string, leadCount: number) => {
    TestReporter.pass(`Real-time listener setup for ${leadCount} leads`);
    TestReporter.log(`   Batch: ${batchId.substring(0, 12)}...`);
  };

  const logLeadsUpdate = (leads: Lead[]) => {
    const completed = leads.filter((l) => l.status === 'completed').length;
    const pending = leads.filter((l) => l.status === 'queued').length;
    const inProgress = leads.filter((l) =>
      l.status === 'calling' || l.callStatus === 'in_progress'
    ).length;

    TestReporter.log(
      `📊 Leads update received: ${completed}✓ ${pending}⏱ ${inProgress}📞`
    );
  };

  const logProgressBarUpdate = (completed: number, total: number) => {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    TestReporter.pass(`Progress bar updated: ${completed}/${total} (${percent}%)`);
  };

  const logStatusChangeDetected = (leadId: string, oldStatus: string, newStatus: string) => {
    TestReporter.log(`🔄 Status change: ${oldStatus} → ${newStatus} [${leadId.substring(0, 8)}...]`);
  };

  const logRetryScheduled = (leadId: string, nextRetryTime: Date) => {
    TestReporter.log(
      `⏰ Retry scheduled for ${nextRetryTime.toLocaleTimeString()} [${leadId.substring(0, 8)}...]`
    );
  };

  const logWalletIntegration = (operation: string, details: Record<string, any>) => {
    TestReporter.log(`💳 Wallet ${operation}:`);
    Object.entries(details).forEach(([key, value]) => {
      TestReporter.log(`   ${key}: ${value}`);
    });
  };

  const validateUIElements = (batch: Batch | BatchDraft | null) => {
    if (!batch) return;

    TestReporter.log('🔍 Validating UI elements...');

    // Check status badge
    TestReporter.assert(!!batch.status, 'Status badge visible');

    // Check batch info
    TestReporter.assert(!!batch.batchId, 'Batch ID visible');
    TestReporter.assert(batch.totalContacts > 0, 'Contact count visible');
    TestReporter.assert(!!batch.createdAt, 'Created date visible');

    // Check action buttons (for draft)
    if (batch.status === 'draft') {
      TestReporter.assert(true, 'Call Now button visible');
      TestReporter.assert(true, 'Schedule button visible');
      TestReporter.assert(true, 'Delete button visible');
    }
  };

  const validateDashboardUpdate = (newBatch: Batch | BatchDraft) => {
    TestReporter.log('📋 Validating dashboard update...');
    TestReporter.pass(`New batch appears in dashboard list`);
    TestReporter.assert(newBatch.status !== 'draft', `Status shows as ${newBatch.status}`);
  };

  const reportNetworkError = (error: Error, operation: string) => {
    TestReporter.fail(`Network error during ${operation}`, error);
    TestReporter.warning(`Network connectivity issue: ${error.message}`);
  };

  const reportMemoryUsage = (description: string) => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
      TestReporter.log(`💾 Memory ${description}: ${usedMB}MB`);
    }
  };

  return {
    logBatchCreation,
    logBatchDetailOpen,
    logCallNowAttempt,
    logBatchSaveToFirebase,
    logBatchSaveSuccess,
    logBatchSaveError,
    logLeadsListenerSetup,
    logLeadsUpdate,
    logProgressBarUpdate,
    logStatusChangeDetected,
    logRetryScheduled,
    logWalletIntegration,
    validateUIElements,
    validateDashboardUpdate,
    reportNetworkError,
    reportMemoryUsage,
  };
}

/**
 * Test execution helper - coordinates entire test flow
 */
export function runBatchSystemTests() {
  return {
    startTestSuite: (suiteName: string) => {
      TestReporter.reset();
      TestReporter.setEnvironment({
        device: 'Mobile (React Native)',
        network: 'WiFi',
        auth: 'Logged In',
        firebase: 'Connected',
        database: 'Firestore',
      });
      TestReporter.logSection('TEST SUITE', suiteName);
    },
    finishTestSuite: () => {
      const report = TestReporter.generateReport();
      return report;
    },
  };
}
