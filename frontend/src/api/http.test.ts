import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SAVED_ID = '3f1c2b7e-9a4d-4e8b-b2c1-0d5e6f7a8b9c';

// Captures the outgoing request instead of hitting the network.
function captureAdapter(sink: InternalAxiosRequestConfig[]): AxiosAdapter {
  return async (config) => {
    sink.push(config);
    return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
  };
}

describe('http client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('localStorage', {
      getItem: () => SAVED_ID,
      setItem: () => undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the X-Client-Id header to every request', async () => {
    const { http } = await import('./http');
    const sent: InternalAxiosRequestConfig[] = [];
    http.defaults.adapter = captureAdapter(sent);

    await http.get('/clients/me');
    await http.post('/anything', { a: 1 });

    expect(sent).toHaveLength(2);
    for (const config of sent) expect(config.headers.get('X-Client-Id')).toBe(SAVED_ID);
  });

  it('uses http://localhost:8000 when VITE_API_URL is not set', async () => {
    vi.stubEnv('VITE_API_URL', '');
    const { http } = await import('./http');
    expect(http.defaults.baseURL).toBe('http://localhost:8000');
    vi.unstubAllEnvs();
  });

  it('getCurrentClient calls GET /clients/me and returns the body', async () => {
    const { http } = await import('./http');
    const { getCurrentClient } = await import('./clients');
    const body = {
      id: SAVED_ID,
      created_at: '2026-10-07T12:00:00Z',
      last_seen_at: '2026-10-07T12:00:00Z',
    };
    const sent: InternalAxiosRequestConfig[] = [];
    http.defaults.adapter = async (config) => {
      sent.push(config);
      return { data: body, status: 200, statusText: 'OK', headers: {}, config };
    };

    await expect(getCurrentClient()).resolves.toEqual(body);
    expect(sent[0].method).toBe('get');
    expect(sent[0].url).toBe('/clients/me');
    expect(sent[0].headers.get('X-Client-Id')).toBe(SAVED_ID);
  });
});
