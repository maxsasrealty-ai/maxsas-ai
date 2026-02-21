export const Colors = {
  light: {
    background: '#F7F9FC', // Almost white, slightly cool
    card: '#FFFFFF',
    surface: '#FFFFFF', // For inputs
    border: '#E0E7FF', // Softer border color
    text: '#111827', // Dark gray for text
    textMuted: '#6B7280', // Lighter gray
    primary: '#0D1B3E', // Deep, dark blue
    primaryDark: '#0A142F', // Even darker blue
    accent: '#D4AF37', // Gold accent
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    info: '#38BDF8',
    overlay: 'rgba(17, 24, 39, 0.4)',
    avatarGlow: 'rgba(212, 175, 55, 0.2)',
  },
  dark: {
    background: '#0A142F', // Very dark blue, almost black
    card: '#0D1B3E', // Deep blue for cards
    surface: '#0D1B3E', // Deep blue for inputs
    border: '#1E293B', // Subtle border
    text: '#F7F9FC', // Off-white text
    textMuted: '#94A3B8',
    primary: '#E0E7FF', // A light, muted blue for primary text in dark mode
    primaryDark: '#C7D2FE',
    accent: '#FBBF24', // A brighter, more vibrant gold for dark mode
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#FB7185',
    info: '#38BDF8',
    overlay: 'rgba(0, 0, 0, 0.6)',
    avatarGlow: 'rgba(251, 191, 36, 0.2)',
  },
};

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
