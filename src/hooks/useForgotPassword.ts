import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Platform } from 'react-native';

export const ERROR_MESSAGES = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/missing-email': 'Please enter your email address.',
  default: 'Failed to send reset email. Please try again.',
};

export const SUCCESS_MESSAGE = 'Password reset email sent! Check your inbox.';

// Get native auth instance (only for native platforms)
const getNativeAuth = () => {
  if (Platform.OS !== 'web') {
    try {
      
      const nativeAuth = require('@react-native-firebase/auth').default;
      return nativeAuth;
    } catch (error) {
      console.error('Native Firebase auth not available:', error);
      return null;
    }
  }
  return null;
};

type UseForgotPasswordResult = {
  loading: boolean;
  error: string | null;
  success: boolean;
  sendResetEmail: (email: string) => Promise<void>;
  clearMessages: () => void;
};

export const useForgotPassword = (): UseForgotPasswordResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendResetEmail = async (email: string) => {
    // Validate email
    if (!email || email.trim().length === 0) {
      setError(ERROR_MESSAGES['auth/missing-email']);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(ERROR_MESSAGES['auth/invalid-email']);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (Platform.OS === 'web') {
        await sendPasswordResetEmail(getAuth(), email);
      } else {
        // For native platforms
        const nativeAuth = getNativeAuth();
        if (!nativeAuth) {
          throw new Error('Firebase auth not available on this platform');
        }
        await nativeAuth().sendPasswordResetEmail(email);
      }

      setSuccess(true);
      console.log('Password reset email sent successfully');
    } catch (e: any) {
      const errorCode = e.code || 'default';
      const friendlyMessage = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;

      setError(friendlyMessage);
      console.error('Password reset error:', errorCode, e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    sendResetEmail,
    clearMessages,
  };
};
