import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PricingModal } from '../../components/pricing/PricingModal';
import { AppCard } from '../../components/ui/AppCard';
import { AppSection } from '../../components/ui/AppSection';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useWallet } from '../../context/WalletContext';
import { usePricing } from '../../hooks/usePricing';
import { addTestBalance } from '../../services/walletService';
import { useAppTheme } from '../../theme/use-app-theme';
import { TransactionHistory } from './';

export default function WalletScreen() {
  const { colors } = useAppTheme();
  const { pricing } = usePricing();
  const { wallet, availableBalance, loading, transactions, addBalanceToWallet } = useWallet();
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const isDev = __DEV__;

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const lastDeduction = transactions
    .filter((txn) => txn.type === 'deduction' || txn.type === 'batch_debit')
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];

  const recentTransactions = transactions.slice(0, 5);

  const formatTransactionTime = (timestamp?: { toDate?: () => Date }) => {
    const date = timestamp?.toDate?.();
    if (!date) return 'Just now';

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

  const handleRecharge = async (amount: number) => {
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setRecharging(true);
    const result = await addBalanceToWallet(amount);
    setRecharging(false);

    if (!result.success) {
      const message = result.errorMessage || 'Unable to start recharge flow.';
      if (message.toLowerCase().includes('cancel')) {
        Alert.alert('Payment Cancelled', message);
      } else {
        Alert.alert('Recharge Failed', message);
      }
      return;
    }

    setPaymentProcessing(true);
    setRechargeAmount('');
    Alert.alert(
      'Payment processing...',
      'We received your payment response. Wallet balance will update after webhook verification.'
    );
    setTimeout(() => setPaymentProcessing(false), 8000);
  };

  const handleAddTestBalance = async (amount: number) => {
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setRecharging(true);
    const result = await addTestBalance(amount);
    setRecharging(false);

    if (!result.success) {
      Alert.alert('Recharge Failed', result.errorMessage || 'Failed to add test balance');
      return;
    }

    Alert.alert('Success', `Added ₹${amount} to wallet.`);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading wallet...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!wallet) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            Failed to load wallet
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <AppSection title="Current Balance" />
        <AppCard style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={32} color="white" />
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
            
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity style={styles.pricingInfoButton} onPress={() => setShowPricingModal(true)}>
              <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.85)" />
              <Text style={styles.pricingInfoText}>Pricing Info</Text>
            </TouchableOpacity>
            <Text style={styles.balanceAmount}>₹{availableBalance.toLocaleString()}</Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Total Balance</Text>
                <Text style={styles.balanceDetailValue}>₹{wallet.balance.toLocaleString()}</Text>
              </View>
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Locked Balance</Text>
                <Text style={styles.balanceDetailValue}>₹{wallet.lockedAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Available Balance</Text>
                <Text style={styles.balanceDetailValue}>₹{availableBalance.toLocaleString()}</Text>
              </View>
            </View>
          </AppCard>

        {/* Statistics */}
        <AppSection title="Wallet Statistics" />
          <View style={styles.statsGrid}>
            <AppCard style={[styles.statCard, { borderColor: colors.border }]}>
              <Ionicons name="arrow-down" size={24} color={colors.danger} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                ₹{wallet.totalSpent.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Spent</Text>
            </AppCard>
            
            <AppCard style={[styles.statCard, { borderColor: colors.border }]}>
              <Ionicons name="arrow-up" size={24} color={colors.success} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                ₹{wallet.totalRecharged.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Recharged</Text>
            </AppCard>

            <AppCard style={[styles.statCard, { borderColor: colors.border }]}>
              <Ionicons name="card" size={24} color={colors.info} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                ₹{lastDeduction?.amount?.toLocaleString() || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Last Deduction</Text>
            </AppCard>
          </View>

        {isDev && (
          <>
            <AppSection title="TEST MODE ACTIONS" />
            <AppCard>
              <View style={styles.testActionsRow}>
                {[200, 500, 1000].map((amount) => (
                  <TouchableOpacity
                    key={`test-${amount}`}
                    style={[styles.testActionButton, { borderColor: colors.border }]}
                    onPress={() => handleAddTestBalance(amount)}
                    disabled={recharging}
                  >
                    <Text style={[styles.testActionText, { color: colors.primary }]}>+ Add ₹{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AppCard>
          </>
        )}

        {/* Recharge Section */}
        <AppSection title="Add Balance" />
        <AppCard>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Quick Recharge</Text>
          <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                key={amount}
                style={[styles.quickAmountButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleRecharge(amount)}
                disabled={recharging}
              >
                <Text style={[styles.quickAmountText, { color: colors.primary }]}>₹{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Custom Amount</Text>
          <View style={styles.customRechargeRow}>
            <TextInput
              style={[styles.amountInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
              editable={!recharging}
            />
            <TouchableOpacity
              style={[
                styles.rechargeButton,
                { backgroundColor: colors.primary },
                recharging && styles.rechargeButtonDisabled,
              ]}
              onPress={() => {
                const amount = parseInt(rechargeAmount, 10);
                if (!isNaN(amount)) {
                  handleRecharge(amount);
                }
              }}
              disabled={recharging || !rechargeAmount}
            >
              {recharging ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.rechargeButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
          {paymentProcessing && (
            <Text style={[styles.processingText, { color: colors.info }]}>
              Payment processing... Wallet will update after Razorpay webhook settlement.
            </Text>
          )}
          {Platform.OS !== 'web' && (
            <Text style={[styles.processingText, { color: colors.textMuted }]}>
              Web checkout flow is enabled for Razorpay test payments.
            </Text>
          )}
        </AppCard>

        {/* Transaction History */}
        <AppSection title="Recent Transactions" />
        <AppCard>
          {recentTransactions.length === 0 ? (
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              No recent transactions.
            </Text>
          ) : (
            recentTransactions.map((transaction) => {
              const isCredit = transaction.type === 'recharge' || transaction.type === 'refund';
              const sign = isCredit ? '+' : '-';
              const color = isCredit ? colors.success : colors.danger;

              return (
                <View key={transaction.transactionId} style={styles.recentRow}>
                  <View style={styles.recentLeft}>
                    <Text style={[styles.recentDescription, { color: colors.text }]} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.recentTime, { color: colors.textMuted }]}>
                      {formatTransactionTime(transaction.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, { color }]}>
                    {sign}₹{transaction.amount.toLocaleString()}
                  </Text>
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.historyLinkButton, { borderColor: colors.border }]}
            onPress={() => router.push('/payment-history')}
          >
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
            <Text style={[styles.historyLinkText, { color: colors.primary }]}>View Full Balance History</Text>
          </TouchableOpacity>
        </AppCard>

        <AppSection title="Transaction History" />
        <TransactionHistory />

        <PricingModal
          visible={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          pricing={pricing}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  balanceCard: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
  },
  liveText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  pricingInfoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pricingInfoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginTop: 4,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  balanceDetailItem: {
    flex: 1,
    minWidth: 120,
  },
  balanceDetailLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  balanceDetailValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  recentLeft: {
    flex: 1,
    marginRight: 12,
  },
  recentDescription: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentTime: {
    fontSize: 10,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyLinkButton: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testBalanceButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testBalanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  testActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testActionButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 110,
  },
  testActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickAmountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  customRechargeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  rechargeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  rechargeButtonDisabled: {
    opacity: 0.5,
  },
  rechargeButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  processingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
});
