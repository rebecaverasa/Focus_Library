import type { Task } from '@/api/tasks';

/** Local-calendar ISO date (not UTC), so "today" matches the wall clock. */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** "Today" or e.g. "August 16, 2026". Builds the Date from parts to avoid UTC shifts. */
export function dayLabel(date: string, today: string = todayISO()): string {
  if (date === today) return 'Today';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Copy for the empty state; ISO dates compare correctly as strings. */
export function emptyDayName(date: string, today: string = todayISO()): string {
  if (date === today) return 'today';
  return date < today ? 'this past day' : 'this upcoming day';
}

export function leftCount(tasks: Task[]): number {
  return tasks.filter((t) => !t.done).length;
}

/** Meta line under the title. There is no estimate field, so unlogged tasks say so. */
export function taskMeta(task: Pick<Task, 'mins'>): string {
  return task.mins > 0 ? `${task.mins}m logged` : 'No time logged yet';
}
