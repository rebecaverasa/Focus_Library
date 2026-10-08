import type { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ID = '3f1c2b7e-9a4d-4e8b-b2c1-0d5e6f7a8b9c';

describe('presets api', () => {
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

  it('lists, creates, renames and deletes', async () => {
    const { listPresets, createPreset, updatePreset, deletePreset } = await import('./presets');
    const levels = { pages: 1, rain: 2, clock: 3, whispers: 4, fire: 5, keys: 6 };
    await listPresets();
    await createPreset({ name: 'Night', ...levels });
    await updatePreset('abc', { name: 'Day' });
    await deletePreset('abc');
    expect(sent.map((c) => [c.method, c.url])).toEqual([
      ['get', '/presets'],
      ['post', '/presets'],
      ['patch', '/presets/abc'],
      ['delete', '/presets/abc'],
    ]);
    expect(JSON.parse(sent[1].data)).toEqual({ name: 'Night', ...levels });
    expect(JSON.parse(sent[2].data)).toEqual({ name: 'Day' });
  });
});
