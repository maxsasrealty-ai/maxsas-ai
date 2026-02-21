import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useWallet } from '../../context/WalletContext';
import { useAppTheme } from '../../theme/use-app-theme';

interface RechargeButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export function RechargeButton({ variant = 'primary', size = 'medium' }: RechargeButtonProps) {
  const { colors } = useAppTheme();
  const { addBalanceToWallet } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000];

  const handleRecharge = async (amount: number) => {
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setRecharging(true);
    try {
      const result = await addBalanceToWallet(amount);
      if (result.success) {
        Alert.alert('Success', `₹${amount} added to your wallet!`);
        setRechargeAmount('');
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.errorMessage || 'Failed to add balance');
      }
    } finally {
      setRecharging(false);
    }
  };

  const getButtonStyle = (): (ViewStyle | object)[] => {
    const base: (ViewStyle | object)[] = [styles.button];
    
    if (variant === 'primary') {
      base.push({ backgroundColor: colors.primary } as ViewStyle);
    } else if (variant === 'secondary') {
      base.push({ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border } as ViewStyle);
    } else {
      base.push({ backgroundColor: 'transparent' } as ViewStyle);
    }

    if (size === 'small') {
      base.push(styles.buttonSmall);
    } else if (size === 'large') {
      base.push(styles.buttonLarge);
    }

    return base;
  };

  const getTextColor = () => {
    if (variant === 'primary') return 'white';
    return colors.primary;
  };

  return (
    <>
      <TouchableOpacity 
        style={getButtonStyle()}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons 
          name="add-circle" 
          size={size === 'small' ? 16 : 20} 
          color={getTextColor()} 
        />
        <Text style={[
          styles.buttonText, 
          { color: getTextColor() },
          size === 'small' && styles.buttonTextSmall,
          size === 'large' && styles.buttonTextLarge,
        ]}>
          Recharge
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Balance</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text }]}>Quick Amounts</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountButton, { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                  }]}
                  onPress={() => handleRecharge(amount)}
                  disabled={recharging}
                >
                  <Text style={[styles.quickAmountText, { color: colors.primary }]}>
                    ₹{amount}
                  </Text>
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
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  buttonTextLarge: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
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
    marginBottom: 20,
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
});
