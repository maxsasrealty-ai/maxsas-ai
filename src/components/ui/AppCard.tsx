import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type AppCardProps = {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppCard = ({ title, children, style }: AppCardProps) => {
  const { colors, radius, spacing, shadows, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          ...shadows.card,
        },
        style,
      ]}>
      {title ? <Text style={[styles.title, { color: colors.text, fontSize: typography.title, marginBottom: spacing.sm }]}>{title}</Text> : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
});
