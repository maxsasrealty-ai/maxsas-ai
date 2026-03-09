import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type PolicySection = {
  title: string;
  points: string[];
};

type PolicyScreenProps = {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: PolicySection[];
  footerNote?: ReactNode;
};

export default function PolicyScreen({
  title,
  effectiveDate,
  intro,
  sections,
  footerNote,
}: PolicyScreenProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>Effective date: {effectiveDate}</Text>
        <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            {section.points.map((point) => (
              <Text key={point} style={[styles.point, { color: colors.text }]}>
                {'\u2022'} {point}
              </Text>
            ))}
          </View>
        ))}

        {footerNote ? <View style={styles.footerNote}>{footerNote}</View> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    opacity: 0.95,
  },
  section: {
    marginTop: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  point: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.92,
  },
  footerNote: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#7A8798',
  },
});
