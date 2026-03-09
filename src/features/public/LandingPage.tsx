import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/src/components/ui/ScreenContainer';

import { DemoSection } from './DemoSection';
import { FeaturesSection as FeatureGrid } from './FeaturesSection';
import { FooterSection } from './FooterSection';
import { HeroSection } from './HeroSection';
import { PricingSection } from './PricingSection';

export default function LandingPage() {
  return (
    <ScreenContainer scroll={false}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.backdropOrbA} />
        <View style={styles.backdropOrbB} />
        <View style={styles.backdropGrid} />

        <HeroSection />
        <DemoSection onTryDemo={() => router.push('/demo-transcript')} />
        <FeatureGrid />
        <PricingSection />
        <FooterSection />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  backdropOrbA: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(79,140,255,0.2)',
  },
  backdropOrbB: {
    position: 'absolute',
    top: 480,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(0,208,132,0.12)',
  },
  backdropGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 520,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,31,58,0.05)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
