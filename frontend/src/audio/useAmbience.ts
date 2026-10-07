import { use, useSyncExternalStore } from 'react';
import { AmbienceContext } from './ambienceContext';
import type { AmbienceEngine, AmbienceState } from './engine';

export type UseAmbience = AmbienceState &
  Pick<AmbienceEngine, 'setLevel' | 'applyLevels' | 'setMaster' | 'play' | 'pause' | 'toggle'>;

/** Mixer state + actions. Actions are stable (bound to the single engine). */
export function useAmbience(): UseAmbience {
  const engine = use(AmbienceContext);
  if (!engine) throw new Error('useAmbience must be used inside <AmbienceProvider>');
  const state = useSyncExternalStore(engine.subscribe, engine.getState);
  return {
    ...state,
    setLevel: engine.setLevel,
    applyLevels: engine.applyLevels,
    setMaster: engine.setMaster,
    play: engine.play,
    pause: engine.pause,
    toggle: engine.toggle,
  };
}
