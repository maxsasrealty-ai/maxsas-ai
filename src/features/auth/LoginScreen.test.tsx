import { useAuth } from '@/src/context/AuthContext';
import { useGoogleAuth } from '@/src/hooks/useGoogleAuth';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import LoginScreen from './LoginScreen';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('@/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the useGoogleAuth hook
jest.mock('@/src/hooks/useGoogleAuth', () => ({
  useGoogleAuth: jest.fn(),
}));

jest.mock('@/src/hooks/useForgotPassword', () => ({
  SUCCESS_MESSAGE: 'success',
  useForgotPassword: jest.fn(),
}));

jest.mock('@/src/modules/admin/services/createEnterpriseClient', () => ({
  isEnterpriseClientAuthUid: jest.fn(),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: View,
  };
});

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;
  const mockUseGoogleAuth = useGoogleAuth as jest.Mock;
  const mockUseForgotPassword = require('@/src/hooks/useForgotPassword').useForgotPassword as jest.Mock;
  const mockIsEnterpriseClientAuthUid = require('@/src/modules/admin/services/createEnterpriseClient')
    .isEnterpriseClientAuthUid as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      user: null,
    });
    mockUseGoogleAuth.mockReturnValue({
      promptAsync: jest.fn(),
      request: null,
      loading: false,
      error: null,
      isConfigured: false,
    });
    mockUseForgotPassword.mockReturnValue({
      loading: false,
      error: '',
      success: false,
      sendResetEmail: jest.fn(),
      clearMessages: jest.fn(),
    });
    mockIsEnterpriseClientAuthUid.mockResolvedValue(false);
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('updates email and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('does not call login if email or password are empty', () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(mockLogin).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('calls login and navigates to tabs when login is successful', async () => {
    mockLogin.mockResolvedValueOnce({} as any); // Simulate successful login
    const { getByPlaceholderText, getByText, rerender } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Simulate user state change after successful login
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      user: { uid: 'test-user-id' } as any,
    });

    rerender(<LoginScreen />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('displays an error message for invalid credentials', async () => {
    const error = { code: 'auth/user-not-found' };
    mockLogin.mockRejectedValueOnce(error); // Simulate failed login
    const { getByPlaceholderText, getByText, findByText } = render(
      <LoginScreen />
    );
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    const errorText = await findByText('Invalid credentials. Please try again.');
    expect(errorText).toBeTruthy();
  });
});