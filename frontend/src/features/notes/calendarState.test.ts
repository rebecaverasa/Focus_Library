import { describe, expect, it } from 'vitest';
import {
  keyDelta,
  monthCells,
  monthLabel,
  monthOf,
  monthWeeks,
  shiftDay,
  shiftMonth,
} from './calendarState';

describe('calendarState', () => {
  it('derives and shifts month keys across years', () => {
    expect(monthOf('2026-08-17')).toBe('2026-08');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('shifts days across month and year edges', () => {
    expect(shiftDay('2026-08-31', 1)).toBe('2026-09-01');
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDay('2026-08-17', 7)).toBe('2026-08-24');
  });

  it('labels months in English', () => {
    expect(monthLabel('2026-08')).toBe('August 2026');
  });

  it('builds a Monday-first grid (August 2026 starts on a Saturday)', () => {
    const cells = monthCells('2026-08');
    expect(cells.slice(0, 5).every((c) => c === null)).toBe(true);
    expect(cells[4]).toBeNull();
    expect(cells[5]).toBe('2026-08-01');
    expect(cells).toHaveLength(5 + 31);
  });

  it('has no padding when the month starts on Monday', () => {
    expect(monthCells('2026-06')[0]).toBe('2026-06-01');
  });

  it('maps arrow keys to day deltas', () => {
    expect(keyDelta('ArrowLeft')).toBe(-1);
    expect(keyDelta('ArrowDown')).toBe(7);
    expect(keyDelta('Enter')).toBeNull();
  });

  it('splits the grid into rows of 7 that keep every day exactly once', () => {
    const weeks = monthWeeks('2026-08');
    expect(weeks).toHaveLength(6);
    expect(weeks.slice(0, -1).every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter((c) => c !== null)).toHaveLength(31);
    expect(weeks[0][5]).toBe('2026-08-01');
  });
});
