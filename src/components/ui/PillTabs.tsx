import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type PillTab = {
  key: string;
  label: string;
};

type PillTabsProps = {
  tabs: PillTab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
};

export const PillTabs = ({ tabs, activeKey, onChange, style }: PillTabsProps) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}>
            <Text style={[styles.pillText, { color: isActive ? '#FFFFFF' : colors.text }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
