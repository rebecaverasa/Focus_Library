import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AmbienceContext } from './ambienceContext';
import { createAmbienceEngine } from './engine';
import type { AmbienceEngine } from './engine';
import { onFirstGesture } from './gesture';

interface AmbienceProviderProps {
  children: ReactNode;
  /** Injected in tests / stories; defaults to a real Web Audio engine. */
  engine?: AmbienceEngine;
}

/**
 * Owns the single audio engine for the app. Lives above the router so sound keeps playing
 * across views. The engine is never disposed here: StrictMode remounts would kill the audio.
 */
export function AmbienceProvider({ children, engine: injected }: AmbienceProviderProps) {
  const [engine] = useState(() => injected ?? createAmbienceEngine());

  // The AudioContext may only be created inside a user gesture (no autoplay warnings).
  useEffect(() => {
    if (engine.getState().unlocked) return undefined;
    return onFirstGesture(window, () => engine.unlock());
  }, [engine]);

  // Browsers keep Web Audio running in hidden tabs; this only recovers from an OS-level
  // interruption (e.g. iOS phone call) when the user comes back.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') engine.resumeIfPlaying();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [engine]);

  return <AmbienceContext value={engine}>{children}</AmbienceContext>;
}
