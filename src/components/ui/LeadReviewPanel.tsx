import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';

type LeadPreview = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  interest?: string;
  budget?: string;
  attachment?: {
    name?: string;
    uri?: string;
    size?: number;
    mimeType?: string;
  };
};

type LeadReviewPanelProps = {
  leads: LeadPreview[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  onRemoveLead?: (id: string) => void;
};

export const LeadReviewPanel = ({ leads, onConfirm, onCancel, loading, onRemoveLead }: LeadReviewPanelProps) => {
  const { colors } = useAppTheme();

  const countLabel = useMemo(() => `${leads.length} contact${leads.length === 1 ? '' : 's'}`, [leads.length]);

  return (
    <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>Review Contacts ({countLabel})</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Verify contacts before creating batch</Text>

      <View style={styles.listContainer}>
        <ScrollView style={styles.list} nestedScrollEnabled>
          {leads.map((lead, index) => (
            <View key={lead.id || `${index}`}>
              <AppCard style={styles.leadCard}>
                <View style={styles.leadContent}>
                  {lead.name && <Text style={[styles.name, { color: colors.text }]}>{lead.name}</Text>}
                  {!!lead.phone && <Text style={[styles.name, { color: colors.text }]}>{lead.phone}</Text>}
                  {!!lead.email && <Text style={[styles.meta, { color: colors.textMuted }]}>{lead.email}</Text>}
                  {!!lead.interest && <Text style={[styles.meta, { color: colors.textMuted }]}>{lead.interest}</Text>}
                  {!!lead.budget && <Text style={[styles.meta, { color: colors.textMuted }]}>{lead.budget}</Text>}
                  {!!lead.attachment?.name && (
                    <Text style={[styles.meta, { color: colors.textMuted }]}>📎 {lead.attachment.name}</Text>
                  )}
                </View>
                {onRemoveLead && lead.id && (
                  <Pressable
                    onPress={() => onRemoveLead(lead.id!)}
                    style={[styles.removeButton, { backgroundColor: colors.danger }]}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </Pressable>
                )}
              </AppCard>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <AppButton 
          title={`✓ Create Batch (${leads.length})`} 
          onPress={onConfirm} 
          loading={loading} 
        />
        <View style={styles.actionGap} />
        <AppButton title="Cancel" onPress={onCancel} variant="ghost" disabled={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
  },
  listContainer: {
    marginBottom: 16,
    maxHeight: 340,
  },
  list: {
    flex: 1,
  },
  leadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadContent: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  schedulingContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  schedulingText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  schedulingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  schedulingButton: {
    flex: 1,
  },
  scheduleSection: {
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleInput: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionGap: {
    width: 10,
  },
});
