import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  actions: ActionItem[];
  onActionPress: (id: string) => void;
};

export const ActionSheet = ({ visible, onClose, actions, onActionPress }: ActionSheetProps) => {
  const { colors } = useAppTheme();
  const translateY = useRef(new Animated.Value(300)).current;

  const animatedIn = useMemo(
    () =>
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    [translateY]
  );

  const animatedOut = useMemo(
    () =>
      Animated.timing(translateY, {
        toValue: 320,
        duration: 180,
        useNativeDriver: true,
      }),
    [translateY]
  );

  useEffect(() => {
    if (visible) {
      animatedIn.start();
    } else {
      animatedOut.start();
    }
  }, [animatedIn, animatedOut, visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, borderColor: colors.border, transform: [{ translateY }] },
        ]}>
        <View style={styles.handle} />
        <Text style={[styles.title, { color: colors.text }]}>What would you like to do?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose a lead intake flow</Text>

        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.id}
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => onActionPress(action.id)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#CBD5F5',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },
});
