import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { BatchProvider } from '@/src/context/BatchContext';
import { WalletProvider } from '@/src/context/WalletContext';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { colors, isDark, typography } = useAppTheme();

  const navigationTheme = {
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
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WalletProvider>
          <BatchProvider>
            <ThemeProvider value={navigationTheme}>
              <SafeAreaProvider>
                <Stack
                screenOptions={{
                  headerShown: true,
                  headerTitleAlign: 'center',
                  animation: 'default',
                  headerStyle: { backgroundColor: colors.card },
                  headerTitleStyle: {
                    color: colors.text,
                    fontSize: typography.body,
                    fontWeight: '700',
                  },
                  headerTintColor: colors.text,
                  headerShadowVisible: false,
                  headerBackButtonDisplayMode: 'minimal',
                  contentStyle: { backgroundColor: colors.background },
                }}>
                <Stack.Screen name="index" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="login" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false, headerBackVisible: false }} />
                <Stack.Screen name="batch-dashboard" options={{ title: 'Batch Dashboard' }} />
                <Stack.Screen name="batch-detail" options={{ title: 'Batch Details' }} />
                <Stack.Screen name="imports" options={{ title: 'Import Leads' }} />
                <Stack.Screen name="upload-leads" options={{ title: 'Upload Leads' }} />
                <Stack.Screen name="attach-file" options={{ title: 'Attach File' }} />
                <Stack.Screen name="image-import" options={{ title: 'Image Import' }} />
                <Stack.Screen name="paste-leads" options={{ title: 'Paste Leads' }} />
                <Stack.Screen name="follow-up-schedule" options={{ title: 'Schedule Follow-up' }} />
                <Stack.Screen name="scheduled-follow-ups" options={{ title: 'Scheduled Follow-ups' }} />
                <Stack.Screen name="payment-history" options={{ title: 'Payment History' }} />
                <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
                <Stack.Screen name="batch-charges" options={{ title: 'Batch Charges' }} />
                <Stack.Screen name="batch-billing-detail" options={{ title: 'Batch Billing Detail' }} />
                <Stack.Screen name="settings" options={{ title: 'Settings' }} />
                <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
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
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </SafeAreaProvider>
            </ThemeProvider>
          </BatchProvider>
        </WalletProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
