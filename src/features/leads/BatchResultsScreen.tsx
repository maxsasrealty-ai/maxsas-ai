import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { collection, doc, onSnapshot, query, setDoc, Timestamp, where } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { useAuth } from '@/src/context/AuthContext';
import { db } from '@/src/lib/firebase';
import { finalizeBatchBillingFromClient } from '@/src/services/walletService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Batch, Lead } from '@/src/types/batch';

type BatchResultsSource = 'batch-detail' | 'leads' | 'dashboard';
type LeadFilter = 'all' | 'hot' | 'warm' | 'cold';
type ResultCategory = 'qualified' | 'neutral' | 'failed';

const QUALIFIED_DISPOSITIONS = new Set(['interested', 'callback_requested', 'meeting_scheduled']);
const NEUTRAL_DISPOSITIONS = new Set(['not_interested', 'budget_not_decided', 'timeline_long_term', 'follow_up']);
const FAILED_DISPOSITIONS = new Set([
  'junk',
  'wrong_person',
  'invalid_number',
  'call_failed',
  'user_no_response',
  'attempt_limit_reached',
  'user_deleted',
  'unknown',
]);

const DISPOSITION_LABELS: Record<string, string> = {
  interested: 'Interested',
  callback_requested: 'Callback Requested',
  meeting_scheduled: 'Meeting Scheduled',
  not_interested: 'Not Interested',
  budget_not_decided: 'Budget Not Decided',
  timeline_long_term: 'Long-Term Timeline',
  follow_up: 'Follow Up',
  wrong_person: 'Wrong Person',
  invalid_number: 'Invalid Number',
  user_no_response: 'No Response',
  call_failed: 'Call Failed',
  junk: 'Junk',
  attempt_limit_reached: 'Attempt Limit Reached',
  user_deleted: 'User Deleted',
  unknown: 'Unknown',
};

const ISSUE_TYPE_OPTIONS = [
  'Lead classification incorrect',
  'AI conversation incorrect',
  'Too many failed calls',
  'Billing issue',
  'Retry issue',
  'Lead marked wrong',
  'Other issue',
] as const;

const toDate = (value: unknown): Date | null => {
  const maybeTimestamp = value as { toDate?: () => Date } | null;
  if (maybeTimestamp && typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate();
  }
  return null;
};

const normalizeDisposition = (lead: Lead): string => String(lead.aiDisposition || 'unknown').toLowerCase();

const getCategory = (lead: Lead): ResultCategory => {
  const disposition = normalizeDisposition(lead);
  if (QUALIFIED_DISPOSITIONS.has(disposition)) return 'qualified';
  if (NEUTRAL_DISPOSITIONS.has(disposition)) return 'neutral';
  if (FAILED_DISPOSITIONS.has(disposition)) return 'failed';

  if (lead.status === 'failed_permanent' || lead.status === 'failed_retryable') {
    return 'failed';
  }

  return 'neutral';
};

const getLeadTemperature = (lead: Lead): 'hot' | 'warm' | 'cold' => {
  const rawTemperature = String((lead as any)?.leadTemperature || '').toLowerCase();

  if (rawTemperature === 'hot' || rawTemperature === 'warm' || rawTemperature === 'cold') {
    return rawTemperature;
  }

  return 'cold';
};

const getDispositionLabel = (value: string | null | undefined): string => {
  const key = String(value || 'unknown').toLowerCase();
  return DISPOSITION_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTimestamp = (value: unknown): string => {
  const date = toDate(value);
  if (!date) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BatchResultsScreen() {
  const { colors, spacing, radius, typography } = useAppTheme();
  const { user, authLoaded } = useAuth();
  const { batchId, source } = useLocalSearchParams<{ batchId?: string; source?: BatchResultsSource }>();
  const navigation = useNavigation();
  const { width: viewportWidth } = useWindowDimensions();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<LeadFilter>('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState<(typeof ISSUE_TYPE_OPTIONS)[number]>('Lead classification incorrect');
  const [issueDescription, setIssueDescription] = useState('');
  const [relatedLeadId, setRelatedLeadId] = useState<string | null>(null);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [issueSubmitError, setIssueSubmitError] = useState<string | null>(null);
  const [hasReportedIssueForBatch, setHasReportedIssueForBatch] = useState(false);
  const [issueReportCheckLoaded, setIssueReportCheckLoaded] = useState(false);
  const billingSyncRef = React.useRef<Set<string>>(new Set());

  const handleHeaderBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (batchId) {
      router.replace({ pathname: '/batch-detail', params: { batchId } });
      return;
    }

    router.replace('/batch-dashboard');
  }, [batchId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleHeaderBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.headerBackButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
      ),
    });
  }, [colors.border, colors.card, colors.text, handleHeaderBack, navigation]);

  React.useEffect(() => {
    if (!authLoaded) {
      setBatchLoaded(false);
      setLeadsLoaded(false);
      return;
    }

    if (!user?.uid) {
      setBatch(null);
      setLeads([]);
      setError('Please login to view batch results.');
      setBatchLoaded(true);
      setLeadsLoaded(true);
      return;
    }

    if (!batchId) {
      setBatch(null);
      setLeads([]);
      setError('Missing batch ID.');
      setBatchLoaded(true);
      setLeadsLoaded(true);
      return;
    }

    setError(null);
    setBatchLoaded(false);
    setLeadsLoaded(false);

    const unsubscribeBatch = onSnapshot(
      doc(db, 'batches', batchId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBatch(null);
          setError((current) => current ?? 'Batch not found.');
          setBatchLoaded(true);
          return;
        }

        setBatch(snapshot.data() as Batch);
        setBatchLoaded(true);
      },
      (snapshotError) => {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Failed to load batch.');
        setBatchLoaded(true);
      }
    );

    const leadsQuery = query(collection(db, 'leads'), where('batchId', '==', batchId));
    const unsubscribeLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((leadDoc) => ({ leadId: leadDoc.id, ...(leadDoc.data() as Omit<Lead, 'leadId'>) }))
          .sort((left, right) => left.phone.localeCompare(right.phone));

        setLeads(rows as Lead[]);
        setLeadsLoaded(true);
      },
      (snapshotError) => {
        setError(snapshotError instanceof Error ? snapshotError.message : 'Failed to load leads.');
        setLeadsLoaded(true);
      }
    );

    return () => {
      unsubscribeBatch();
      unsubscribeLeads();
    };
  }, [authLoaded, user?.uid, batchId, reloadKey]);

  React.useEffect(() => {
    if (!authLoaded || !user?.uid || !batchId) {
      setHasReportedIssueForBatch(false);
      setIssueReportCheckLoaded(true);
      return;
    }

    setIssueReportCheckLoaded(false);

    const issueQuery = query(
      collection(db, 'batchIssues'),
      where('batchId', '==', batchId),
      where('userId', '==', user.uid)
    );

    const unsubscribeIssues = onSnapshot(
      issueQuery,
      (snapshot) => {
        setHasReportedIssueForBatch(snapshot.docs.length > 0);
        setIssueReportCheckLoaded(true);
      },
      () => {
        setHasReportedIssueForBatch(false);
        setIssueReportCheckLoaded(true);
      }
    );

    return () => unsubscribeIssues();
  }, [authLoaded, user?.uid, batchId]);

  React.useEffect(() => {
    if (!authLoaded || !user?.uid || !batchId || !batch) {
      return;
    }

    if (batch.status !== 'completed') {
      return;
    }

    const billingLedgerStatus = String(batch.billingLedgerStatus || 'pending').toLowerCase();
    if (billingLedgerStatus === 'finalized') {
      return;
    }

    if (billingSyncRef.current.has(batchId)) {
      return;
    }

    billingSyncRef.current.add(batchId);
    let cancelled = false;

    const syncBilling = async () => {
      const result = await finalizeBatchBillingFromClient(batchId);

      if (!result.success) {
        console.error('Batch results client billing finalization failed:', result.errorMessage);
      }
    };

    void syncBilling();

    return () => {
      cancelled = true;
    };
  }, [authLoaded, user?.uid, batchId, batch?.status, batch?.billingLedgerStatus]);

  const loading = !batchLoaded || !leadsLoaded;

  const computed = useMemo(() => {
    const total = leads.length;
    const qualifiedLeads = leads.filter((lead) => getCategory(lead) === 'qualified');
    const neutralLeads = leads.filter((lead) => getCategory(lead) === 'neutral');
    const failedLeads = leads.filter((lead) => getCategory(lead) === 'failed');
    const conversionRate = total > 0 ? qualifiedLeads.length / total : 0;

    return {
      total,
      qualifiedLeads,
      neutralLeads,
      failedLeads,
      conversionRate,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (activeFilter === 'all') return leads;
    return leads.filter((lead) => getLeadTemperature(lead) === activeFilter);
  }, [activeFilter, leads]);

  const kpiItems = [
    { label: 'Total Leads', value: String(computed.total), highlight: false },
    { label: 'Qualified Leads', value: String(computed.qualifiedLeads.length), highlight: true },
    { label: 'Neutral Leads', value: String(computed.neutralLeads.length), highlight: false },
    { label: 'Unreachable Leads', value: String(computed.failedLeads.length), highlight: false },
    { label: 'Conversion Rate', value: `${Math.round(computed.conversionRate * 100)}%`, highlight: false },
  ];

  const filterItems: Array<{ key: LeadFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'hot', label: 'Hot' },
    { key: 'warm', label: 'Warm' },
    { key: 'cold', label: 'Cold' },
  ];

  const modalMaxWidth = Platform.OS === 'web' ? Math.min(760, Math.max(420, viewportWidth - 48)) : viewportWidth - 24;
  const isCompactModal = viewportWidth < 520;

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.leadId === relatedLeadId) ?? null,
    [leads, relatedLeadId]
  );

  const resetIssueForm = () => {
    setIssueType('Lead classification incorrect');
    setIssueDescription('');
    setRelatedLeadId(null);
    setShowLeadPicker(false);
    setIssueSubmitError(null);
  };

  const handleSubmitIssue = async () => {
    if (!batchId) {
      setIssueSubmitError('Batch ID missing.');
      return;
    }

    if (!user?.uid) {
      setIssueSubmitError('Please login again to submit an issue.');
      return;
    }

    try {
      setSubmittingIssue(true);
      setIssueSubmitError(null);

      const issueDocRef = doc(collection(db, 'batchIssues'));
      const appVersion = Constants.expoConfig?.version ?? 'unknown';
      const relatedLeadTemperature = selectedLead ? getLeadTemperature(selectedLead) : null;

      await setDoc(issueDocRef, {
        issueId: issueDocRef.id,
        batchId,
        userId: user.uid,
        issueType,
        description: issueDescription.trim() || null,
        relatedLeadId: relatedLeadId || null,
        relatedLeadPhone: selectedLead?.phone || null,
        relatedLeadTemperature,
        createdAt: Timestamp.now(),
        issueStatus: 'open',
        batchStatus: batch?.status ?? 'unknown',
        appVersion,
        platform: Platform.OS,
      });

      setHasReportedIssueForBatch(true);
      setShowIssueModal(false);
      resetIssueForm();
    } catch (submitError) {
      setIssueSubmitError(submitError instanceof Error ? submitError.message : 'Failed to submit issue.');
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Batch Results" subtitle="Loading campaign outcomes" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.centerText, { color: colors.textMuted }]}>Fetching batch and lead results...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Batch Results" subtitle="Unable to load data" />
        <AppCard>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          <View style={styles.retryRow}>
            <AppButton title="Retry" onPress={() => setReloadKey((value) => value + 1)} />
          </View>
        </AppCard>
      </ScreenContainer>
    );
  }

  const shortBatchId = batchId ? String(batchId).slice(0, 8) : 'N/A';

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        style={styles.resultsList}
        data={filteredLeads}
        keyExtractor={(item) => item.leadId}
        contentContainerStyle={{ paddingBottom: spacing.xl, flexGrow: 1 }}
        ListHeaderComponent={
          <>
            <AppHeader
              title="Batch Results"
              subtitle={`Batch ${shortBatchId} • ${source ? `from ${source}` : 'final outcomes'}`}
            />

            <AppCard>
              <Text style={[styles.campaignText, { color: colors.success }]}>AI Calling Campaign Completed</Text>
              <View style={styles.headerMetaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Batch ID</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{batch?.batchId || batchId}</Text>
              </View>
              <View style={styles.headerMetaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Completed At</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{formatTimestamp(batch?.completedAt)}</Text>
              </View>
              <View style={styles.headerMetaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Status</Text>
                <StatusBadge label={String(batch?.status || 'unknown').toUpperCase()} tone={batch?.status === 'completed' ? 'success' : 'warning'} />
              </View>
            </AppCard>

            {batch?.status !== 'completed' && (
              <AppCard style={{ borderColor: colors.warning }}>
                <Text style={[styles.processingText, { color: colors.warning }]}>Batch still processing</Text>
              </AppCard>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.title, marginTop: spacing.lg }]}>KPI Summary</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} style={{ marginTop: spacing.sm }}>
              {kpiItems.map((item) => (
                <AppCard
                  key={item.label}
                  style={[
                    styles.kpiCard,
                    {
                      borderColor: item.highlight ? colors.success : colors.border,
                      backgroundColor: item.highlight ? `${colors.success}14` : colors.card,
                    },
                  ]}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{item.label}</Text>
                  <Text style={[styles.kpiValue, { color: item.highlight ? colors.success : colors.text }]}>{item.value}</Text>
                </AppCard>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.title, marginTop: spacing.lg }]}>Hot Leads Generated</Text>
            {computed.qualifiedLeads.length === 0 ? (
              <AppCard style={{ marginTop: spacing.sm }}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No qualified leads in this batch.</Text>
              </AppCard>
            ) : (
              <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
                {computed.qualifiedLeads.map((lead) => (
                  <AppCard key={`hot-${lead.leadId}`} style={{ borderColor: colors.success, backgroundColor: `${colors.success}12` }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.hotPhone, { color: colors.text }]}>{lead.phone}</Text>
                      <StatusBadge label={getDispositionLabel(lead.aiDisposition)} tone="success" />
                    </View>
                    <Text style={[styles.hotReason, { color: colors.textMuted }]} numberOfLines={2}>
                      {lead.notes || getDispositionLabel(lead.aiDisposition)}
                    </Text>
                  </AppCard>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.title, marginTop: spacing.lg }]}>All Lead Results</Text>
            <View style={[styles.filterRow, { marginTop: spacing.sm }]}> 
              {filterItems.map((item) => {
                const isActive = activeFilter === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setActiveFilter(item.key)}
                    style={[
                      styles.filterChip,
                      {
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? `${colors.primary}18` : colors.card,
                      },
                    ]}>
                    <Text style={[styles.filterChipText, { color: isActive ? colors.primary : colors.textMuted }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {leads.length === 0 && (
              <AppCard style={{ marginTop: spacing.sm }}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No lead results found for this batch.</Text>
              </AppCard>
            )}

            {batch?.status === 'completed' && issueReportCheckLoaded && !hasReportedIssueForBatch && (
              <AppCard style={{ marginTop: spacing.lg, borderColor: colors.warning }}>
                <Text style={[styles.issueBannerTitle, { color: colors.text }]}>How did this campaign perform?</Text>
                <Text style={[styles.issueBannerText, { color: colors.textMuted }]}>Report any issue if something looks wrong.</Text>
                <View style={{ marginTop: spacing.sm }}>
                  <AppButton
                    title="Report Issue"
                    variant="secondary"
                    onPress={() => {
                      setIssueSubmitError(null);
                      setShowIssueModal(true);
                    }}
                  />
                </View>
              </AppCard>
            )}
          </>
        }
        ListEmptyComponent={
          leads.length > 0 ? (
            <AppCard style={{ marginTop: spacing.sm }}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No leads match this filter.</Text>
            </AppCard>
          ) : null
        }
        renderItem={({ item }) => {
          const leadTemperature = getLeadTemperature(item);
          const statusTone = leadTemperature === 'hot' ? 'success' : leadTemperature === 'warm' ? 'warning' : 'info';

          return (
            <AppCard style={{ marginTop: spacing.sm, opacity: leadTemperature === 'cold' ? 0.92 : 1 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.leadPhone, { color: colors.text }]}>{item.phone}</Text>
                <StatusBadge label={leadTemperature.toUpperCase()} tone={statusTone} />
              </View>
              <View style={[styles.metaGrid, { borderTopColor: colors.border }]}> 
                <View style={styles.metaItem}>
                  <Text style={[styles.metaItemLabel, { color: colors.textMuted }]}>Final Status</Text>
                  <Text style={[styles.metaItemValue, { color: colors.text }]}>{item.status}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaItemLabel, { color: colors.textMuted }]}>AI Disposition</Text>
                  <Text style={[styles.metaItemValue, { color: colors.text }]}>{getDispositionLabel(item.aiDisposition)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaItemLabel, { color: colors.textMuted }]}>Attempt Count</Text>
                  <Text style={[styles.metaItemValue, { color: colors.text }]}>{item.attempts ?? item.retryCount ?? 0}</Text>
                </View>
              </View>
            </AppCard>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <AppButton
              title="View Billing Detail"
              onPress={() => {
                if (!batchId) return;
                router.push({ pathname: '/batch-billing-detail', params: { batchId } });
              }}
            />
            <AppButton
              title="Back to Batch Detail"
              variant="secondary"
              onPress={() => {
                if (!batchId) return;
                router.push({ pathname: '/batch-detail', params: { batchId } });
              }}
            />
          </View>
        }
      />

      <Modal
        visible={showIssueModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (submittingIssue) return;
          setShowIssueModal(false);
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
                maxWidth: modalMaxWidth,
              },
            ]}
          > 
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Report Batch Issue</Text>
              <Pressable
                onPress={() => {
                  if (submittingIssue) return;
                  setShowIssueModal(false);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Issue Type</Text>
              <View style={styles.issueTypeWrap}>
                {ISSUE_TYPE_OPTIONS.map((option) => {
                  const isSelected = issueType === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setIssueType(option)}
                      style={[
                        styles.issueTypeChip,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? `${colors.primary}18` : colors.card,
                        },
                      ]}
                    >
                      <Text style={[styles.issueTypeChipText, { color: isSelected ? colors.primary : colors.textMuted }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.modalLabel, { color: colors.text, marginTop: spacing.md }]}>Description (optional)</Text>
              <TextInput
                value={issueDescription}
                onChangeText={setIssueDescription}
                multiline
                placeholder="Describe the issue in any language"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.descriptionInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: radius.md,
                  },
                ]}
                textAlignVertical="top"
              />

              <Text style={[styles.modalLabel, { color: colors.text, marginTop: spacing.md }]}>Attach related lead (optional)</Text>
              <TouchableOpacity
                style={[styles.leadSelectorButton, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md }]}
                onPress={() => setShowLeadPicker((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={[styles.leadSelectorText, { color: colors.text }]}>
                  {selectedLead ? `${selectedLead.phone} (${selectedLead.leadId.slice(0, 8)})` : 'No lead selected'}
                </Text>
                <Ionicons
                  name={showLeadPicker ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {showLeadPicker && (
                <View style={[styles.leadPickerList, { borderColor: colors.border, borderRadius: radius.md }]}> 
                  <Pressable
                    style={[styles.leadPickerRow, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setRelatedLeadId(null);
                      setShowLeadPicker(false);
                    }}
                  >
                    <Text style={[styles.leadPickerText, { color: colors.textMuted }]}>No lead selected</Text>
                  </Pressable>
                  {leads.slice(0, 50).map((lead) => (
                    <Pressable
                      key={lead.leadId}
                      style={[styles.leadPickerRow, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setRelatedLeadId(lead.leadId);
                        setShowLeadPicker(false);
                      }}
                    >
                      <Text style={[styles.leadPickerText, { color: colors.text }]}>{lead.phone}</Text>
                      <Text style={[styles.leadPickerSubText, { color: colors.textMuted }]}>{getDispositionLabel(lead.aiDisposition)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {issueSubmitError ? (
                <Text style={[styles.issueErrorText, { color: colors.danger, marginTop: spacing.sm }]}>{issueSubmitError}</Text>
              ) : null}
            </ScrollView>

            <View
              style={[
                styles.modalActionsRow,
                {
                  marginTop: spacing.md,
                  flexDirection: isCompactModal ? 'column' : 'row',
                },
              ]}
            > 
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  if (submittingIssue) return;
                  setShowIssueModal(false);
                }}
                style={styles.modalActionButton}
              />
              <AppButton
                title={submittingIssue ? 'Submitting...' : 'Submit Issue'}
                onPress={handleSubmitIssue}
                loading={submittingIssue}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBackButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  resultsList: {
    flex: 1,
  },
  centerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  retryRow: {
    marginTop: 12,
  },
  campaignText: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  headerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  processingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  issueBannerText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: '800',
  },
  kpiCard: {
    minWidth: 140,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  kpiValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  hotPhone: {
    fontSize: 13,
    fontWeight: '800',
  },
  hotReason: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  distributionRow: {
    gap: 6,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  distributionMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  distributionTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 999,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  leadPhone: {
    fontSize: 13,
    fontWeight: '800',
  },
  metaGrid: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaItemLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaItemValue: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  modalCard: {
    borderWidth: 1,
    width: '100%',
    maxHeight: '84%',
    padding: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalBody: {
    marginTop: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueTypeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  issueTypeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  issueTypeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  descriptionInput: {
    marginTop: 8,
    minHeight: 96,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  leadSelectorButton: {
    marginTop: 8,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  leadSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  leadPickerList: {
    marginTop: 8,
    borderWidth: 1,
    maxHeight: 180,
    overflow: 'hidden',
  },
  leadPickerRow: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leadPickerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  leadPickerSubText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },
  issueErrorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
  },
});