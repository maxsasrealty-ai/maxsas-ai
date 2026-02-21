import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type AppContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
};

export const AppContainer = ({
  children,
  style,
  maxWidth = 900,
  paddingHorizontal,
  paddingVertical,
}: AppContainerProps) => {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          maxWidth,
          paddingHorizontal: paddingHorizontal ?? spacing.md,
          paddingVertical: paddingVertical ?? spacing.md,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
});