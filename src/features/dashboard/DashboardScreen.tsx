/*
import React, { useMemo } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Colors } from '@/src/theme/colors';
import { leads, walletBalance } from './data';
import { LeadStatus } from './types';

const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const styleMap: Record<LeadStatus, { backgroundColor: string; color: string }> = {
    queued: { backgroundColor: '#DBEAFE', color: '#2563EB' },
    calling: { backgroundColor: '#D1FAE5', color: '#065F46' },
    answered: { backgroundColor: '#FEF3C7', color: '#B45309' },
    interested: { backgroundColor: '#FEF3C7', color: '#B45309' },
    not_interested: { backgroundColor: '#F1F5F9', color: '#475569' },
    follow_up: { backgroundColor: '#E9D5FF', color: '#6D28D9' },
    completed: { backgroundColor: '#DCFCE7', color: '#15803D' },
  };

  const badgeStyle = styleMap[status];

  return (
    <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}> 
      <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
        {status.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );
};

const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
    {children}
  </View>
);

export default function DashboardScreen() {
  const stats = useMemo(() => {
    const total = leads.length;
    const calling = leads.filter((l) => l.status === 'calling').length;
    const interested = leads.filter((l) => l.aiDisposition === 'interested').length;
    const converted = leads.filter((l) => l.status === 'completed').length;

    return { total, calling, interested, converted };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>AI COMMAND CENTER</Text>
        <Text style={styles.heroSubtitle}>Hello Sarah, I am analyzing your real estate metrics.</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.indigo }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>TOTAL LEADS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.emerald }]}>{stats.calling}</Text>
          <Text style={styles.statLabel}>CALLING</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.amber }]}>{stats.interested}</Text>
          <Text style={styles.statLabel}>INTERESTED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.purple }]}>{stats.converted}</Text>
          <Text style={styles.statLabel}>CONVERTED</Text>
        </View>
      </View>

      <View style={styles.bottomGrid}>
        <Card title="Live AI Intelligence Feed">
          <View style={styles.feedItem}>
            <View style={[styles.feedDot, { backgroundColor: Colors.emerald }]} />
            <View style={styles.feedContent}>
              <Text style={styles.feedTitle}>Auto-Qualification Active</Text>
              <Text style={styles.feedText}>
                Scanned 8 new leads from CSV import. 2 identified as high-priority (budget &gt; $1M).
              </Text>
            </View>
          </View>
          <View style={styles.feedItem}>
            <View style={[styles.feedDot, { backgroundColor: Colors.indigo }]} />
            <View style={styles.feedContent}>
              <Text style={styles.feedTitle}>Call Strategy Optimized</Text>
              <Text style={styles.feedText}>
                Calculated follow-up window for &quot;John Doe&quot; based on interest levels.
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>CALL CREDITS</Text>
          <Text style={styles.balanceValue}>{walletBalance}</Text>
          <Pressable style={styles.balanceButton}>
            <Text style={styles.balanceButtonText}>MANAGE WALLET</Text>
          </Pressable>
        </View>
      </View>

      <Card title="Priority Actions Required">
        {leads.slice(0, 3).map((lead) => (
          <View key={lead.id} style={styles.leadRow}>
            <View style={styles.leadAvatar}>
              <Text style={styles.leadAvatarText}>{lead.name.charAt(0)}</Text>
            </View>
            <View style={styles.leadInfo}>
              <Text style={styles.leadName}>{lead.name}</Text>
              <Text style={styles.leadMeta}>{lead.propertyInterest}</Text>
            </View>
            <View style={styles.leadActions}>
              <StatusBadge status={lead.status} />
              <Pressable style={styles.leadButton}>
                <Text style={styles.leadButtonText}>Start AI Call (5c)</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79,70,229,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1.5,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.slate,
  },
  bottomGrid: {
    marginTop: 10,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    color: Colors.text,
  },
  feedItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  feedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  feedContent: {
    flex: 1,
  },
  feedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  feedText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
  },
  balanceLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#94A3B8',
    fontWeight: '800',
  },
  balanceValue: {
    fontSize: 32,
    color: 'white',
    fontWeight: '800',
    marginTop: 6,
  },
  balanceButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '800',
    letterSpacing: 1,
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.slateLight,
  },
  leadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leadAvatarText: {
    fontWeight: '700',
    color: Colors.indigo,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontWeight: '700',
    color: Colors.text,
  },
  leadMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  leadActions: {
    alignItems: 'flex-end',
  },
  leadButton: {
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  leadButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.indigo,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  footerSpacing: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
});
*/

import HomeScreen from '@/src/features/home/HomeScreen';

export default HomeScreen;
