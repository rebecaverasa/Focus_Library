import { useState } from 'react';
import type { SoundId } from '@/audio';
import { useAmbience } from '@/audio';
import type { LastLevels } from './mixerState';
import { rememberLevels, toggleMute } from './mixerState';

/**
 * Engine state plus the "last non-zero level" memory used by click-to-mute. Call it once
 * (the strip) and pass the result down, so the strip and the sheet share one memory.
 */
export function useMixer() {
  const ambience = useAmbience();
  const { levels, setLevel } = ambience;

  const [last, setLast] = useState<LastLevels>({});
  const remembered = rememberLevels(last, levels);
  if (remembered !== last) setLast(remembered);

  const toggleSound = (id: SoundId) => {
    const result = toggleMute(id, levels[id], last);
    setLast(result.last);
    setLevel(id, result.level);
  };

  return { ...ambience, toggleSound };
}

export type Mixer = ReturnType<typeof useMixer>;
