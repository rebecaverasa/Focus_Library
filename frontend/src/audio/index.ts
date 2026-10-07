export { AmbienceProvider } from './AmbienceProvider';
export { useAmbience } from './useAmbience';
export type { UseAmbience } from './useAmbience';
export { createAmbienceEngine, levelToGain, RAMP_MS } from './engine';
export type { AmbienceEngine, AmbienceState, LayerStatus } from './engine';
export {
  DEFAULT_LEVELS,
  DEFAULT_MASTER,
  SOUND_IDS,
  SOUNDS,
  SOUNDS_BY_ID,
  uniformLevels,
} from './sounds';
export type { Levels, SoundDef, SoundId } from './sounds';
