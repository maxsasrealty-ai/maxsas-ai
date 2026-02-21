import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { notifications } from '@/src/data/mock';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer>
      {/* Notifications: concise insights with time context */}
      <AppHeader title="Notifications" subtitle="System updates and AI alerts" />

      <View style={styles.list}>
        {notifications.map((note) => (
          <AppCard key={note.id}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
                <Text style={[styles.body, { color: colors.textMuted }]}>{note.body}</Text>
              </View>
              <Text style={[styles.time, { color: colors.textMuted }]}>{note.time}</Text>
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    marginTop: 4,
    fontSize: 11,
  },
  time: {
    fontSize: 10,
  },
});
