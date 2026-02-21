import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type StatusBadgeProps = {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
};

export const StatusBadge = ({ label, tone = 'info' }: StatusBadgeProps) => {
  const { colors } = useAppTheme();

  const toneStyles = {
    success: { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: colors.success },
    warning: { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: colors.warning },
    danger: { backgroundColor: 'rgba(244, 63, 94, 0.15)', color: colors.danger },
    info: { backgroundColor: 'rgba(56, 189, 248, 0.15)', color: colors.info },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyles.backgroundColor }]}> 
      <Text style={[styles.text, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
});
