import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/store/settings';
import {
  ColorScheme,
  ThemeColors,
  elevation,
  motion,
  radius,
  severityScale,
  spacing,
  themes,
  typography,
} from './tokens';

type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  severityScale: typeof severityScale;
  elevation: (level: 1 | 2 | 3) => object;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettings((s) => s.themePreference);

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  const value = useMemo<Theme>(
    () => ({
      scheme,
      colors: themes[scheme],
      spacing,
      radius,
      typography,
      motion,
      severityScale,
      elevation: (level) => elevation(scheme, level),
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme doit être utilisé à l’intérieur de <ThemeProvider />');
  return theme;
}
