import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function HeroSection() {
  return (
    <View style={styles.section}>
      <View style={styles.heroCard}>
        <View style={styles.left}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>MAXSAS REALTY AI VOICE PLATFORM</Text>
          </View>

          <Text style={styles.title}>Run AI Voice Agents That Qualify Real Estate Leads Automatically</Text>
          <Text style={styles.subtitle}>
            Maxsas Realty AI calls your property leads, understands buyer intent, and delivers qualified prospects to your sales team.
          </Text>

          <View style={styles.ctaRow}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/demo-transcript')}>
              <Text style={styles.primaryButtonText}>Start AI Demo</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => router.push('/demo-transcript')}>
              <Text style={styles.secondaryButtonText}>See How It Works</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/login')} style={styles.loginLinkWrap}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>

        <View style={styles.right}>
          <View style={styles.glowA} />
          <View style={styles.glowB} />

          <View style={styles.aiCard}>
            <Text style={styles.aiTitle}>AI Agent Calling...</Text>
            <View style={styles.aiDivider} />

            <Text style={styles.metaText}>Lead: Rahul Sharma</Text>
            <Text style={styles.metaText}>Budget: Rs.80L</Text>
            <Text style={styles.metaText}>Location Preference: Whitefield</Text>

            <Text style={styles.summaryTitle}>AI Conversation Summary:</Text>
            <Text style={styles.summaryItem}>Buyer interested in 3BHK</Text>
            <Text style={styles.summaryItem}>Budget confirmed</Text>
            <Text style={styles.summaryItem}>Site visit suggested</Text>

            <Text style={styles.summaryTitle}>Disposition:</Text>
            <Text style={styles.hotLead}>Hot Lead</Text>
            <Text style={styles.followupText}>Follow-up in 24 hours</Text>
          </View>
        </View>
      </View>

      <View style={styles.trustStrip}>
        <Text style={styles.trustLabel}>Trusted by Real Estate Teams</Text>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>NORTH PEAK</Text>
          <Text style={styles.logoText}>URBAN KEY</Text>
          <Text style={styles.logoText}>SKYLINE HOMES</Text>
          <Text style={styles.logoText}>PRIME ACRE</Text>
          <Text style={styles.logoText}>A1 REALTY</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    gap: 26,
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.08)',
    backgroundColor: '#F8FBFF',
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 6,
  },
  left: {
    gap: 12,
  },
  right: {
    minHeight: 360,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0B1F3A',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.25)',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#00D084',
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#516079',
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 26,
    color: '#4B5870',
    maxWidth: 560,
  },
  ctaRow: {
    marginTop: 14,
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryButton: {
    minWidth: 148,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4F8CFF',
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    minWidth: 154,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignItems: 'center',
    borderColor: 'rgba(11,31,58,0.14)',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
  },
  loginLinkWrap: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  loginLink: {
    color: '#4F8CFF',
    fontWeight: '700',
    fontSize: 14,
  },
  glowA: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(79,140,255,0.45)',
  },
  glowB: {
    position: 'absolute',
    bottom: -55,
    left: -40,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: 'rgba(0,208,132,0.22)',
  },
  aiCard: {
    margin: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(6,13,30,0.85)',
    padding: 18,
    gap: 7,
  },
  aiTitle: {
    color: '#DAE8FF',
    fontSize: 18,
    fontWeight: '800',
  },
  aiDivider: {
    marginVertical: 6,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  metaText: {
    color: '#E3EEFF',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryTitle: {
    marginTop: 10,
    color: '#A9C6FF',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryItem: {
    color: '#F4F8FF',
    fontSize: 13,
    lineHeight: 19,
  },
  hotLead: {
    color: '#00D084',
    fontWeight: '900',
    fontSize: 15,
  },
  followupText: {
    color: '#B3C8EB',
    fontSize: 13,
  },
  trustStrip: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.08)',
    gap: 10,
  },
  trustLabel: {
    color: '#5A6A84',
    fontSize: 13,
    fontWeight: '700',
  },
  logoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 8,
  },
  logoText: {
    color: '#0B1F3A',
    opacity: 0.7,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
