import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getUserProfile, isUserProfileComplete, upsertUserProfile } from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function ContactScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const fullName = useMemo(() => (params.name ? String(params.name).trim() : ''), [params.name]);
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!user) return;

      const complete = await isUserProfileComplete(user.uid);
      if (complete) {
        router.replace('/(tabs)');
        return;
      }

      const profile = await getUserProfile(user.uid);
      if (mounted && profile?.phone) {
        setContactNumber(profile.phone);
      }
    };

    bootstrap().catch((bootstrapError) => {
      console.error('Failed to initialize contact onboarding:', bootstrapError);
    });

    return () => {
      mounted = false;
    };
  }, [router, user]);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const normalized = digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits;

    if (!/^[987]\d{9}$/.test(normalized)) {
      return null;
    }

    return normalized;
  };

  const handleFinish = async () => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!fullName) {
      setError('Please go back and enter your full name.');
      return;
    }

    const normalizedPhone = normalizePhone(contactNumber);
    if (!normalizedPhone) {
      setError('Enter a valid Indian mobile number (10 digits, starts with 9/8/7).');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await upsertUserProfile(user.uid, {
        name: fullName,
        phone: normalizedPhone,
        email: user.email || '',
      });
      router.replace('/(tabs)');
    } catch (saveError) {
      console.error('Failed to save onboarding profile:', saveError);
      setError('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Contact Details" subtitle="Step 2 of 2" showBackButton />

      <View style={{ marginBottom: spacing.md }}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.h3 }]}>Your contact number</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs }]}>MAXSAS AI will use this for call routing.</Text>
      </View>

      <AppCard>
        <AppInput
          label="Phone number"
          placeholder="9876543210"
          value={contactNumber}
          onChangeText={(value) => setContactNumber(value.replace(/\D/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          maxLength={10}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <AppButton title="Finish setup" onPress={handleFinish} loading={saving} />
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
