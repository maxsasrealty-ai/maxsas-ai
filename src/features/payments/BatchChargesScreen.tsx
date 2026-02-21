import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getBatchDebitTransactions, LedgerTransaction } from '@/src/services/ledgerService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function BatchChargesScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const [batchDebits, setBatchDebits] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.uid) {
        if (mounted) {
          setBatchDebits([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getBatchDebitTransactions(user.uid, 200);
        if (mounted) {
          setBatchDebits(result);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load batch charges');
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
  }, [user?.uid]);

  const totalBatchCharges = useMemo(
    () => batchDebits.reduce((sum, row) => sum + row.amount, 0),
    [batchDebits]
  );

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
      <AppHeader title="Batch Charges" subtitle="Per batch billing details" />

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Charged Batches</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{batchDebits.length}</Text>
        </AppCard>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Charges</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totalBatchCharges.toFixed(2)}</Text>
        </AppCard>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>Loading batch charges...</Text>
        </View>
      )}

      {!loading && error && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.danger }]}>{error}</Text>
        </AppCard>
      )}

      {!loading && !error && batchDebits.length === 0 && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>No batch charges found.</Text>
        </AppCard>
      )}

      <View style={styles.list}>
        {batchDebits.map((entry) => (
          <Pressable
            key={entry.transactionId}
            onPress={() =>
              entry.batchId && router.push({ pathname: '/batch-detail', params: { batchId: entry.batchId } })
            }
          >
            <AppCard style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Batch {entry.batchId?.slice(0, 8) || 'N/A'}</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{formatCreatedAt(entry.createdAt)}</Text>
                <Text style={[styles.tapHint, { color: colors.primary }]}>Tap to view batch detail</Text>
              </View>
              <Text style={[styles.rowAmount, { color: colors.danger }]}>-₹{entry.amount.toFixed(2)}</Text>
            </AppCard>
          </Pressable>
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  tapHint: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
