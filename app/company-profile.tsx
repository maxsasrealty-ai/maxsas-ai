import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';

type Service = {
  name: string;
  price: string;
};

type Plan = {
  name: string;
  price: string;
  features: string[];
};

const services: Service[] = [
  { name: 'AI Outbound Calling', price: 'Starting Rs.299 / campaign' },
  { name: 'Lead Qualification AI Agent', price: 'Rs.499 / campaign' },
  { name: 'Appointment Booking AI Calls', price: 'Rs.399 / campaign' },
  { name: 'AI Follow-up Calling', price: 'Rs.299 / campaign' },
  { name: 'Customer Feedback AI Calls', price: 'Rs.249 / campaign' },
  { name: 'AI Voice Campaign Automation', price: 'Rs.699 / campaign' },
];

const plans: Plan[] = [
  {
    name: 'Starter Plan',
    price: 'Rs.299 / month',
    features: ['Basic AI Calling', 'Campaign Dashboard', 'Lead Upload'],
  },
  {
    name: 'Growth Plan',
    price: 'Rs.999 / month',
    features: ['AI Campaign Automation', 'Lead Management', 'Analytics Dashboard'],
  },
  {
    name: 'Pro Plan',
    price: 'Rs.2999 / month',
    features: ['Unlimited Campaigns', 'AI Voice Agents', 'Full Analytics', 'Priority Support'],
  },
];

export default function CompanyProfilePage() {
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title="Company Profile"
        subtitle="Verification details for payment gateway and compliance review"
      />

      <AppCard style={styles.heroCard}>
        <View style={[styles.heroBadge, { borderColor: colors.primarySoft, backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.heroBadgeText, { color: colors.primary }]}>VERIFIED BUSINESS PROFILE</Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text, fontSize: typography.h2 }]}>Maxsas Realty</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted, fontSize: typography.body }]}>AI-powered calling and lead management platform for real estate teams.</Text>
      </AppCard>

      <AppCard title="Company Information" style={styles.cardSpacing}>
        <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]}>
          <DetailRow label="Legal Name" value="ANUBHAV CHAUDHARY" />
          <DetailRow label="Business Name" value="MAXSAS REALTY" />
          <DetailRow label="Business Type" value="Proprietorship" />
          <DetailRow label="Business Category" value="AI Software / SaaS Platform" />
          <DetailRow label="Business Activity" value="AI Calling Platform & Lead Management System" />
        </View>
      </AppCard>

      <AppCard title="Operating Address" style={styles.cardSpacing}>
        <Text style={[styles.addressText, { color: colors.text }]}>Vasundhara Hospital, First Floor, Office No. C-37</Text>
        <Text style={[styles.addressText, { color: colors.text }]}>Metro Plaza, Sector 15, Vasundhara</Text>
        <Text style={[styles.addressText, { color: colors.text }]}>Ghaziabad, Uttar Pradesh 201012, India</Text>
      </AppCard>

      <AppCard title="Contact Information" style={styles.cardSpacing}>
        <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]}>
          <DetailRow label="Email" value="maxsasrealty@gmail.com" />
          <DetailRow label="Phone" value="+91 8588837040" />
        </View>
      </AppCard>

      <AppCard title="Services Offered" style={styles.cardSpacing}>
        <View style={styles.gridWrap}>
          {services.map((service) => (
            <View
              key={service.name}
              style={[
                styles.gridCard,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  padding: spacing.sm,
                },
              ]}
            >
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>{service.name}</Text>
              <Text style={[styles.gridCardValue, { color: colors.textMuted }]}>{service.price}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title="Products / Plans" style={styles.cardSpacing}>
        <View style={styles.gridWrap}>
          {plans.map((plan) => (
            <View
              key={plan.name}
              style={[
                styles.gridCard,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  padding: spacing.sm,
                },
              ]}
            >
              <Text style={[styles.gridCardTitle, { color: colors.text }]}>{plan.name}</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
              {plan.features.map((feature) => (
                <Text key={`${plan.name}-${feature}`} style={[styles.planFeature, { color: colors.textMuted }]}>
                  {'\u2022'} {feature}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title="Compliance" style={styles.cardSpacing}>
        <Text style={[styles.complianceText, { color: colors.textMuted }]}>
          This platform is a SaaS software tool that allows businesses to run AI powered communication campaigns using
          their own customer data. The platform does not sell or distribute leads.
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 12,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontWeight: '800',
  },
  heroSubtitle: {
    lineHeight: 20,
  },
  cardSpacing: {
    marginBottom: 12,
  },
  sectionDivider: {
    gap: 8,
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 21,
  },
  gridWrap: {
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCard: {
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
    flexGrow: 1,
    gap: 6,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  gridCardValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  planFeature: {
    fontSize: 13,
    lineHeight: 20,
  },
  complianceText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
