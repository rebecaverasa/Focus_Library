import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = 'focus-library:client-id';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

// Fresh module per test so the in-memory cache does not leak between cases.
async function loadModule() {
  vi.resetModules();
  return import('./clientId');
}

describe('getClientId', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates a UUID and persists it on first use', async () => {
    const { getClientId } = await loadModule();
    const id = getClientId();
    expect(id).toMatch(UUID_V4);
    expect(storage.getItem(KEY)).toBe(id);
  });

  it('returns the same id on later calls and after a reload', async () => {
    const first = (await loadModule()).getClientId();
    const { getClientId } = await loadModule();
    expect(getClientId()).toBe(first);
    expect(getClientId()).toBe(first);
  });

  it('reuses an id already saved in localStorage', async () => {
    const saved = '3f1c2b7e-9a4d-4e8b-b2c1-0d5e6f7a8b9c';
    storage.setItem(KEY, saved);
    const { getClientId } = await loadModule();
    expect(getClientId()).toBe(saved);
  });

  it.each(['not-a-uuid', '', '1234', '3f1c2b7e9a4d4e8bb2c10d5e6f7a8b9c'])(
    'replaces an invalid saved value (%j)',
    async (bad) => {
      storage.setItem(KEY, bad);
      const { getClientId } = await loadModule();
      const id = getClientId();
      expect(id).toMatch(UUID_V4);
      expect(id).not.toBe(bad);
      expect(storage.getItem(KEY)).toBe(id);
    },
  );

  it('falls back to an in-memory id when localStorage throws', async () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    vi.stubGlobal('localStorage', broken);
    const { getClientId } = await loadModule();
    const id = getClientId();
    expect(id).toMatch(UUID_V4);
    expect(getClientId()).toBe(id);
  });

  it('builds a v4 UUID when crypto.randomUUID is unavailable', async () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff),
    });
    const { generateClientId } = await loadModule();
    expect(generateClientId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('still builds a v4 UUID without any Web Crypto', async () => {
    vi.stubGlobal('crypto', undefined);
    const { generateClientId } = await loadModule();
    expect(generateClientId()).toMatch(UUID_V4);
  });
});
