import { useColorScheme } from 'react-native';

import { Colors, ThemeColors } from './colors';
import { button, radius, shadows, spacing, typography } from './tokens';

export type AppTheme = {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  button: typeof button;
};

export const useAppTheme = (): AppTheme => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
    spacing,
    radius,
    typography,
    shadows,
    button,
  };
};
