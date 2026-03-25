import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/src/components/ui/ScreenContainer';

import { DemoSection } from './DemoSection';
import { FeaturesSection as FeatureGrid } from './FeaturesSection';
import { FooterSection } from './FooterSection';
import { HeroSection } from './HeroSection';
import { PricingSection } from './PricingSection';

export default function LandingPage() {
  const navTabs = [
    { label: 'Features', path: '#features' },
    { label: 'How It Works', path: '#how-it-works' },
    { label: 'Pricing', path: '#pricing' },
    { label: 'Demo', path: '/demo-transcript' },
    { label: 'Login', path: '/login' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Refund Policy', path: '/refund-policy' },
    { label: 'Terms & Conditions', path: '/terms-and-conditions' },
  ];

  return (
    <div className="web-screen-container">
      {/* Top Navigation Bar (Web) */}
      <nav className="web-navbar">
        <div className="web-navbar-logo">Maxsas Realty AI</div>
        <div className="web-navbar-tabs">
          {navTabs.map(tab => (
            <a
              key={tab.label}
              href={tab.path}
              className="web-navbar-tab"
              style={{ cursor: 'pointer' }}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </nav>
      <div className="web-content-scroll">
        <HeroSection />
        <DemoSection onTryDemo={() => window.location.href = '/demo-transcript'} />
        <FeatureGrid />
        <PricingSection />
        <FooterSection />
      </div>
    </div>
  );
}
