import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: AppButtonProps) => {
  const { colors, radius, typography, button } = useAppTheme();

  // Primary variant uses the new 'accent' color
  const variantStyle = {
    primary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      textColor: colors.primary, // Using the deep blue for text on gold button
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      textColor: colors.text,
    },
    destructive: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      textColor: '#FFFFFF',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: colors.textMuted,
    },
  }[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderRadius: radius.md,
          height: button.height,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: variantStyle.textColor, fontSize: typography.body }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
});
