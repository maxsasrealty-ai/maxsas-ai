import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../components/ui/AppCard';
import { useWallet } from '../../context/WalletContext';
import { useAppTheme } from '../../theme/use-app-theme';

export function TransactionHistory() {
  const { colors } = useAppTheme();
  const { transactions } = useWallet();

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return { name: 'arrow-down-circle' as const, color: colors.success };
      case 'deduction':
      case 'batch_debit':
        return { name: 'arrow-up-circle' as const, color: colors.danger };
      case 'refund':
        return { name: 'refresh-circle' as const, color: colors.info };
      default:
        return { name: 'help-circle' as const, color: colors.textMuted };
    }
  };

  if (transactions.length === 0) {
    return (
      <AppCard style={styles.emptyCard}>
        <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No transactions yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          Your transaction history will appear here
        </Text>
      </AppCard>
    );
  }

  return (
    <FlatList
      data={transactions}
      scrollEnabled={false}
      keyExtractor={(item) => item.transactionId}
      renderItem={({ item }) => {
        const icon = getTransactionIcon(item.type);
        const isCredit = item.type === 'recharge' || item.type === 'refund';
        
        return (
          <AppCard style={[styles.transactionCard, { borderLeftColor: icon.color }]}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionLeft}>
                <Ionicons name={icon.name} size={24} color={icon.color} />
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionDescription, { color: colors.text }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textMuted }]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: isCredit ? colors.success : colors.danger }
                ]}>
                  {isCredit ? '+' : '-'}₹{item.amount.toLocaleString()}
                </Text>
                <Text style={[styles.transactionBalance, { color: colors.textMuted }]}>
                  Bal: ₹{item.newBalance.toLocaleString()}
                </Text>
              </View>
            </View>
          </AppCard>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
  },
  transactionCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  transactionBalance: {
    fontSize: 10,
  },
});
