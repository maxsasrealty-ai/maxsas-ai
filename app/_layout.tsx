import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { BatchProvider } from '@/src/context/BatchContext';
import { WalletProvider } from '@/src/context/WalletContext';
import { useAppTheme } from '@/src/theme/use-app-theme';

function RootLayoutNav() {
  const { authLoaded, user } = useAuth();
  const segments = useSegments();
  const rootRoute = String(segments[0] ?? '');
  const [devRole, setDevRole] = useState<string | null>(null);
  const [devSessionLoaded, setDevSessionLoaded] = useState(false);

  const { colors, typography } = useAppTheme();
  const stackScreenOptions = useMemo(
    () => ({
      headerShown: true,
      headerTitleAlign: 'center' as const,
      animation: 'default' as const,
      headerStyle: { backgroundColor: colors.card },
      headerTitleStyle: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '700' as const,
      },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal' as const,
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors.background, colors.card, colors.text, typography.body]
  );

  useEffect(() => {
    let active = true;

    const loadDevSessionRole = async () => {
      if (!__DEV__) {
        if (active) {
          setDevRole(null);
          setDevSessionLoaded(true);
        }
        return;
      }

      try {
        const [devLogin, role] = await Promise.all([
          AsyncStorage.getItem('devLogin'),
          AsyncStorage.getItem('devUserRole'),
        ]);

        if (!active) {
          return;
        }

        setDevRole(devLogin === 'true' ? role : null);
      } catch (storageError) {
        if (active) {
          console.error('Failed to read DEV auth session:', storageError);
          setDevRole(null);
        }
      } finally {
        if (active) {
          setDevSessionLoaded(true);
        }
      }
    };

    setDevSessionLoaded(false);
    void loadDevSessionRole();

    return () => {
      active = false;
    };
  }, [rootRoute, user]);
  
  if (!authLoaded || !devSessionLoaded) {
    return null;
  }

  const inTabsGroup = rootRoute === '(tabs)';
  const inEnterpriseGroup = rootRoute === '(enterprise)';
  const hasEnterpriseDevSession = __DEV__ && devRole === 'enterprise_client';

  if (!user && inTabsGroup) {
    return <Redirect href="/" />;
  }

  if (!user && inEnterpriseGroup && !hasEnterpriseDevSession) {
    return <Redirect href="/" />;
  }

  return (
    <Stack initialRouteName="index" screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false, headerBackVisible: false }} />
      <Stack.Screen name="(batch)/batch-dashboard" options={{ title: 'Batch Dashboard' }} />
      <Stack.Screen name="(batch)/batch-detail" options={{ title: 'Batch Details' }} />
      <Stack.Screen name="(batch)/batch-results" options={{ title: 'Batch Results' }} />
      <Stack.Screen name="(leads)/imports" options={{ title: 'Import Leads' }} />
      <Stack.Screen name="(leads)/upload-leads" options={{ title: 'Upload Leads' }} />
      <Stack.Screen name="(leads)/attach-file" options={{ title: 'Attach File' }} />
      <Stack.Screen name="(leads)/image-import" options={{ title: 'Image Import' }} />
      <Stack.Screen name="(leads)/paste-leads" options={{ title: 'Paste Leads' }} />
      <Stack.Screen name="(batch)/follow-up-schedule" options={{ title: 'Schedule Follow-up' }} />
      <Stack.Screen name="(batch)/scheduled-follow-ups" options={{ title: 'Scheduled Follow-ups' }} />
      <Stack.Screen name="payment-history" options={{ title: 'Payment History' }} />
      <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
      <Stack.Screen name="(batch)/batch-charges" options={{ title: 'Batch Charges' }} />
      <Stack.Screen name="(batch)/batch-billing-detail" options={{ title: 'Batch Billing Detail' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
      <Stack.Screen name="company-profile" options={{ title: 'Company Profile' }} />
      <Stack.Screen name="contact-us" options={{ title: 'Contact Us' }} />
      <Stack.Screen name="terms-of-service" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="terms-and-conditions" options={{ title: 'Terms and Conditions' }} />
      <Stack.Screen name="refund-policy" options={{ title: 'Refund Policy' }} />
      <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="lead/[id]" options={{ title: 'Lead Details' }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Modal',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="demo-transcript"
        options={{
          presentation: 'modal',
          title: 'Demo Transcript',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { colors, isDark } = useAppTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.danger,
      },
    }),
    [colors.background, colors.border, colors.card, colors.danger, colors.primary, colors.text, isDark]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WalletProvider>
          <BatchProvider>
            <ThemeProvider value={navigationTheme}>
              <SafeAreaProvider>
                <RootLayoutNav />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </SafeAreaProvider>
            </ThemeProvider>
          </BatchProvider>
        </WalletProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
