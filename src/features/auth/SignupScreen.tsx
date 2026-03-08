import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SignupScreen = () => {
  const { signup, loading } = useAuth();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setInfo('');
    try {
      await signup(email, password);
      setInfo('Verification email sent. Please check your Gmail.');
      router.replace('/login');
    } catch (e: any) {
      const friendlyMessage =
        e.code === 'auth/email-already-in-use'
          ? 'This email address is already in use.'
          : e.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters.'
          : 'An unexpected error occurred.';
      setError(friendlyMessage);
      console.error('Signup failed:', e);
    }
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
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>
              Join MAXSAS AI Today
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
            <AppInput
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />

            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
            {info ? <Text style={[styles.infoText, { color: colors.accent }]}>{info}</Text> : null}

            <AppButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: 16 }}
            />
          </View>

          <View style={styles.footer}>
            <AppButton
              title="Already have an account? Login"
              variant="ghost"
              onPress={() => router.push('/login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
});

export default SignupScreen;
