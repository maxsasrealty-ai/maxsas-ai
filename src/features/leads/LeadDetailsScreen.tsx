import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { leads } from '@/src/data/mock';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function LeadDetailsScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = leads.find((item) => item.id === id);
  const statusLabel = lead?.aiDisposition || lead?.callStatus || lead?.status;

  if (!lead) {
    return (
      <ScreenContainer scroll={false}>
        <Text style={{ color: colors.text }}>Lead not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Lead detail: high-context view for decision making */}
      <AppHeader title={lead.name} subtitle={lead.interest} />

      <AppCard>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
          <StatusBadge
            label={statusLabel?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
            tone={
              lead.status === 'completed'
                ? 'success'
                : lead.aiDisposition === 'not_interested'
                  ? 'danger'
                  : lead.aiDisposition === 'interested' || lead.callStatus === 'answered'
                    ? 'warning'
                    : 'info'
            }
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Phone</Text>
          <Text style={[styles.value, { color: colors.text }]}>{lead.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <Text style={[styles.value, { color: colors.text }]}>{lead.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Budget</Text>
          <Text style={[styles.value, { color: colors.text }]}>{lead.budget}</Text>
        </View>
      </AppCard>

      <AppCard title="Next best actions">
        <Text style={[styles.actionHint, { color: colors.textMuted }]}>
          Prioritize AI outreach and update status after first call.
        </Text>
        <View style={styles.actionGroup}>
          <AppButton title="Start AI Call" />
          <AppButton title="Send Follow-up" variant="secondary" />
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
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionHint: {
    fontSize: 11,
    marginBottom: 12,
  },
  actionGroup: {
    gap: 10,
  },
});
