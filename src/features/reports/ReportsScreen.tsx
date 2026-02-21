import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppSection } from '@/src/components/ui/AppSection';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { weeklyReports } from '@/src/data/mock';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function ReportsScreen() {
  const { colors } = useAppTheme();
  const maxValue = Math.max(...weeklyReports.map((item) => item.value));

  return (
    <ScreenContainer>
      {/* Reports: visual trend clarity with lightweight charting */}
      <AppHeader title="Weekly Reports" subtitle="Lead engagement over the last 7 days" />

      <AppCard>
        <AppSection title="Engagement Trend" />
        <View style={styles.chartRow}>
          {weeklyReports.map((item) => (
            <View key={item.day} style={styles.chartItem}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{item.day}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title="Insights">
        <Text style={[styles.insight, { color: colors.textMuted }]}>• Conversions peaked on Thursday.</Text>
        <Text style={[styles.insight, { color: colors.textMuted }]}>• Weekend interest is trending upward.</Text>
        <Text style={[styles.insight, { color: colors.textMuted }]}>• AI follow-ups drove +18% engagement.</Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginTop: 20,
  },
  chartItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '12%',
    height: '100%',
  },
  chartBar: {
    width: 10,
    borderRadius: 6,
  },
  chartLabel: {
    marginTop: 8,
    fontSize: 10,
  },
  insight: {
    fontSize: 11,
    marginBottom: 6,
  },
});
