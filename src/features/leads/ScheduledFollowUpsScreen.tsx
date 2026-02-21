/**
 * PHASE 3: Scheduled Follow-ups Screen
 * Shows all leads with scheduled follow-ups, sorted by date
 */

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { Lead } from '@/src/lib/leadSchema';
import { getScheduledFollowUps, updateLeadStatus } from '@/src/lib/leadService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ScheduledFollowUpsScreen() {
  const { colors } = useAppTheme();
  const [followUps, setFollowUps] = useState<(Lead & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFollowUps = useCallback(async () => {
    try {
      const data = await getScheduledFollowUps();
      setFollowUps(data);
    } catch (error) {
      console.error('Error loading scheduled follow-ups:', error);
      Alert.alert('Error', 'Failed to load scheduled follow-ups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  useFocusEffect(
    useCallback(() => {
      loadFollowUps();
    }, [loadFollowUps])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFollowUps();
  };

  const handleMarkCompleted = async (leadId: string, phone: string) => {
    Alert.alert('Mark as Completed', 'Has the follow-up been completed?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Yes, Mark Completed',
        onPress: async () => {
          try {
            await updateLeadStatus(leadId, 'completed', 'Follow-up completed');
            Alert.alert('Success', 'Lead marked as completed');
            loadFollowUps();
          } catch (error) {
            console.error('Failed to update lead:', error);
            Alert.alert('Error', 'Failed to update lead');
          }
        },
      },
    ]);
  };

  const handleMarkInterested = async (leadId: string) => {
    Alert.alert('Mark as Interested', 'Did the lead show interest?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Yes, Mark Interested',
        onPress: async () => {
          try {
            await updateLeadStatus(
              leadId,
              'completed',
              'Lead expressed interest during follow-up',
              'interested',
              'answered'
            );
            Alert.alert('Success', 'Lead marked as interested');
            loadFollowUps();
          } catch (error) {
            console.error('Failed to update lead:', error);
            Alert.alert('Error', 'Failed to update lead');
          }
        },
      },
    ]);
  };

  const getTimeStatus = (scheduleDate: any) => {
    if (!scheduleDate) return 'No date';

    const scheduled = new Date(scheduleDate.seconds * 1000);
    const now = new Date();
    const diffMs = scheduled.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return `⏰ ${Math.abs(diffMins)} mins overdue`;
    if (diffMins === 0) return '🔴 Due now!';
    if (diffMins < 60) return `⏱ ${diffMins} mins left`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `⏱ ${diffHours} hours left`;

    const diffDays = Math.floor(diffHours / 24);
    return `📅 ${diffDays} days left`;
  };

  const getDateTimeString = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Scheduled Follow-ups" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading follow-ups...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (followUps.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Scheduled Follow-ups" />
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No scheduled follow-ups</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Schedule follow-ups from the leads dashboard
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Scheduled Follow-ups"
        subtitle={`${followUps.length} follow-up${followUps.length !== 1 ? 's' : ''} scheduled`}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {followUps.map((lead, index) => (
          <AppCard
            key={lead.id}
            style={{
              marginBottom: index === followUps.length - 1 ? 20 : 12,
            }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerContent}>
                <Text style={[styles.phone, { color: colors.text }]}>{lead.phone}</Text>
                <Text style={[styles.source, { color: colors.textMuted }]}>
                  📌 {lead.source} • {getTimeStatus(lead.scheduleAt)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Scheduled:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {getDateTimeString(lead.scheduleAt)}
                </Text>
              </View>

              {lead.followUpNotes && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Notes:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
                    {lead.followUpNotes}
                  </Text>
                </View>
              )}

              {lead.notes && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                    {(lead.aiDisposition || lead.callStatus || lead.status).replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                onPress={() => handleMarkInterested(lead.id)}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.actionText, { color: colors.success }]}>Interested</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
                onPress={() => handleMarkCompleted(lead.id, lead.phone)}
              >
                <Ionicons name="checkmark-done" size={16} color={colors.info} />
                <Text style={[styles.actionText, { color: colors.info }]}>Completed</Text>
              </Pressable>
            </View>
          </AppCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  cardHeader: {
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'column',
  },
  phone: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
  },
  detailsSection: {
    marginVertical: 12,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 0.35,
  },
  detailValue: {
    fontSize: 12,
    flex: 0.65,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
