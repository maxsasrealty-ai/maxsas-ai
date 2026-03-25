import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { SUCCESS_MESSAGE, useForgotPassword } from '@/src/hooks/useForgotPassword';
import { useGoogleAuth } from '@/src/hooks/useGoogleAuth';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const LoginScreen = () => {
  const { login, loading, user } = useAuth();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const { promptAsync, request, loading: googleLoading, error: googleError, isConfigured: isGoogleConfigured } = useGoogleAuth();
  const { loading: resetLoading, error: resetError, success: resetSuccess, sendResetEmail, clearMessages } = useForgotPassword();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    // Show success alert when reset email is sent
    if (resetSuccess) {
      Alert.alert('Success', SUCCESS_MESSAGE, [
        {
          text: 'OK',
          onPress: () => {
            setShowForgotPasswordModal(false);
            setForgotPasswordEmail('');
            clearMessages();
          },
        },
      ]);
    }
  }, [resetSuccess]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (e: any) {
      const friendlyMessage =
        e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
          ? 'Invalid credentials. Please try again.'
          : 'An unexpected error occurred.';
      setError(friendlyMessage);
      console.error('Login failed:', e);
    }
  };

  const handleOpenForgotPassword = () => {
    setForgotPasswordEmail(email); // Pre-fill with login email if available
    setShowForgotPasswordModal(true);
    clearMessages();
  };

  const handleSendResetEmail = async () => {
    await sendResetEmail(forgotPasswordEmail);
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail('');
    clearMessages();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: colors.surface }]}>
              <Ionicons name="aperture" size={40} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>MAXSAS AI</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>
              Smarter Leads. Faster Deals.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="EMAIL"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppInput
              label="PASSWORD"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleOpenForgotPassword}
            >
              <Text style={[styles.forgotPassword, { color: colors.accent }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

            <AppButton title="Login" onPress={handleLogin} loading={loading} />
            {isGoogleConfigured && (
              <View style={styles.googleButtonContainer}>
                <AppButton
                  title="Continue with Google"
                  variant="secondary"
                  onPress={() => promptAsync()}
                  disabled={!request || loading || googleLoading}
                  loading={googleLoading}
                />
              </View>
            )}

            {googleError ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{googleError}</Text>
            ) : null}

            {/* TEMP DEV-ONLY ADMIN & ENTERPRISE BUTTONS */}
            <View style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
              <AppButton
                title="Admin (DEV ONLY)"
                variant="destructive"
                onPress={() => router.replace('/(admin)')}
                style={{ width: 220 }}
              />
              <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                Direct admin access (bypasses login)
              </Text>
              <AppButton
                title="Enterprise (DEV ONLY)"
                variant="secondary"
                onPress={() => router.replace('/(enterprise)')}
                style={{ width: 220, marginTop: 8 }}
              />
              <Text style={{ color: colors.accent, fontSize: 12, marginTop: 4 }}>
                Direct enterprise access (bypasses login)
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <AppButton
              title="Create a new account"
              variant="ghost"
              onPress={() => router.push('/signup')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseForgotPasswordModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseForgotPasswordModal}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Modal Title */}
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {/* Email Input */}
            <AppInput
              label="EMAIL"
              placeholder="you@example.com"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!resetLoading}
            />

            {/* Error Message */}
            {resetError ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{resetError}</Text>
            ) : null}

            {/* Send Button */}
            <AppButton
              title="Send Reset Email"
              onPress={handleSendResetEmail}
              loading={resetLoading}
              disabled={resetLoading || !forgotPasswordEmail.trim()}
            />

            {/* Cancel Button */}
            <AppButton
              title="Cancel"
              variant="ghost"
              onPress={handleCloseForgotPasswordModal}
              disabled={resetLoading}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.8,
  },
  form: {
    flex: 1,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPassword: {
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButtonContainer: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
});

export default LoginScreen;
