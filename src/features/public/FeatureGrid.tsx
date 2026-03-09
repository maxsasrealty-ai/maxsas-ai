import { StyleSheet, Text, View } from 'react-native';

const FEATURES = [
  {
    icon: 'AI',
    title: 'AI Voice Calling',
    body: 'Automatically calls incoming leads.',
  },
  {
    icon: 'LQ',
    title: 'Lead Qualification AI',
    body: 'Understands budget, location and intent.',
  },
  {
    icon: 'BC',
    title: 'Batch Calling',
    body: 'Call hundreds of leads automatically.',
  },
  {
    icon: 'FA',
    title: 'Follow-up Automation',
    body: 'AI schedules follow-ups intelligently.',
  },
  {
    icon: 'RA',
    title: 'Real-time Analytics',
    body: 'Track conversion metrics and lead status.',
  },
  {
    icon: 'CRM',
    title: 'CRM Integration',
    body: 'Connect with your CRM systems.',
  },
];

const STEPS = [
  {
    id: '1',
    title: 'Upload Leads',
    body: 'Import property inquiries.',
  },
  {
    id: '2',
    title: 'AI Calls Leads',
    body: 'AI agent talks to buyers naturally.',
  },
  {
    id: '3',
    title: 'Get Qualified Buyers',
    body: 'Sales team receives high-intent leads.',
  },
];

export function FeatureGrid() {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Platform Features</Text>
      <Text style={styles.subheading}>Everything your team needs to run AI-driven lead qualification at scale.</Text>

      <View style={styles.grid}>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.card}>
            <View style={styles.iconWrap}>
              <Text style={styles.iconText}>{feature.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardBody}>{feature.body}</Text>
          </View>
        ))}
      </View>

      <View style={styles.workflowWrap}>
        <Text style={styles.workflowHeading}>How It Works</Text>
        <View style={styles.workflowRow}>
          {STEPS.map((step) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.id}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 36,
    gap: 14,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#55647E',
    maxWidth: 760,
  },
  grid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    flexGrow: 1,
    minWidth: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79,140,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#4F8CFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardTitle: {
    marginTop: 4,
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: '#5A6A84',
    fontSize: 14,
    lineHeight: 21,
  },
  workflowWrap: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
  },
  workflowHeading: {
    color: '#0B1F3A',
    fontSize: 26,
    fontWeight: '800',
  },
  workflowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepCard: {
    flexGrow: 1,
    minWidth: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.2)',
    backgroundColor: '#F8FBFF',
    padding: 14,
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8CFF',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepTitle: {
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 18,
  },
  stepBody: {
    color: '#5A6A84',
    fontSize: 14,
    lineHeight: 20,
  },
});
