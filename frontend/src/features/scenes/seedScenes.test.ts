import type { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ID = '3f1c2b7e-9a4d-4e8b-b2c1-0d5e6f7a8b9c';

describe('loadScenes', () => {
  const sent: InternalAxiosRequestConfig[] = [];
  let stored: Record<string, string>;
  let server: unknown[];

  beforeEach(async () => {
    vi.resetModules();
    stored = { 'focus-library:client-id': ID };
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => {
        stored[k] = v;
      },
    });
    sent.length = 0;
    server = [];
    const { http } = await import('@/api/http');
    http.defaults.adapter = async (config) => {
      sent.push(config);
      let data: unknown = server;
      if (config.method === 'post') {
        // Small delay so concurrent callers really overlap.
        await new Promise((r) => setTimeout(r, 5));
        data = { id: `id-${server.length}`, ...JSON.parse(config.data) };
        server.push(data);
      }
      return { data, status: 200, statusText: 'OK', headers: {}, config };
    };
  });

  const posts = () => sent.filter((c) => c.method === 'post');

  it('creates the three seeds, in order, when the list is empty', async () => {
    const { loadScenes } = await import('./seedScenes');
    const list = await loadScenes();
    expect(list).toHaveLength(3);
    expect(posts().map((c) => JSON.parse(c.data).name)).toEqual([
      'Rainy Reading Room',
      'Fireside Night',
      'Quiet Stacks',
    ]);
  });

  it('does not duplicate when called twice at once (StrictMode)', async () => {
    const { loadScenes } = await import('./seedScenes');
    await Promise.all([loadScenes(), loadScenes()]);
    expect(posts()).toHaveLength(3);
  });

  it('does not seed again after the seeds were created, even if the list is emptied', async () => {
    const { loadScenes } = await import('./seedScenes');
    await loadScenes();
    server.length = 0;
    sent.length = 0;
    expect(await loadScenes()).toEqual([]);
    expect(posts()).toHaveLength(0);
  });

  it('leaves existing scenes alone', async () => {
    server.push({ id: 'x', name: 'Mine' });
    const { loadScenes } = await import('./seedScenes');
    expect(await loadScenes()).toHaveLength(1);
    expect(posts()).toHaveLength(0);
  });
});
