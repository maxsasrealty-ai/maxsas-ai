import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { subscribeToUserNotifications, UserNotification } from '@/src/services/notificationService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { router } from 'expo-router';

const typeLabel: Record<UserNotification['type'], string> = {
  batch_completed: 'Campaign',
  qualified_lead: 'Lead',
  manual_retry_required: 'Retry',
  wallet_low: 'Wallet',
  wallet_recharge_success: 'Wallet',
  billing_transaction: 'Billing',
  ai_insight: 'Insight',
};

const formatTimeAgo = (date: Date | null): string => {
  if (!date) return 'just now';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
};

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserNotifications(user.uid, (notifications) => {
      setItems(notifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <ScreenContainer>
      <AppHeader title="Alerts" subtitle="Positive updates and actions from your AI campaigns" />

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading alerts...</Text>
        </View>
      )}

      {!loading && items.length === 0 && (
        <AppCard>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No alerts yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>Run your campaigns to see lead wins, wallet updates, and AI insights here.</Text>
        </AppCard>
      )}

      <View style={styles.list}>
        {items.map((note) => (
          <AppCard key={note.id}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <View style={styles.titleRow}>
                  <Text style={[styles.typePill, { color: colors.primary, borderColor: colors.border }]}>{typeLabel[note.type]}</Text>
                  <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
                </View>
                <Text style={[styles.body, { color: colors.textMuted }]}>{note.body}</Text>
                {note.ctaRoute && note.ctaLabel ? (
                  <Pressable
                    onPress={() => router.push(note.ctaRoute as never)}
                    style={[styles.actionButton, { borderColor: colors.primary }]}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>{note.ctaLabel}</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={[styles.time, { color: colors.textMuted }]}>{formatTimeAgo(note.eventAt || note.createdAt)}</Text>
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBody: {
    marginTop: 6,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: '700',
    overflow: 'hidden',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    marginTop: 4,
    fontSize: 11,
  },
  actionButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
  },
});
