import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';

import { useBatchBillingDetailViewModel } from './useBatchBillingDetailViewModel';

export default function BatchBillingDetailScreen() {
  const { colors } = useAppTheme();
  const { batchId } = useLocalSearchParams<{ batchId?: string }>();

  const { loading, error, batch, leads, connectedLeads, failedLeads, computedLeadTotal } =
    useBatchBillingDetailViewModel(batchId);

  const formatCreatedAt = (createdAt: any) => {
    const date = createdAt?.toDate?.();
    if (!date) return 'Pending timestamp';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Batch Billing Detail"
        subtitle={batchId ? `Batch ${batchId.slice(0, 8)}` : 'No batch selected'}
      />

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Connected Leads</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{connectedLeads}</Text>
        </AppCard>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Failed Leads</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{failedLeads}</Text>
        </AppCard>
        <AppCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Final Batch Total</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{(batch?.batchTotalCost ?? 0).toFixed(2)}</Text>
        </AppCard>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading lead billing details...</Text>
        </View>
      )}

      {!loading && error && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.danger }]}>{error}</Text>
        </AppCard>
      )}

      {!loading && !error && leads.length === 0 && (
        <AppCard>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>No leads found for this batch.</Text>
        </AppCard>
      )}

      <View style={styles.list}>
        {leads.map((lead) => (
          <AppCard key={lead.leadId} style={styles.leadCard}>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Phone</Text>
              <Text style={[styles.value, { color: colors.text }]}>{lead.phone}</Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
              <Text style={[styles.value, { color: lead.displayStatus === 'Connected' ? colors.success : colors.textMuted }]}>
                {lead.displayStatus}
              </Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Duration (seconds)</Text>
              <Text style={[styles.value, { color: colors.text }]}>{lead.duration}</Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Minutes Charged</Text>
              <Text style={[styles.value, { color: colors.text }]}>{lead.minutesCharged}</Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Call Cost</Text>
              <Text style={[styles.value, { color: colors.text }]}>₹{lead.callCost.toFixed(2)}</Text>
            </View>
            <View style={styles.leadRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Success Fee</Text>
              <Text style={[styles.value, { color: colors.text }]}>₹{lead.successFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.leadRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Cost</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>₹{lead.uiTotalCost.toFixed(2)}</Text>
            </View>
          </AppCard>
        ))}
      </View>

      {!loading && (
        <AppCard style={styles.footerSummaryCard}>
          <View style={styles.footerSummaryRow}>
            <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Total Connected Leads</Text>
            <Text style={[styles.footerValue, { color: colors.text }]}>{connectedLeads}</Text>
          </View>
          <View style={styles.footerSummaryRow}>
            <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Total Failed Leads</Text>
            <Text style={[styles.footerValue, { color: colors.text }]}>{failedLeads}</Text>
          </View>
          <View style={styles.footerSummaryRow}>
            <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Computed Lead Total</Text>
            <Text style={[styles.footerValue, { color: colors.text }]}>₹{computedLeadTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.footerSummaryRow}>
            <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Final Batch Total</Text>
            <Text style={[styles.footerFinalValue, { color: colors.text }]}>₹{(batch?.batchTotalCost ?? 0).toFixed(2)}</Text>
          </View>
          <Text style={[styles.summaryMeta, { color: colors.textMuted }]}>
            {formatCreatedAt(batch?.completedAt)}
          </Text>
        </AppCard>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 11,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
  },
  list: {
    gap: 10,
  },
  leadCard: {
    gap: 6,
  },
  leadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  metaText: {
    marginTop: 2,
    fontSize: 11,
  },
  footerSummaryCard: {
    marginTop: 8,
    gap: 7,
  },
  footerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerFinalValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
