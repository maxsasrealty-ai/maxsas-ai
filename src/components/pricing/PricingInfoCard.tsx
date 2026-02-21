import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRICING_VALUE_LINES } from '@/src/config/pricing';
import { usePricing } from '@/src/hooks/usePricing';
import { useAppTheme } from '@/src/theme/use-app-theme';

type PricingInfoCardProps = {
  initiallyExpanded?: boolean;
  compact?: boolean;
  onPressDetails?: () => void;
};

export function PricingInfoCard({ initiallyExpanded = false, compact = false, onPressDetails }: PricingInfoCardProps) {
  const { colors, radius } = useAppTheme();
  const { pricing } = usePricing();
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const displayLines = compact ? PRICING_VALUE_LINES.slice(0, 3) : PRICING_VALUE_LINES;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={[styles.title, { color: colors.text }]}>Transparent Pricing</Text>
        </View>
      </View>

      <View style={styles.bulletsGroup}>
        {displayLines.map((line) => (
          <Text key={line} style={[styles.bulletText, { color: colors.text }]}>• {line}</Text>
        ))}
      </View>

      <Pressable onPress={() => setExpanded((prev) => !prev)} style={styles.expanderRow}>
        <Text style={[styles.expanderLabel, { color: colors.success }]}>
          {expanded ? 'Hide detailed rates' : 'View detailed rates'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.success}
        />
      </Pressable>

      {expanded && (
        <View style={[styles.detailsBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.detailRate, { color: colors.textMuted }]}>{pricing.currencySymbol}{pricing.connectedMinuteRate} per connected minute</Text>
          <Text style={[styles.detailRate, { color: colors.textMuted }]}>{pricing.currencySymbol}{pricing.qualifiedLeadRate} per qualified lead</Text>
          {!!onPressDetails && (
            <Pressable onPress={onPressDetails} style={styles.learnMoreRow}>
              <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
              <Text style={[styles.learnMoreText, { color: colors.primary }]}>Pricing details</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  bulletsGroup: {
    gap: 4,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  expanderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  expanderLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  detailRate: {
    fontSize: 11,
    fontWeight: '600',
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  learnMoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
