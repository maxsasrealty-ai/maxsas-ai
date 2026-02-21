import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type SectionHeaderProps = {
  title: string;
  action?: React.ReactNode;
};

export const SectionHeader = ({ title, action }: SectionHeaderProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.sm, marginTop: spacing.xs }]}> 
      <Text style={[styles.title, { color: colors.text, fontSize: typography.body }]}>{title}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
  },
});
