import { SOUND_IDS, uniformLevels } from '@/audio';
import type { Levels } from '@/audio';
import type { Preset, PresetInput } from '@/api/presets';

export const CUSTOM_SCENE = 'Custom mix';
export const MAX_NAME = 60;

/** Sounds not named in a seed are 0. */
const mix = (partial: Partial<Levels>): Levels => ({ ...uniformLevels(0), ...partial });

/** The three scenes every new browser starts with (ROADMAP FL-9). Order = creation order. */
export const SEED_SCENES: readonly { name: string; levels: Levels }[] = [
  { name: 'Rainy Reading Room', levels: mix({ rain: 66, pages: 34, clock: 24 }) },
  { name: 'Fireside Night', levels: mix({ fire: 74, rain: 40, pages: 12 }) },
  { name: 'Quiet Stacks', levels: mix({ keys: 46, whispers: 38, pages: 20, clock: 16 }) },
];

export const presetLevels = (preset: Preset): Levels =>
  Object.fromEntries(SOUND_IDS.map((id) => [id, preset[id]])) as Levels;

export const toInput = (name: string, levels: Levels): PresetInput => ({ name, ...levels });

export const sameLevels = (a: Levels, b: Levels): boolean =>
  SOUND_IDS.every((id) => a[id] === b[id]);

/**
 * The scene the live mix currently is: the last loaded one if it still matches, otherwise
 * the first saved scene with identical levels, otherwise none ("Custom mix").
 */
export function currentScene(
  presets: readonly Preset[],
  levels: Levels,
  loadedId: string | null,
): Preset | null {
  const matches = presets.filter((p) => sameLevels(presetLevels(p), levels));
  return matches.find((p) => p.id === loadedId) ?? matches[0] ?? null;
}

export const sceneLabel = (scene: Preset | null): string => scene?.name ?? CUSTOM_SCENE;

/** Trimmed name, or null when empty / too long (the API accepts 1..60). */
export function cleanName(raw: string): string | null {
  const name = raw.trim();
  return name.length >= 1 && name.length <= MAX_NAME ? name : null;
}

/** Sparkline bar height in px: level × 0.13, with a 2px floor so closed layers stay visible. */
export const barHeight = (level: number): number => Math.max(2, Math.round(level * 0.13));
