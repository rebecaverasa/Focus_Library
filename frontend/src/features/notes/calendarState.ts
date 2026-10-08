import { toISODate } from './taskState';

export function parseISO(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d };
}

/** "YYYY-MM" key of an ISO date; matches the /tasks/days query and the cache key. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Moves a YYYY-MM key by whole months (negative = back). */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toISODate(d).slice(0, 7);
}

/** Moves an ISO date by whole days using local-calendar math (no UTC shifts). */
export function shiftDay(date: string, delta: number): string {
  const { y, m, d } = parseISO(date);
  return toISODate(new Date(y, m - 1, d + delta));
}

/** "August 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Cells of a Monday-first month grid: `null` pads the first week, then one ISO date per day.
 */
export function monthCells(month: string): (string | null)[] {
  const [y, m] = month.split('-').map(Number);
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const days = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d += 1) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  return cells;
}

/** Arrow-key movement in the grid: left/right = day, up/down = week. */
export function keyDelta(key: string): number | null {
  switch (key) {
    case 'ArrowLeft':
      return -1;
    case 'ArrowRight':
      return 1;
    case 'ArrowUp':
      return -7;
    case 'ArrowDown':
      return 7;
    default:
      return null;
  }
}
