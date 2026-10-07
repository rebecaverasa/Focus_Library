import { createContext } from 'react';
import type { AmbienceEngine } from './engine';

/** The app-wide engine; provided by <AmbienceProvider>. */
export const AmbienceContext = createContext<AmbienceEngine | null>(null);
