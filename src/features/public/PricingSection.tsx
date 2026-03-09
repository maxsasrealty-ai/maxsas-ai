import { Pressable, StyleSheet, Text, View } from 'react-native';

const PLANS = [
  {
    title: 'Starter',
    price: 'Rs.4,999/mo',
    desc: 'For small teams starting AI lead follow-up.',
  },
  {
    title: 'Growth',
    price: 'Rs.14,999/mo',
    desc: 'Scale batch campaigns and analytics across multiple projects.',
    featured: true,
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    desc: 'Dedicated AI workflows, advanced controls, and integration support.',
  },
];

export function PricingSection() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Pricing</Text>
      <Text style={styles.subheading}>Choose a plan that fits your team size and calling volume.</Text>

      <View style={styles.row}>
        {PLANS.map((plan) => (
          <View key={plan.title} style={[styles.plan, plan.featured && styles.featuredPlan]}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={[styles.planPrice, plan.featured && styles.featuredPrice]}>{plan.price}</Text>
            <Text style={styles.planBody}>{plan.desc}</Text>
            <Pressable style={[styles.planButton, plan.featured && styles.featuredPlanButton]}>
              <Text style={[styles.planButtonText, plan.featured && styles.featuredPlanButtonText]}>Start Free Trial</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 36,
    gap: 12,
  },
  heading: {
    color: '#0B1F3A',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subheading: {
    color: '#55647E',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  plan: {
    flexGrow: 1,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'rgba(11,31,58,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
  },
  featuredPlan: {
    borderColor: 'rgba(79,140,255,0.6)',
    backgroundColor: '#F4F8FF',
  },
  planTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '700',
  },
  planPrice: {
    color: '#0B1F3A',
    fontSize: 28,
    fontWeight: '800',
  },
  featuredPrice: {
    color: '#4F8CFF',
  },
  planBody: {
    color: '#5A6A84',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 60,
  },
  planButton: {
    marginTop: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.15)',
    backgroundColor: '#F9FBFF',
  },
  featuredPlanButton: {
    borderColor: '#4F8CFF',
    backgroundColor: '#4F8CFF',
  },
  planButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '700',
  },
  featuredPlanButtonText: {
    color: '#FFFFFF',
  },
});
