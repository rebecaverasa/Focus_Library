import { DEFAULT_LEVELS, SOUND_IDS } from '@/audio';
import type { Levels, SoundId } from '@/audio';

/** Arrow keys move a slider by 4, Shift+arrow by 10 (DESIGN.md "Interações"). */
export const KEY_STEP = 4;
export const KEY_STEP_SHIFT = 10;

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** A card lights up only while sound is actually playing at a level above zero. */
export const isCardActive = (level: number, playing: boolean): boolean => level > 0 && playing;

/** Layers with a level above zero, regardless of the transport (the prototype does the same). */
export const countOpen = (levels: Levels): number =>
  SOUND_IDS.filter((id) => levels[id] > 0).length;

const NUMBER_WORDS = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export const openCountWord = (count: number): string => NUMBER_WORDS[count] ?? String(count);

/**
 * Fallback scene label while saved scenes are not loaded (offline / first fetch): the
 * opening mix keeps its seed name, any other combination is a custom mix. Once scenes are
 * loaded the label comes from `currentScene` (features/scenes).
 */
export const SEED_SCENE = 'Rainy Reading Room';
export const CUSTOM_SCENE = 'Custom mix';

export const sceneName = (levels: Levels): string =>
  SOUND_IDS.every((id) => levels[id] === DEFAULT_LEVELS[id]) ? SEED_SCENE : CUSTOM_SCENE;

/** Live caption: "{scene} · {n} of six open"; paused always reads "Paused". */
export const sceneCaption = (scene: string, levels: Levels, playing: boolean): string =>
  `${playing ? scene : 'Paused'} · ${openCountWord(countOpen(levels))} of six open`;

/** "66%" or "off" (level 0 or paused). */
export const formatLevel = (level: number, playing: boolean): string =>
  isCardActive(level, playing) ? `${level}%` : 'off';

/** New value for an arrow key, or null for any other key. */
export function nudgeLevel(value: number, key: string, shift: boolean): number | null {
  const step = shift ? KEY_STEP_SHIFT : KEY_STEP;
  if (key === 'ArrowUp' || key === 'ArrowRight') return clamp(value + step);
  if (key === 'ArrowDown' || key === 'ArrowLeft') return clamp(value - step);
  return null;
}

/**
 * Capture-phase keydown handler for a slider: arrows go through `nudgeLevel` (4 / Shift 10)
 * and MUI never sees them; Home/End/PageUp/PageDown stay with MUI.
 */
export const arrowKeyHandler =
  (value: number, onChange: (next: number) => void) =>
  (event: { key: string; shiftKey: boolean; preventDefault(): void; stopPropagation(): void }) => {
    const next = nudgeLevel(value, event.key, event.shiftKey);
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    onChange(next);
  };

/** Level used when a layer is unmuted and never had a non-zero level. */
export const fallbackLevel = (id: SoundId): number =>
  DEFAULT_LEVELS[id] > 0 ? DEFAULT_LEVELS[id] : 50;

/** Last non-zero level per layer, so a muted card can come back to where it was. */
export type LastLevels = Partial<Record<SoundId, number>>;

/** Records every layer that is currently above zero; zeros never overwrite the memory. */
export function rememberLevels(last: LastLevels, levels: Levels): LastLevels {
  let next = last;
  for (const id of SOUND_IDS) {
    if (levels[id] > 0 && last[id] !== levels[id]) next = { ...next, [id]: levels[id] };
  }
  return next;
}

/**
 * Card click: above zero mutes (remembering the level), at zero restores the last non-zero
 * level (or the fallback when there is none). Returns the new level and updated memory.
 */
export function toggleMute(
  id: SoundId,
  level: number,
  last: LastLevels,
): { level: number; last: LastLevels } {
  if (level > 0) return { level: 0, last: { ...last, [id]: level } };
  return { level: last[id] ?? fallbackLevel(id), last };
}
