import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PricingConfig } from '@/src/config/pricing';
import { useAppTheme } from '@/src/theme/use-app-theme';

type PricingModalProps = {
  visible: boolean;
  onClose: () => void;
  pricing: PricingConfig;
};

export function PricingModal({ visible, onClose, pricing }: PricingModalProps) {
  const { colors, radius } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.overlayTapArea} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: radius.lg, borderColor: colors.border }]}> 
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={18} color={colors.success} />
              <Text style={[styles.title, { color: colors.text }]}>How billing works</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={[styles.paragraph, { color: colors.textMuted }]}>You pay only for delivered value. Charges are applied only when meaningful outcomes happen.</Text>

          <View style={styles.bulletGroup}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Connected minute billing: {pricing.currencySymbol}{pricing.connectedMinuteRate}/minute</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Qualified lead success fee: {pricing.currencySymbol}{pricing.qualifiedLeadRate}/lead</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Missed calls, unreachable calls, and retries are not charged</Text>
          </View>

          <Text style={[styles.note, { color: colors.textMuted }]}>Qualified lead means a conversation outcome that matches your configured success criteria.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  overlayTapArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 18,
  },
  bulletGroup: {
    gap: 6,
  },
  bullet: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 11,
    lineHeight: 16,
  },
});
