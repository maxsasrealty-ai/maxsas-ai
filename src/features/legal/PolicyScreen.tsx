
import { useAppTheme } from '@/src/theme/use-app-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const { colors, spacing, radius, shadows } = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, alignItems: 'center', minHeight: '100%' }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 540,
          borderRadius: radius.xl,
          borderWidth: 2,
          borderColor: colors.primary,
          backgroundColor: colors.card,
          padding: spacing.xl,
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          ...Platform.select({ web: { boxShadow: '0 6px 32px 0 #4F8CFF22' }, default: shadows.card }),
        }}
      >
        <LinearGradient
          colors={[ '#4F8CFF', '#00D084' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: radius.md, padding: 2, marginBottom: spacing.md }}
        >
          <Text
            style={{
              fontFamily: Platform.OS === 'web' ? 'Syne, sans-serif' : undefined,
              fontSize: 28,
              fontWeight: '800',
              textAlign: 'center',
              color: '#fff',
              letterSpacing: 1.2,
              background: Platform.OS === 'web' ? 'linear-gradient(90deg,#fff,#4F8CFF)' : undefined,
              WebkitBackgroundClip: Platform.OS === 'web' ? 'text' : undefined,
              WebkitTextFillColor: Platform.OS === 'web' ? 'transparent' : undefined,
            }}
          >
            {title}
          </Text>
        </LinearGradient>
        <Text style={{
          fontFamily: Platform.OS === 'web' ? 'DM Sans, sans-serif' : undefined,
          fontSize: 13,
          color: colors.textMuted,
          textAlign: 'center',
          marginBottom: spacing.xs,
        }}>
          Effective date: {effectiveDate}
        </Text>
        <Text style={{
          fontFamily: Platform.OS === 'web' ? 'DM Sans, sans-serif' : undefined,
          fontSize: 16,
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}>
          {intro}
        </Text>

        {sections.map((section) => (
          <View key={section.title} style={{ marginTop: spacing.md }}>
            <Text style={{
              fontFamily: Platform.OS === 'web' ? 'Syne, sans-serif' : undefined,
              fontSize: 18,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: spacing.xs,
            }}>{section.title}</Text>
            {section.points.map((point) => (
              <Text
                key={point}
                style={{
                  fontFamily: Platform.OS === 'web' ? 'DM Sans, sans-serif' : undefined,
                  fontSize: 15,
                  color: colors.text,
                  marginBottom: 4,
                  lineHeight: 22,
                  paddingLeft: 8,
                  position: 'relative',
                }}
              >
                <Text style={{ color: '#4F8CFF', fontWeight: 'bold', marginRight: 6 }}>{'•'}</Text> {point}
              </Text>
            ))}
          </View>
        ))}

        {footerNote ? <View style={{ marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>{footerNote}</View> : null}
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
