import { describe, expect, it } from 'vitest';
import type { Task } from '@/api/tasks';
import { dayLabel, emptyDayName, leftCount, taskMeta, toISODate } from './taskState';

const task = (done: boolean): Task => ({
  id: String(Math.random()),
  title: 't',
  date: '2026-10-08',
  done,
  mins: 0,
  created_at: '',
  updated_at: '',
});

describe('taskState', () => {
  it('formats local dates with zero padding', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('labels today and other days', () => {
    expect(dayLabel('2026-10-08', '2026-10-08')).toBe('Today');
    expect(dayLabel('2026-08-16', '2026-10-08')).toBe('August 16, 2026');
  });

  it('names the empty day by comparison with today', () => {
    expect(emptyDayName('2026-10-07', '2026-10-08')).toBe('this past day');
    expect(emptyDayName('2026-10-09', '2026-10-08')).toBe('this upcoming day');
    expect(emptyDayName('2026-10-08', '2026-10-08')).toBe('today');
  });

  it('counts only unfinished tasks', () => {
    expect(leftCount([task(true), task(false), task(false)])).toBe(2);
    expect(leftCount([])).toBe(0);
  });

  it('describes logged minutes', () => {
    expect(taskMeta({ mins: 50 })).toBe('50m logged');
    expect(taskMeta({ mins: 0 })).toBe('No time logged yet');
  });
});
