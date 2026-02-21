import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { FloatingActionButton } from '@/src/components/ui/FloatingActionButton';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { useBatch } from '@/src/context/BatchContext';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const tabs = [
  { key: 'all', label: 'All Batches' },
  { key: 'draft', label: 'Draft' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
];

export default function LeadsScreen() {
  const { colors, spacing, radius, typography } = useAppTheme();
  const { allBatches, getAllBatches } = useBatch();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBatches = useCallback(async () => {
    try {
      await getAllBatches();
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getAllBatches]);

  useFocusEffect(
    useCallback(() => {
      fetchBatches();
    }, [fetchBatches])
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') {
      return allBatches;
    }
    return allBatches.filter((batch) => batch.status === activeTab);
  }, [activeTab, allBatches]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'running':
        return 'success';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'csv':
        return '📄';
      case 'image':
        return '📷';
      case 'clipboard':
        return '📋';
      case 'manual':
        return '✍️';
      default:
        return '📱';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScreenContainer scroll={false}>
      <AppHeader title="Batch Dashboard" subtitle="Manage your calling batches" />

      {/* Tab Pills */}
      <View style={[styles.tabContainer, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}> 
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.card,
                  borderColor: activeTab === tab.key ? colors.primary : colors.border,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.key ? '#fff' : colors.text,
                    fontSize: typography.body,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={[styles.list, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBatches();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="layers-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text, fontSize: typography.title }]}>
              {activeTab === 'all' ? 'No batches yet' : `No ${activeTab} batches`}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted, fontSize: typography.body }]}>
              Import contacts to create your first batch
            </Text>
          </View>
        ) : (
          filtered.map((batch, index) => (
            <Pressable
              key={batch.batchId}
              onPress={() =>
                router.push({
                  pathname: '/batch-detail',
                  params: { batchId: batch.batchId },
                })
              }
            >
              <AppCard style={{ marginBottom: index === filtered.length - 1 ? 20 : 14 }}>
                <View style={styles.cardHeader}>
                  <View style={styles.batchInfo}>
                    <View style={styles.batchTitleRow}>
                      <Text style={styles.sourceIcon}>{getSourceIcon(batch.source)}</Text>
                      <Text style={[styles.batchTitle, { color: colors.text, fontSize: typography.title }]}>
                        Batch #{batch.batchId.slice(0, 8)}
                      </Text>
                    </View>
                    <Text style={[styles.meta, { color: colors.textMuted, fontSize: typography.caption }]}>
                      {batch.totalContacts || batch.contacts?.length || 0} contacts • {formatDate(batch.createdAt)}
                    </Text>
                    {'metadata' in batch && batch.metadata?.fileName && (
                      <Text style={[styles.fileName, { color: colors.textMuted, fontSize: typography.overline }]}>
                        📁 {batch.metadata.fileName}
                      </Text>
                    )}
                  </View>
                  <StatusBadge
                    label={batch.status.toUpperCase()}
                    tone={getStatusBadgeColor(batch.status) as any}
                  />
                </View>

                {batch.status === 'scheduled' && batch.scheduleAt && (
                  <View style={[styles.stateInfo, { backgroundColor: colors.info + '20', borderRadius: radius.sm, marginTop: spacing.sm, padding: spacing.xs }]}>
                    <Ionicons name="time-outline" size={16} color={colors.info} />
                    <Text style={[styles.stateInfoText, { color: colors.info, fontSize: typography.caption }]}>
                      Scheduled for {formatDate(batch.scheduleAt)}
                    </Text>
                  </View>
                )}

                {batch.status === 'running' && (
                  <View style={[styles.stateInfo, { backgroundColor: colors.success + '20', borderRadius: radius.sm, marginTop: spacing.sm, padding: spacing.xs }]}>
                    <Ionicons name="call-outline" size={16} color={colors.success} />
                    <Text style={[styles.stateInfoText, { color: colors.success, fontSize: typography.caption }]}>
                      Calling in progress...
                    </Text>
                  </View>
                )}

                {batch.status === 'draft' && (
                  <View style={[styles.stateInfo, { backgroundColor: colors.warning + '20', borderRadius: radius.sm, marginTop: spacing.sm, padding: spacing.xs }]}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
                    <Text style={[styles.stateInfoText, { color: colors.warning, fontSize: typography.caption }]}>
                      Awaiting Command - Tap to configure
                    </Text>
                  </View>
                )}
              </AppCard>
            </Pressable>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => {
          router.push({
            pathname: '/imports',
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
  },
  tabScroll: {
    gap: 8,
  },
  tab: {
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  batchInfo: {
    flex: 1,
  },
  batchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceIcon: {
    fontSize: 20,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
  },
  fileName: {
    marginTop: 4,
    fontSize: 11,
  },
  stateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateInfoText: {
    fontWeight: '600',
  },
});
