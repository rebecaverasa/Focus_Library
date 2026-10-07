import { createContext } from 'react';
import type { ColorMode } from './theme';

export interface ColorModeContextValue {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null);
