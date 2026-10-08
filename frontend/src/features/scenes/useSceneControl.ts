import { useState } from 'react';
import type { Preset } from '@/api/presets';
import { sceneName } from '@/features/mixer/mixerState';
import type { Mixer } from '@/features/mixer/useMixer';
import { currentScene, presetLevels, sceneLabel } from './sceneState';
import { useScenes } from './useScenes';

/** Ties saved scenes to the live mixer: which one is loaded, load/save/rename/delete. */
export function useSceneControl(mixer: Mixer) {
  const { levels, applyLevels, play } = mixer;
  const { query, save, rename, remove } = useScenes();
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const presets = query.data ?? [];
  // Matching is by levels, so any manual change drops the label back to "Custom mix".
  const current = currentScene(presets, levels, loadedId);
  // Until scenes arrive (or if the API is down) fall back to the opening-mix heuristic.
  const label = query.data ? sceneLabel(current) : sceneName(levels);

  return {
    presets,
    current,
    label,
    ready: query.isSuccess,
    load: (preset: Preset) => {
      applyLevels(presetLevels(preset));
      play();
      setLoadedId(preset.id);
    },
    saveCurrent: (name: string) =>
      save.mutate({ name, levels }, { onSuccess: (created) => setLoadedId(created.id) }),
    rename: (preset: Preset, name: string) => rename.mutate({ id: preset.id, name }),
    remove: (preset: Preset) => remove.mutate(preset.id),
  };
}
