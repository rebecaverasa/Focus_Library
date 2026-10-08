import { describe, expect, it } from 'vitest';
import { DEFAULT_LEVELS } from '@/audio';
import type { Preset } from '@/api/presets';
import {
  SEED_SCENES,
  barHeight,
  cleanName,
  currentScene,
  presetLevels,
  sceneLabel,
  toInput,
} from './sceneState';

const preset = (id: string, name: string, levels = DEFAULT_LEVELS): Preset => ({
  id,
  name,
  ...levels,
});

describe('seed scenes', () => {
  it('matches the spec, with unnamed sounds at 0', () => {
    expect(SEED_SCENES.map((s) => s.name)).toEqual([
      'Rainy Reading Room',
      'Fireside Night',
      'Quiet Stacks',
    ]);
    expect(SEED_SCENES[0].levels).toEqual(DEFAULT_LEVELS);
    expect(SEED_SCENES[1].levels).toEqual({
      pages: 12,
      rain: 40,
      clock: 0,
      whispers: 0,
      fire: 74,
      keys: 0,
    });
    expect(SEED_SCENES[2].levels).toEqual({
      pages: 20,
      rain: 0,
      clock: 16,
      whispers: 38,
      fire: 0,
      keys: 46,
    });
  });
});

describe('currentScene', () => {
  const rainy = preset('a', 'Rainy Reading Room');
  const twin = preset('b', 'Twin');
  const fire = preset('c', 'Fire', { ...DEFAULT_LEVELS, fire: 74 });

  it('is the scene whose levels equal the live mix', () => {
    expect(currentScene([rainy, fire], DEFAULT_LEVELS, null)).toBe(rainy);
  });

  it('prefers the loaded scene among identical ones', () => {
    expect(currentScene([rainy, twin], DEFAULT_LEVELS, 'b')).toBe(twin);
    expect(currentScene([rainy, twin], DEFAULT_LEVELS, null)).toBe(rainy);
  });

  it('is null (Custom mix) after any manual change', () => {
    const live = { ...DEFAULT_LEVELS, rain: 67 };
    const scene = currentScene([rainy], live, 'a');
    expect(scene).toBeNull();
    expect(sceneLabel(scene)).toBe('Custom mix');
  });
});

describe('helpers', () => {
  it('reads and writes the six levels', () => {
    const p = preset('a', 'X');
    expect(presetLevels(p)).toEqual(DEFAULT_LEVELS);
    expect(toInput('X', DEFAULT_LEVELS)).toEqual({ name: 'X', ...DEFAULT_LEVELS });
  });

  it('validates names (trimmed, 1..60)', () => {
    expect(cleanName('  Night  ')).toBe('Night');
    expect(cleanName('   ')).toBeNull();
    expect(cleanName('x'.repeat(60))).toHaveLength(60);
    expect(cleanName('x'.repeat(61))).toBeNull();
  });

  it('scales bars by level x 0.13 with a visible floor', () => {
    expect(barHeight(100)).toBe(13);
    expect(barHeight(66)).toBe(9);
    expect(barHeight(0)).toBe(2);
  });
});
