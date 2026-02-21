import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getBatchLeadDebitTransactions, LedgerTransaction } from '@/src/services/ledgerService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function BatchBillingDetailScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { batchId } = useLocalSearchParams<{ batchId?: string }>();

  const [items, setItems] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.uid || !batchId) {
        if (mounted) {
          setLoading(false);
          setItems([]);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getBatchLeadDebitTransactions(user.uid, batchId);
        if (mounted) {
          setItems(result);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load batch billing details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [batchId, user?.uid]);

  const totals = useMemo(() => {
    const amount = items.reduce((sum, entry) => sum + entry.amount, 0);
    const minutes = items.reduce((sum, entry) => sum + entry.minutesCharged, 0);
    return { amount, minutes };
  }, [items]);

  const formatCreatedAt = (createdAt: any) => {
    const date = createdAt?.toDate?.();
    if (!date) return 'Pending timestamp';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Batch Billing Detail"
        subtitle={batchId ? `Batch ${batchId.slice(0, 8)}` : 'No batch selected'}
      />

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Lead Debits</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{items.length}</Text>
        </AppCard>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Batch Total</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totals.amount.toFixed(2)}</Text>
          <Text style={[styles.summaryMeta, { color: colors.textMuted }]}>{totals.minutes} min billed</Text>
        </AppCard>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading lead-level debits...</Text>
        </View>
      )}

      {!loading && error && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.danger }]}>{error}</Text>
        </AppCard>
      )}

      {!loading && !error && items.length === 0 && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>No lead debit records found for this batch.</Text>
        </AppCard>
      )}

      <View style={styles.list}>
        {items.map((entry) => (
          <AppCard key={entry.transactionId} style={styles.rowCard}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Lead {entry.leadId?.slice(0, 8) || 'N/A'}</Text>
              <Text style={[styles.metaText, { color: colors.textMuted }]}>{formatCreatedAt(entry.createdAt)}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowAmount, { color: colors.danger }]}>-₹{entry.amount.toFixed(2)}</Text>
              <Text style={[styles.metaText, { color: colors.textMuted }]}>{entry.minutesCharged} min</Text>
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 11,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
  },
  list: {
    gap: 10,
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  metaText: {
    marginTop: 2,
    fontSize: 11,
  },
});
