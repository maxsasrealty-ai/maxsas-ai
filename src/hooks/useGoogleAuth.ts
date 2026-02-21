import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, getAuth, signInWithCredential } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type UseGoogleAuthResult = {
  promptAsync: () => Promise<any>;
  request: any;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
};

export const useGoogleAuth = (): UseGoogleAuthResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expoClientId = process.env.EXPO_PUBLIC_EXPO_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;

  // Check if Google auth is properly configured
  const isConfigured = !!(
    (Platform.OS !== 'web' && expoClientId) ||
    (Platform.OS === 'web' && webClientId) ||
    (Platform.OS === 'android' && androidClientId) ||
    (Platform.OS === 'ios' && iosClientId)
  );

  const [request, response, promptAsync] = !isConfigured
    ? [null, null, async () => {}]
    : Google.useIdTokenAuthRequest(
        {
          expoClientId: expoClientId || undefined,
          webClientId: webClientId || undefined,
          androidClientId: androidClientId || undefined,
          iosClientId: iosClientId || undefined,
          selectAccount: true,
        }
      );

  useEffect(() => {
    if (!isConfigured || !response) {
      return;
    }

    const signInWithGoogle = async () => {
      if (response.type !== 'success') {
        if (response.type !== 'dismiss' && response.type !== 'cancel') {
          setError('Google sign-in was not successful. Please try again.');
          console.error('Google login error: auth session failed', response);
        }
        return;
      }

      const idToken = response.authentication?.idToken ?? response.params?.id_token;

      if (!idToken) {
        setError('Missing Google ID token. Please try again.');
        console.error('Google login error: missing id_token', response);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (Platform.OS === 'web') {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(getAuth(), credential);
        } else {
          const nativeAuth = require('@react-native-firebase/auth').default;
          const credential = nativeAuth.GoogleAuthProvider.credential(idToken);
          await nativeAuth().signInWithCredential(credential);
        }

        console.log('Google login success');
      } catch (e) {
        console.error('Google login error:', e);
        setError('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    signInWithGoogle();
  }, [response, isConfigured]);

  const startGoogleAuth = async () => {
    if (!promptAsync) return;

    setError(null);
    try {
      await promptAsync(
        Platform.OS === 'web'
          ? {}
          : {
              useProxy: true,
            }
      );
    } catch (promptError) {
      console.error('Google login prompt error:', promptError);
      setError('Google sign-in could not start. Please try again.');
    }
  };

  return useMemo(
    () => ({
      promptAsync: startGoogleAuth,
      request,
      loading,
      error: !isConfigured
        ? 'Google Sign-In not configured. Set EXPO_PUBLIC_EXPO_CLIENT_ID and platform client IDs in .env.'
        : error,
      isConfigured,
    }),
    [startGoogleAuth, request, loading, error, isConfigured]
  );
};
