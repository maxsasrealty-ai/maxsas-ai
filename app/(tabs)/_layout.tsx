import { Feather } from '@expo/vector-icons';
import { Tabs, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@/src/context/AuthContext';
import { isUserProfileComplete } from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ pass?: string | string[] }>();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const passParam = Array.isArray(params?.pass) ? params.pass[0] : params?.pass;
  const normalizedPass = typeof passParam === 'string' ? passParam.trim() : '';

  useEffect(() => {
    let mounted = true;

    const runCheck = async () => {
      if (!user) {
        if (normalizedPass) {
          if (mounted) setCheckingProfile(false);
          return;
        }
        router.replace('/login');
        if (mounted) setCheckingProfile(false);
        return;
      }

      try {
        const complete = await isUserProfileComplete(user.uid);
        if (!complete) {
          router.replace('/(onboarding)/name');
        }
      } catch (error) {
        console.error('Failed to validate profile completeness:', error);
        router.replace('/(onboarding)/name');
      } finally {
        if (mounted) setCheckingProfile(false);
      }
    };

    runCheck();

    return () => {
      mounted = false;
    };
  }, [normalizedPass, user]);

  if (checkingProfile) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Feather name="credit-card" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Feather name="bell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-lead"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
