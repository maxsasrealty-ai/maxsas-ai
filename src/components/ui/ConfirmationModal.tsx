import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type SummaryItem = {
  label: string;
  value: string;
};

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  icon?: string;
  summaryItems?: SummaryItem[];
}

/**
 * Cross-platform confirmation modal that works on web and mobile
 * Replaces Alert.alert for better reliability on web platform
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmColor = '#4caf50',
  loading = false,
  onCancel,
  onConfirm,
  icon = 'help-circle',
  summaryItems,
}) => {
  const { colors, radius, spacing, typography, shadows } = useAppTheme();

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in confirmation handler:', error);
      throw error;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}> 
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderColor: colors.border,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              ...shadows.card,
            },
          ]}>
          <View style={[styles.iconContainer, { marginBottom: spacing.xs }]}> 
            <Ionicons name={icon as any} size={28} color={confirmColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text, fontSize: typography.body }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textMuted, fontSize: typography.caption }]}>{message}</Text>

          {summaryItems && summaryItems.length > 0 ? (
            <View style={[styles.summaryCard, { borderColor: colors.border, borderRadius: radius.md, marginBottom: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }]}> 
              {summaryItems.map((item) => (
                <View key={item.label} style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted, fontSize: typography.caption }]}>{item.label}</Text>
                  <Text style={[styles.summaryValue, { color: colors.text, fontSize: typography.body }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Buttons */}
          <View style={[styles.buttonContainer, { gap: spacing.xs }]}> 
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textMuted, fontSize: typography.body }]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { borderRadius: radius.md, backgroundColor: confirmColor, borderColor: confirmColor }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[styles.confirmButtonText, { fontSize: typography.body }]}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 240,
    maxWidth: 360,
    width: '88%',
  },
  iconContainer: {},
  title: {
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 16,
  },
  summaryCard: {
    width: '100%',
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  confirmButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});
