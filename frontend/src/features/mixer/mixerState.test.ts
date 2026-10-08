import { describe, expect, it } from 'vitest';
import { DEFAULT_LEVELS, uniformLevels } from '@/audio';
import {
  countOpen,
  formatLevel,
  isCardActive,
  nudgeLevel,
  openCountWord,
  sceneCaption,
  rememberLevels,
  sceneName,
  toggleMute,
} from './mixerState';

describe('isCardActive', () => {
  it('needs a level above zero and playback', () => {
    expect(isCardActive(40, true)).toBe(true);
    expect(isCardActive(0, true)).toBe(false);
    expect(isCardActive(40, false)).toBe(false);
  });
});

describe('open count and caption', () => {
  it('counts layers above zero', () => {
    expect(countOpen(DEFAULT_LEVELS)).toBe(3);
    expect(countOpen(uniformLevels(0))).toBe(0);
    expect(countOpen(uniformLevels(1))).toBe(6);
  });

  it('spells the count', () => {
    expect(openCountWord(0)).toBe('None');
    expect(openCountWord(3)).toBe('Three');
    expect(openCountWord(6)).toBe('Six');
  });

  it('names the seed mix and custom mixes', () => {
    expect(sceneName(DEFAULT_LEVELS)).toBe('Rainy Reading Room');
    expect(sceneName({ ...DEFAULT_LEVELS, rain: 67 })).toBe('Custom mix');
  });

  it('builds the caption and shows Paused when stopped', () => {
    expect(sceneCaption('Rainy Reading Room', DEFAULT_LEVELS, true)).toBe(
      'Rainy Reading Room · Three of six open',
    );
    expect(sceneCaption('Custom mix', { ...DEFAULT_LEVELS, fire: 10 }, true)).toBe(
      'Custom mix · Four of six open',
    );
    expect(sceneCaption('Rainy Reading Room', DEFAULT_LEVELS, false)).toBe(
      'Paused · Three of six open',
    );
  });
});

describe('formatLevel', () => {
  it('shows the percentage only while active', () => {
    expect(formatLevel(66, true)).toBe('66%');
    expect(formatLevel(0, true)).toBe('off');
    expect(formatLevel(66, false)).toBe('off');
  });
});

describe('nudgeLevel', () => {
  it('moves by 4, or by 10 with Shift', () => {
    expect(nudgeLevel(50, 'ArrowRight', false)).toBe(54);
    expect(nudgeLevel(50, 'ArrowDown', false)).toBe(46);
    expect(nudgeLevel(50, 'ArrowUp', true)).toBe(60);
    expect(nudgeLevel(50, 'ArrowLeft', true)).toBe(40);
  });

  it('clamps to 0-100 and ignores other keys', () => {
    expect(nudgeLevel(98, 'ArrowRight', false)).toBe(100);
    expect(nudgeLevel(3, 'ArrowLeft', false)).toBe(0);
    expect(nudgeLevel(50, 'Home', false)).toBeNull();
  });
});

describe('toggleMute', () => {
  it('mutes to zero and remembers the level', () => {
    expect(toggleMute('rain', 66, {})).toEqual({ level: 0, last: { rain: 66 } });
  });

  it('restores the remembered level', () => {
    const muted = toggleMute('rain', 66, {});
    expect(toggleMute('rain', 0, muted.last).level).toBe(66);
  });

  it('uses the seed level, or 50, when there is no history', () => {
    expect(toggleMute('rain', 0, {}).level).toBe(66);
    expect(toggleMute('fire', 0, {}).level).toBe(50);
  });

  it('restores the last non-zero level after the slider was dragged to 0', () => {
    const last = rememberLevels({}, { ...DEFAULT_LEVELS, rain: 80 });
    const afterDrag = rememberLevels(last, { ...DEFAULT_LEVELS, rain: 0 });
    expect(toggleMute('rain', 0, afterDrag).level).toBe(80);
  });
});

describe('rememberLevels', () => {
  it('keeps the same object when nothing changed', () => {
    const last = rememberLevels({}, DEFAULT_LEVELS);
    expect(rememberLevels(last, DEFAULT_LEVELS)).toBe(last);
  });
});
