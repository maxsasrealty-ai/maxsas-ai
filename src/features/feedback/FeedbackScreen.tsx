import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function FeedbackScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer>
      {/* Feedback: safe space for grievances and trust signals */}
      <AppHeader title="Feedback & Grievance" subtitle="We are listening to improve your workflow" />

      <AppCard>
        <AppInput label="Category" placeholder="Bug, Billing, Feature request" />
        <AppInput label="Message" placeholder="Share what happened..." />
        <AppButton title="Submit Ticket" />
      </AppCard>

      <View style={styles.assurance}>
        <Text style={[styles.assuranceText, { color: colors.textMuted }]}>Average response time: 2-4 hours</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  assurance: {
    marginTop: 14,
    alignItems: 'center',
  },
  assuranceText: {
    fontSize: 11,
  },
});
