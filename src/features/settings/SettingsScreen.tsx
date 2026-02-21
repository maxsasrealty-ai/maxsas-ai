import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer>
      {/* Settings: preference control for personalization */}
      <AppHeader title="Settings" subtitle="Personalize your workspace" />

      <AppCard>
        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Sync with device theme</Text>
          </View>
          <Switch value={isDark} onValueChange={() => {}} />
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>AI alerts and lead updates</Text>
          </View>
          <Switch value onValueChange={() => {}} />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
  },
});
