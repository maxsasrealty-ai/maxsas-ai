import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

export const AIAvatar = () => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.glow, { backgroundColor: colors.avatarGlow }]}>
      <View style={[styles.ring, { borderColor: colors.primary, backgroundColor: colors.primary }]}> 
        <Text style={styles.text}>M</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.dot, { backgroundColor: colors.success }]} />
        <Text style={[styles.badgeText, { color: colors.text }]}>MAXSAS AI</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  ring: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 44,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
