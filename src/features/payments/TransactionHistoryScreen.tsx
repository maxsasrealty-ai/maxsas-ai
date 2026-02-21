import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getBalanceHistoryTransactions, LedgerTransaction } from '@/src/services/ledgerService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function TransactionHistoryScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.uid) {
        if (mounted) {
          setTransactions([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getBalanceHistoryTransactions(user.uid, 100);
        if (mounted) {
          setTransactions(result);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load history');
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

  const totalDebits = useMemo(
    () => transactions.filter((item) => item.type === 'batch_debit').reduce((sum, item) => sum + item.amount, 0),
    [transactions]
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

  const getLabel = (type: LedgerTransaction['type']) => {
    if (type === 'batch_debit') return 'Batch Debit';
    if (type === 'lead_debit') return 'Lead Usage';
    return 'Recharge';
  };

  return (
    <ScreenContainer>
      <AppHeader title="Transaction History" subtitle="View all wallet activity" />

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Transactions</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{transactions.length}</Text>
        </AppCard>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Debited</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totalDebits.toFixed(2)}</Text>
        </AppCard>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading transaction history...</Text>
        </View>
      )}

      {!loading && error && (
        <AppCard>
          <Text style={[styles.meta, { color: colors.danger }]}>{error}</Text>
        </AppCard>
      )}

      {!loading && !error && transactions.length === 0 && (
        <AppCard>
          <Text style={[styles.meta, { color: colors.textMuted }]}>No ledger transactions yet.</Text>
        </AppCard>
      )}

      <View style={styles.list}>
        {transactions.map((transaction) => (
          <AppCard key={transaction.transactionId} style={styles.card}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{getLabel(transaction.type)}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{formatCreatedAt(transaction.createdAt)}</Text>
              {!!transaction.batchId && (
                <Text style={[styles.meta, { color: colors.textMuted }]}>Batch: {transaction.batchId.slice(0, 8)}</Text>
              )}
            </View>
            <Text
              style={[
                styles.amount,
                {
                  color: transaction.type === 'recharge' ? colors.success : colors.danger,
                },
              ]}
            >
              {transaction.type === 'recharge' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
            </Text>
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
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    marginTop: 2,
    fontSize: 11,
  },
  amount: {
    fontSize: 13,
    fontWeight: '800',
  },
});
