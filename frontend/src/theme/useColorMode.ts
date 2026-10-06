import { useContext } from 'react';
import { ColorModeContext, type ColorModeContextValue } from './colorModeContext';

/** Current day/night mode plus setters. Must be used inside `AppThemeProvider`. */
export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used inside <AppThemeProvider>');
  }
  return ctx;
}
