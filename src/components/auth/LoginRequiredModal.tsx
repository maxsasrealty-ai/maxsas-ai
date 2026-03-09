import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({ visible, onClose }: Props) {
  const { colors, radius } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}> 
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Login Required</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Please login to use this feature</Text>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onClose();
              router.push('/login');
            }}
          >
            <Text style={styles.actionButtonText}>Login</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => {
              onClose();
              router.push('/signup');
            }}
          >
            <Text style={[styles.secondaryActionText, { color: colors.text }]}>Signup</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 18,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 6,
    alignSelf: 'center',
    padding: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
