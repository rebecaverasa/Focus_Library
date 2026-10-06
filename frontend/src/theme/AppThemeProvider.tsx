import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme, type ColorMode } from './theme';
import { ColorModeContext } from './colorModeContext';

const STORAGE_KEY = 'focus-library:color-mode';

function readStoredMode(): ColorMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'day' || value === 'night' ? value : null;
  } catch {
    return null;
  }
}

function getInitialMode(): ColorMode {
  const stored = readStoredMode();
  if (stored) return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

/**
 * Wraps the app in the Focus Library theme (ThemeProvider + CssBaseline) and
 * exposes day/night through `useColorMode()`.
 *
 * First load follows `prefers-color-scheme`; once the user picks a mode it is
 * remembered. For now that lives in localStorage — syncing it to the user
 * profile comes once the backend has users (BE-8).
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(getInitialMode);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the choice just won't persist.
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'day' ? 'night' : 'day');
  }, [mode, setMode]);

  // Follow OS changes only while the user hasn't made an explicit choice.
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => {
      if (!readStoredMode()) setModeState(event.matches ? 'night' : 'day');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
