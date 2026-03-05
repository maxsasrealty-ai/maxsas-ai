import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useBatch } from '../../context/BatchContext';
import { useWallet } from '../../context/WalletContext';
import { useAppTheme } from '../../theme/use-app-theme';
import { Batch, BatchDraft } from '../../types/batch';

// Color constants
const colors = {
  primary: '#0a7ea4',
  dark: '#11181C',
  gray: '#687076',
};

// Responsive helpers
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const MAX_CONTENT_WIDTH = 960;
const GRID_GAP = 12;

const getColumnCount = (screenWidth: number) => {
  if (screenWidth >= 1100) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
};

const getContentWidth = (screenWidth: number) => Math.min(screenWidth, MAX_CONTENT_WIDTH);

const maxScaleWidth = Math.min(width, 420);
const maxScaleHeight = Math.min(height, 800);
const scale = (size: number) => (maxScaleWidth / 375) * size;
const verticalScale = (size: number) => (maxScaleHeight / 667) * size;

export const BatchDashboard: React.FC = () => {
  const { colors: themeColors, spacing, radius, typography } = useAppTheme();
  const { allBatches, leadStatsByBatch, loading, error, clearError, saveBatchToFirebase } = useBatch();
  const {
    availableBalance,
    checkBalance,
    costPerCall,
    loading: walletLoading,
  } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [contentLayoutWidth, setContentLayoutWidth] = useState(getContentWidth(width) - scale(32));
  const [startingBatchId, setStartingBatchId] = useState<string | null>(null);
  const [showCallConfirmModal, setShowCallConfirmModal] = useState(false);
  const [selectedBatchForCall, setSelectedBatchForCall] = useState<Batch | BatchDraft | null>(null);
  const params = useLocalSearchParams();
  const successMessage = params.successMessage as string | undefined;

  // No need to call getAllBatches - real-time listener handles this
  // useFocusEffect removed - batches update automatically

  const handleRefresh = async () => {
    // Refresh is now instant since we're using real-time listeners
    // Just provide visual feedback
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const getStatusBadgeColor = (batch: Batch | BatchDraft) => {
    switch (batch.status) {
      case 'draft':
        return '#FFA500'; // Orange
      case 'queued':
        return '#FF6B6B'; // Red
      case 'scheduled':
        return '#4169E1'; // Royal Blue
      case 'running':
        return '#32CD32'; // Lime Green
      case 'completed':
        return '#228B22'; // Forest Green
      default:
        return '#666';
    }
  };

  const getStatusLabel = (batch: Batch | BatchDraft) => {
    switch (batch.status) {
      case 'draft':
        return 'Awaiting Command';
      case 'queued':
        return 'In Queue';
      case 'scheduled':
        return 'scheduled' in batch && batch.scheduleAt
          ? `Scheduled at ${new Date(batch.scheduleAt.seconds * 1000).toLocaleTimeString()}`
          : 'Scheduled';
      case 'running':
        return 'Calling in Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'csv':
        return '📊';
      case 'image':
        return '📷';
      case 'clipboard':
        return '📋';
      case 'manual':
        return '✏️';
      default:
        return '📄';
    }
  };

  const getCallNowDisabledReason = (batch: Batch | BatchDraft) => {
    if (walletLoading) return 'Checking wallet balance...';
    if (batch.status !== 'draft') return 'Only draft batches can be started';

    const required = batch.totalContacts * costPerCall;
    if (availableBalance < required) {
      const shortfall = Math.max(0, required - availableBalance);
      return `Insufficient balance (need ₹${shortfall.toLocaleString()} more)`;
    }

    return null;
  };

  const executeCallNow = async (batch: Batch | BatchDraft) => {
    try {
      setStartingBatchId(batch.batchId);
      const balanceCheck = await checkBalance(batch.totalContacts);
      if (!balanceCheck.success) {
        const available = balanceCheck.availableBalance ?? availableBalance;
        const required = balanceCheck.requiredAmount ?? (batch.totalContacts * costPerCall);
        const shortfall = Math.max(0, required - available);
        Alert.alert(
          '⚠️ Recharge Required',
          `You need ₹${shortfall.toLocaleString()} more to start this batch`
        );
        return;
      }

      const result = await saveBatchToFirebase(batch, 'call_now');
      if (result?.success) {
        Alert.alert('Success', 'Batch sent to calling system.');
      } else {
        Alert.alert('Failed to start batch', result?.errorMessage || 'Please try again.');
      }
    } finally {
      setStartingBatchId(null);
      setShowCallConfirmModal(false);
      setSelectedBatchForCall(null);
    }
  };

  const handleCallNow = (batch: Batch | BatchDraft) => {
    const disabledReason = getCallNowDisabledReason(batch);
    if (disabledReason) {
      Alert.alert('Call Now Unavailable', disabledReason);
      return;
    }

    setSelectedBatchForCall(batch);
    setShowCallConfirmModal(true);
  };

  const columns = getColumnCount(contentLayoutWidth);
  const cardWidth =
    columns === 1
      ? Math.max(0, contentLayoutWidth)
      : Math.floor((contentLayoutWidth - GRID_GAP * (columns - 1)) / columns);

  if (loading && allBatches.length === 0) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.screen, { backgroundColor: themeColors.background }]}> 
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textMuted, fontSize: typography.body }]}>Loading batches...</Text>
          <View style={styles.loadingGrid}>
            {Array.from({ length: columns * 2 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={[styles.skeletonCard, { width: cardWidth, backgroundColor: themeColors.border }]} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.screen, { backgroundColor: themeColors.background }]}> 
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={styles.content}
          onLayout={(event) => {
            const measuredWidth = event.nativeEvent.layout.width;
            if (measuredWidth > 0 && Math.abs(measuredWidth - contentLayoutWidth) > 1) {
              setContentLayoutWidth(measuredWidth);
            }
          }}
        >
          {/* Real-time Indicator */}
          <View style={[styles.liveIndicator, { backgroundColor: themeColors.success + '1A', borderRadius: radius.sm, marginTop: spacing.xs }]}>
            <View style={[styles.liveDot, { backgroundColor: themeColors.success }]} />
            <Text style={[styles.liveText, { color: themeColors.success, fontSize: typography.caption }]}>Live Updates Active</Text>
          </View>

          {/* Success Message */}
          {successMessage && (
            <View style={[styles.successBanner, { backgroundColor: themeColors.success + '1A', borderRadius: radius.sm, marginTop: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
              <Text style={[styles.successBannerText, { color: themeColors.success, fontSize: typography.body }]}>{successMessage}</Text>
            </View>
          )}

          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: themeColors.primary + '12',
                borderColor: themeColors.primary + '2A',
                borderRadius: radius.lg,
                marginTop: spacing.sm,
                paddingTop: spacing.md,
                paddingBottom: spacing.md,
              },
            ]}
          >
            <View style={[styles.headerAccent, { backgroundColor: themeColors.primary }]} />
            <Text style={[styles.headerTitle, { fontSize: typography.h2, color: themeColors.text }]}>Calling Batches</Text>
            <Text style={[styles.headerSubtitle, { fontSize: typography.caption, color: themeColors.textMuted }]}>Central command for all campaigns</Text>
          </View>

          {/* Empty State */}
          {allBatches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="layers-outline" size={36} color={themeColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No batches yet</Text>
              <Text style={styles.emptyText}>
                Import leads from CSV, clipboard, image, or manual entry to create your first batch.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: themeColors.primary,
                    borderRadius: radius.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.xl,
                  },
                  pressed && styles.primaryButtonPressed,
                ]}
                onPress={() => router.push('/upload-leads')}
              >
                <Text style={styles.primaryButtonText}>Import Leads</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Summary Stats */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderRadius: radius.md, padding: spacing.sm }]}> 
                  <Text style={[styles.statValue, { color: themeColors.primary, fontSize: typography.h3 }]}>{allBatches.length}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted, fontSize: typography.caption }]}>Total Batches</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderRadius: radius.md, padding: spacing.sm }]}> 
                  <Text style={[styles.statValue, { color: themeColors.primary, fontSize: typography.h3 }]}>{(allBatches as any[]).filter((b) => b.status === 'draft').length}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted, fontSize: typography.caption }]}>Awaiting Command</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderRadius: radius.md, padding: spacing.sm }]}> 
                  <Text style={[styles.statValue, { color: themeColors.primary, fontSize: typography.h3 }]}>{(allBatches as any[]).filter((b) => b.status === 'running').length}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textMuted, fontSize: typography.caption }]}>Running</Text>
                </View>
              </View>

              {/* Batch Grid */}
              <View style={styles.listContainer}>
                {allBatches.map((batch) => {
                  const leadStats = leadStatsByBatch[batch.batchId];
                  const runningCount = leadStats?.running ?? (batch as Batch).runningCount ?? 0;
                  const completedCount = leadStats?.completed ?? (batch as Batch).completedCount ?? 0;
                  const pendingCount = leadStats?.pending ?? 0;
                  const failedCount = leadStats?.failed ?? (batch as Batch).failedCount ?? 0;
                  const callNowDisabledReason = getCallNowDisabledReason(batch);

                  return (
                  <Pressable
                    key={batch.batchId}
                    style={({ pressed, hovered }) => [
                      styles.batchCard,
                      {
                        width: cardWidth,
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                        borderRadius: radius.lg,
                      },
                      hovered && styles.batchCardHover,
                      pressed && styles.batchCardPressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: '/batch-detail',
                        params: { batchId: batch.batchId },
                      })
                    }
                  >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.sourceEmoji}>{getSourceIcon(batch.source)}</Text>
                        <View style={styles.cardTitleText}>
                          <Text style={[styles.batchId, { color: themeColors.text, fontSize: typography.body }]} numberOfLines={1}>
                            Batch {batch.batchId.substring(0, 8)}
                          </Text>
                          <Text style={[styles.source, { color: themeColors.textMuted, fontSize: typography.overline }]} numberOfLines={1}>
                            {batch.source.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBadgeColor(batch) },
                        ]}
                      >
                        <Text style={styles.statusText} numberOfLines={1}>
                          {batch.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                      <View style={styles.infoRow}>
                        <Ionicons name="call" size={16} color={themeColors.textMuted} />
                        <Text style={[styles.infoText, { color: themeColors.text, fontSize: typography.body }]} numberOfLines={1}>
                          {batch.totalContacts} contact{batch.totalContacts !== 1 ? 's' : ''}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={16} color={themeColors.textMuted} />
                        <Text style={[styles.infoText, { color: themeColors.text, fontSize: typography.body }]} numberOfLines={1}>
                          {formatDate(batch.createdAt)}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="alert-circle" size={16} color={themeColors.textMuted} />
                        <Text style={[styles.infoText, { color: themeColors.text, fontSize: typography.body }]} numberOfLines={1}>
                          {getStatusLabel(batch)}
                        </Text>
                      </View>

                      <View style={styles.countsRow}>
                        <View style={styles.countChip}>
                          <Text style={styles.countValue}>{runningCount}</Text>
                          <Text style={styles.countLabel}>Running</Text>
                        </View>
                        <View style={styles.countChip}>
                          <Text style={styles.countValue}>{completedCount}</Text>
                          <Text style={styles.countLabel}>Completed</Text>
                        </View>
                        <View style={styles.countChip}>
                          <Text style={styles.countValue}>{pendingCount}</Text>
                          <Text style={styles.countLabel}>Pending</Text>
                        </View>
                        <View style={styles.countChip}>
                          <Text style={styles.countValue}>{failedCount}</Text>
                          <Text style={styles.countLabel}>Failed</Text>
                        </View>
                      </View>
                    </View>

                    {/* Card Footer - Action */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerActions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.callNowButton,
                            {
                              backgroundColor: themeColors.primary,
                              borderRadius: radius.sm,
                            },
                            callNowDisabledReason && styles.callNowButtonDisabled,
                            pressed && !callNowDisabledReason && styles.callNowButtonPressed,
                          ]}
                          disabled={!!callNowDisabledReason || startingBatchId === batch.batchId}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            handleCallNow(batch);
                          }}
                        >
                          {startingBatchId === batch.batchId ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="call" size={16} color="#fff" />
                              <Text style={styles.callNowButtonText}>Call Now</Text>
                            </>
                          )}
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.viewButton,
                            {
                              backgroundColor: themeColors.surface,
                              borderRadius: radius.sm,
                            },
                            pressed && styles.viewButtonPressed,
                          ]}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            router.push({
                              pathname: '/batch-detail',
                              params: { batchId: batch.batchId },
                            });
                          }}
                        >
                          <Text style={styles.viewButtonText}>View</Text>
                          <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
                        </Pressable>
                      </View>
                      {callNowDisabledReason && (
                        <Text style={[styles.callNowDisabledReason, { color: themeColors.textMuted, fontSize: typography.overline }]}>
                          {callNowDisabledReason}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showCallConfirmModal}
        title="Call Batch Now"
        message="Review the batch details before starting calls."
        confirmText="Confirm"
        confirmColor={themeColors.success}
        loading={!!(selectedBatchForCall && startingBatchId === selectedBatchForCall.batchId)}
        onCancel={() => {
          setShowCallConfirmModal(false);
          setSelectedBatchForCall(null);
        }}
        onConfirm={async () => {
          if (!selectedBatchForCall) return;
          await executeCallNow(selectedBatchForCall);
        }}
        icon="call"
        summaryItems={
          selectedBatchForCall
            ? [
                { label: 'Batch', value: `#${selectedBatchForCall.batchId.substring(0, 8)}` },
                { label: 'Leads', value: `${selectedBatchForCall.totalContacts}` },
                { label: 'Cost', value: `₹${(selectedBatchForCall.totalContacts * costPerCall).toLocaleString()}` },
              ]
            : []
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
    flexGrow: 1,
  },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(8),
    backgroundColor: '#e8f5e9',
    borderRadius: scale(8),
    marginTop: scale(8),
    gap: scale(6),
  },
  liveDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#4caf50',
  },
  liveText: {
    fontSize: scale(12),
    color: '#2e7d32',
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    marginTop: scale(10),
  },
  successBannerText: {
    color: '#155724',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: scale(14),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: verticalScale(100),
    paddingHorizontal: scale(16),
    gap: scale(12),
  },
  loadingText: {
    fontSize: scale(14),
    color: colors.gray,
    textAlign: 'center',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GRID_GAP,
    marginTop: scale(10),
  },
  skeletonCard: {
    height: verticalScale(140),
    borderRadius: scale(12),
    backgroundColor: '#e6e9ee',
  },
  header: {
    paddingTop: verticalScale(14),
    paddingBottom: scale(14),
    backgroundColor: '#e8f2f6',
    borderRadius: scale(12),
    marginTop: scale(12),
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: '#d3e3ea',
    gap: scale(6),
  },
  headerAccent: {
    width: scale(42),
    height: verticalScale(4),
    borderRadius: scale(999),
  },
  headerTitle: {
    fontSize: scale(isSmallDevice ? 18 : 22),
    fontWeight: '700',
    color: colors.dark,
  },
  headerSubtitle: {
    fontSize: scale(12),
    color: colors.gray,
    marginTop: scale(2),
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    gap: scale(10),
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    minWidth: isTablet ? '30%' : isSmallDevice ? '48%' : '31%',
    backgroundColor: '#fff',
    borderRadius: scale(8),
    padding: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: isSmallDevice ? scale(8) : 0,
  },
  statValue: {
    fontSize: scale(isSmallDevice ? 16 : 20),
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: scale(isSmallDevice ? 10 : 12),
    color: colors.gray,
    marginTop: scale(4),
    textAlign: 'center',
    lineHeight: scale(14),
  },
  emptyContainer: {
    minHeight: height / 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(40),
    gap: scale(10),
  },
  emptyIllustration: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#eaf2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: scale(isSmallDevice ? 16 : 18),
    fontWeight: '600',
    color: colors.dark,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: scale(12),
    color: colors.gray,
    textAlign: 'center',
    lineHeight: scale(18),
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: scale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    minWidth: scale(180),
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: scale(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingBottom: scale(16),
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  batchCardHover: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.08,
  },
  batchCardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexWrap: 'nowrap',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(12),
  },
  cardTitleText: {
    flex: 1,
  },
  sourceEmoji: {
    fontSize: scale(24),
  },
  batchId: {
    fontSize: scale(isSmallDevice ? 12 : 14),
    fontWeight: '600',
    color: colors.dark,
  },
  source: {
    fontSize: scale(isSmallDevice ? 10 : 12),
    color: colors.gray,
    marginTop: scale(2),
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    maxWidth: scale(90),
  },
  statusText: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: 'bold',
  },
  cardBody: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    gap: scale(8),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  infoText: {
    fontSize: scale(isSmallDevice ? 12 : 13),
    color: colors.dark,
    flex: 1,
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    marginTop: scale(4),
  },
  countChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: scale(10),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    minWidth: scale(54),
    alignItems: 'center',
  },
  countValue: {
    fontSize: scale(12),
    fontWeight: '700',
    color: colors.primary,
  },
  countLabel: {
    fontSize: scale(8),
    color: colors.gray,
    marginTop: scale(2),
  },
  cardFooter: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: scale(6),
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  callNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    borderRadius: scale(8),
    backgroundColor: colors.primary,
    minHeight: scale(40),
    flex: 1,
    gap: scale(6),
  },
  callNowButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  callNowButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  callNowButtonText: {
    fontSize: scale(12),
    color: '#fff',
    fontWeight: '700',
  },
  callNowDisabledReason: {
    fontSize: scale(10),
    color: colors.gray,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderRadius: scale(8),
    backgroundColor: '#f1f5f9',
    flex: 1,
    minHeight: scale(40),
    gap: scale(6),
  },
  viewButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  viewButtonText: {
    fontSize: scale(12),
    color: colors.primary,
    fontWeight: '700',
  },
});