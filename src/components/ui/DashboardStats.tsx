/**
 * PHASE 2: Dashboard Statistics Component
 * Shows meaningful real-time lead information
 */

import { getDashboardStats } from '@/src/lib/leadService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface DashboardStatsType {
  totalLeads: number;
  queuedLeads: number;
  callingLeads: number;
  answeredLeads: number;
  interestedLeads: number;
  notInterestedLeads: number;
  followUpLeads: number;
  completedLeads: number;
  pendingAutomation: number;
  scheduledLeads: number;
  followUpsDueToday: number;
}

export const DashboardStats: React.FC<{ userId?: string; refresh?: boolean }> = ({ refresh }) => {
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats as DashboardStatsType);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [refresh]);

  if (loading || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading statistics...</Text>
      </View>
    );
  }

  // Status message based on stats
  const getStatusMessage = () => {
    if (stats.queuedLeads > 0) {
      return `${stats.queuedLeads} leads queued`;
    }
    if (stats.pendingAutomation > 0) {
      return `${stats.pendingAutomation} leads waiting for automation`;
    }
    if (stats.followUpsDueToday > 0) {
      return `${stats.followUpsDueToday} follow-ups due today`;
    }
    if (stats.scheduledLeads > 0) {
      return `${stats.scheduledLeads} leads scheduled`;
    }
    return 'No automation triggered yet';
  };

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: color + '15', borderColor: color + '30', borderWidth: 1 },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.statusMessage}>
        <Text style={[styles.statusText, { color: colors.primary }]}>
          📊 {getStatusMessage()}
        </Text>
      </View>

      <StatCard label="Total Leads" value={stats.totalLeads} color={colors.info} />
      <StatCard label="Queued" value={stats.queuedLeads} color="#FF9500" />
      <StatCard label="Calling" value={stats.callingLeads} color="#5AC8FA" />
      <StatCard label="Answered" value={stats.answeredLeads} color="#34C759" />
      <StatCard label="Pending" value={stats.pendingAutomation} color="#FF2D55" />
      <StatCard label="Interested" value={stats.interestedLeads} color={colors.success} />
      <StatCard label="Not Interested" value={stats.notInterestedLeads} color={colors.danger} />
      <StatCard label="Follow-up" value={stats.followUpLeads} color={colors.warning} />
      <StatCard label="Scheduled" value={stats.scheduledLeads} color="#0D1B3E" />
      <StatCard label="Completed" value={stats.completedLeads} color={colors.success} />
      <StatCard label="Due Today" value={stats.followUpsDueToday} color="#FF2D55" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusMessage: {
    paddingRight: 16,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statCard: {
    width: 90,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
