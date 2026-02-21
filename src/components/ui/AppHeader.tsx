import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
};

export const AppHeader = ({
  title,
  subtitle,
  rightSlot,
  showBackButton = false,
  onBackPress,
}: AppHeaderProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();
  const router = useRouter();
  const canShowBackButton = showBackButton && (Boolean(onBackPress) || router.canGoBack());

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {canShowBackButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: radius.md,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.h3 }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted, marginTop: spacing.xs, fontSize: typography.caption }]}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 6,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {},
});
