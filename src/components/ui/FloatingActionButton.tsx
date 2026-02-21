import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

type FloatingActionButtonProps = {
  onPress: () => void;
};

export const FloatingActionButton = ({ onPress }: FloatingActionButtonProps) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button">
      <Text style={styles.text}>+</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    marginTop: -2,
  },
});
