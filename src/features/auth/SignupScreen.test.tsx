import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import SignupScreen from './SignupScreen';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Ionicons: View,
  };
});

describe('SignupScreen', () => {
  const mockSignup = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signup: mockSignup,
      loading: false,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getAllByPlaceholderText, getAllByText } = render(<SignupScreen />);
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getAllByPlaceholderText('••••••••').length).toBe(2);
    expect(getAllByText('Create Account').length).toBe(2);
  });

  it('updates email and password inputs', () => {
    const { getByPlaceholderText, getAllByPlaceholderText } = render(<SignupScreen />);
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getAllByPlaceholderText('••••••••')[0];
    const confirmPasswordInput = getAllByPlaceholderText('••••••••')[1];

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmPasswordInput.props.value).toBe('password123');
  });

  it('does not call signup if email or password are empty', () => {
    const { getAllByText } = render(<SignupScreen />);
    const signupButton = getAllByText('Create Account')[1];

    fireEvent.press(signupButton);

    expect(mockSignup).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('calls signup and navigates to login when signup is successful', async () => {
    mockSignup.mockResolvedValueOnce({} as any); // Simulate successful signup
    const { getByPlaceholderText, getAllByPlaceholderText, getAllByText } = render(<SignupScreen />);
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getAllByPlaceholderText('••••••••')[0];
    const confirmPasswordInput = getAllByPlaceholderText('••••••••')[1];
    const signupButton = getAllByText('Create Account')[1];

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('displays an error message for email already in use', async () => {
    const error = { code: 'auth/email-already-in-use' };
    mockSignup.mockRejectedValueOnce(error); // Simulate failed signup
    const { getByPlaceholderText, getAllByPlaceholderText, getAllByText, findByText } = render(
      <SignupScreen />
    );
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getAllByPlaceholderText('••••••••')[0];
    const confirmPasswordInput = getAllByPlaceholderText('••••••••')[1];
    const signupButton = getAllByText('Create Account')[1];

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(signupButton);

    const errorText = await findByText('This email address is already in use.');
    expect(errorText).toBeTruthy();
  });
});
