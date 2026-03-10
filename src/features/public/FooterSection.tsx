import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function FooterSection() {
  return (
    <View style={styles.wrap}>
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Start Automating Your Real Estate Calls Today</Text>
        <Pressable style={styles.ctaButton} onPress={() => router.push('/demo-transcript')}>
          <Text style={styles.ctaButtonText}>Launch AI Agent</Text>
        </Pressable>
      </View>

      <Text style={styles.brand}>Maxsas Realty AI</Text>
      <Text style={styles.copy}>AI Voice Calling Platform for real estate businesses.</Text>
      <View style={styles.links}>
        <Pressable onPress={() => router.push('/company-profile')}>
          <Text style={styles.link}>Company Profile</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)')}>
          <Text style={styles.link}>Explore</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.link}>Login</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/signup')}>
          <Text style={styles.link}>Signup</Text>
        </Pressable>
      </View>

      <Text style={styles.legalHeading}>Legal</Text>
      <View style={styles.legalLinks}>
        <Pressable onPress={() => router.push('/terms-of-service')}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/refund-policy')}>
          <Text style={styles.legalLink}>Refund Policy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/privacy-policy')}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/contact-us')}>
          <Text style={styles.legalLink}>Contact Us</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,31,58,0.08)',
    paddingTop: 20,
    paddingBottom: 34,
    gap: 8,
  },
  ctaCard: {
    borderRadius: 22,
    backgroundColor: '#0B1F3A',
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.4)',
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  ctaTitle: {
    color: '#EFF5FF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 760,
  },
  ctaButton: {
    borderRadius: 14,
    backgroundColor: '#4F8CFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  brand: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },
  copy: {
    color: '#5A6A84',
    fontSize: 13,
    lineHeight: 18,
  },
  links: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 20,
  },
  link: {
    color: '#4F8CFF',
    fontSize: 14,
    fontWeight: '700',
  },
  legalHeading: {
    marginTop: 12,
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  legalLinks: {
    marginTop: 8,
    gap: 8,
  },
  legalLink: {
    color: '#4F8CFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
