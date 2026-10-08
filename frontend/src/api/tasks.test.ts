import type { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ID = '3f1c2b7e-9a4d-4e8b-b2c1-0d5e6f7a8b9c';

describe('tasks api', () => {
  const sent: InternalAxiosRequestConfig[] = [];

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('localStorage', { getItem: () => ID, setItem: () => undefined });
    sent.length = 0;
    const { http } = await import('./http');
    http.defaults.adapter = async (config) => {
      sent.push(config);
      return { data: [], status: 200, statusText: 'OK', headers: {}, config };
    };
  });

  it('lists by date', async () => {
    const { listTasks } = await import('./tasks');
    await listTasks('2026-10-08');
    expect(sent[0].method).toBe('get');
    expect(sent[0].url).toBe('/tasks');
    expect(sent[0].params).toEqual({ date: '2026-10-08' });
  });

  it('creates with title and date', async () => {
    const { createTask } = await import('./tasks');
    await createTask({ title: 'Read', date: '2026-10-08' });
    expect(sent[0].method).toBe('post');
    expect(JSON.parse(sent[0].data)).toEqual({ title: 'Read', date: '2026-10-08' });
  });

  it('patches and deletes by id', async () => {
    const { updateTask, deleteTask } = await import('./tasks');
    await updateTask('abc', { done: true });
    await deleteTask('abc');
    expect(sent[0].method).toBe('patch');
    expect(sent[0].url).toBe('/tasks/abc');
    expect(JSON.parse(sent[0].data)).toEqual({ done: true });
    expect(sent[1].method).toBe('delete');
    expect(sent[1].url).toBe('/tasks/abc');
  });

  it('lists note counts by month', async () => {
    const { listTaskDays } = await import('./tasks');
    await listTaskDays('2026-10');
    expect(sent[0].method).toBe('get');
    expect(sent[0].url).toBe('/tasks/days');
    expect(sent[0].params).toEqual({ month: '2026-10' });
  });
});
