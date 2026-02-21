import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../theme/use-app-theme';
import { AppContainer } from './AppContainer';

type ScreenContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentPaddingBottom?: number;
  safeAreaEdges?: Edge[];
};

export const ScreenContainer = ({
  children,
  scroll = true,
  contentPaddingBottom,
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
}: ScreenContainerProps) => {
  const { colors, spacing } = useAppTheme();
  const bottomPadding = contentPaddingBottom ?? spacing.xxl + spacing.xl;

  if (scroll) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={[styles.safe, { backgroundColor: colors.background }]}> 
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <AppContainer>{children}</AppContainer>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.safe, { backgroundColor: colors.background }]}> 
      <View style={styles.scroll}>
        <AppContainer>{children}</AppContainer>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});
