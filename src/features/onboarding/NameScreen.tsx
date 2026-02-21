import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getUserProfile, isUserProfileComplete } from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function NameScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!user) return;

      try {
        const complete = await isUserProfileComplete(user.uid);
        if (complete) {
          router.replace('/(tabs)');
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (mounted && profile?.name) {
          setFullName(profile.name);
        }
      } catch (bootstrapError) {
        console.error('Onboarding bootstrap failed:', bootstrapError);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [router, user]);

  const handleContinue = () => {
    const trimmedName = fullName.trim().replace(/\s+/g, ' ');
    if (!trimmedName) {
      setError('Full name is required.');
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      setError('Name can contain only alphabets and spaces.');
      return;
    }

    setError('');
    setLoading(true);
    router.push({ pathname: '/contact', params: { name: trimmedName } });
    setLoading(false);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Welcome" subtitle="Step 1 of 2" />

      <View style={{ marginBottom: spacing.md }}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.h3 }]}>What should we call you?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs }]}>We’ll personalize MAXSAS AI for you.</Text>
      </View>

      <AppCard>
        <AppInput
          label="Full name"
          placeholder="Sarah Jennings"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <AppButton title="Continue" onPress={handleContinue} loading={loading} />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '800',
  },
  subtitle: {
    marginBottom: 0,
  },
  error: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '600',
  },
});
