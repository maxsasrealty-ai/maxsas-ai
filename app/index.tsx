import { useAuth } from '@/src/context/AuthContext';
import { isUserProfileComplete } from '@/src/services/userService';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, authLoaded } = useAuth();
  const params = useLocalSearchParams<{ pass?: string | string[] }>();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const passParam = Array.isArray(params?.pass) ? params.pass[0] : params?.pass;
  const normalizedPass = typeof passParam === 'string' ? passParam.trim() : '';

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      if (!authLoaded) return;
      if (!user) {
        if (mounted) {
          setProfileComplete(false);
          setProfileChecked(true);
        }
        return;
      }

      try {
        const complete = await isUserProfileComplete(user.uid);
        if (mounted) {
          setProfileComplete(complete);
          setProfileChecked(true);
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error);
        if (mounted) {
          setProfileComplete(false);
          setProfileChecked(true);
        }
      }
    };

    checkProfile();
    return () => {
      mounted = false;
    };
  }, [authLoaded, user]);

  if (!authLoaded || !profileChecked) return null;

  if (!user) {
    if (normalizedPass) {
      return (
        <Redirect
          href={{
            pathname: '/(tabs)',
            params: { pass: normalizedPass },
          }}
        />
      );
    }
    return <Redirect href="/login" />;
  }

  return profileComplete ? <Redirect href="/(tabs)" /> : <Redirect href="/(onboarding)/name" />;
}
