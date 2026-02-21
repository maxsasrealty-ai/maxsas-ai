import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type FeatureComingSoonModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  footnote?: string;
  buttonText?: string;
};

export function FeatureComingSoonModal({
  visible,
  onClose,
  title,
  message,
  footnote,
  buttonText = 'Got it',
}: FeatureComingSoonModalProps) {
  const { colors, radius } = useAppTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdropTapArea} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          {!!footnote && <Text style={[styles.footnote, { color: colors.textMuted }]}>{footnote}</Text>}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  backdropTapArea: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    width: '100%',
    maxWidth: 620,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  footnote: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
  },
  button: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
