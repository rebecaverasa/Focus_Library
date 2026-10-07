// Anonymous browser identity (v1 has no login): one UUID per browser, sent as X-Client-Id.
export const CLIENT_ID_STORAGE_KEY = 'focus-library:client-id';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cached for the page's lifetime; also the only copy when localStorage is unavailable.
let cachedId: string | null = null;

export function isValidClientId(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function randomBytes(): Uint8Array {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    // Last resort: the id only separates browsers, it is not a secret.
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function generateClientId(): string {
  // randomUUID only exists in secure contexts (e.g. not on http://192.168.x.x).
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = randomBytes();
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readStored(): string | null {
  try {
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  } catch {
    // Storage disabled (privacy mode, sandboxed iframe): fall back to the in-memory id.
    return null;
  }
}

function writeStored(id: string): void {
  try {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
  } catch {
    // Quota or access error: the id still works for this session, just not across reloads.
  }
}

/** Returns this browser's client id, creating and persisting one on first use. */
export function getClientId(): string {
  if (cachedId) return cachedId;

  const stored = readStored();
  if (isValidClientId(stored)) {
    cachedId = stored;
    return stored;
  }

  // Missing or tampered value: the backend answers 400 to non-UUIDs, so replace it.
  const id = generateClientId();
  writeStored(id);
  cachedId = id;
  return id;
}
