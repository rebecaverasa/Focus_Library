import { getClientId } from '@/api/clientId';
import { createPreset, listPresets } from '@/api/presets';
import type { Preset } from '@/api/presets';
import { SEED_SCENES, toInput } from './sceneState';

// One in-flight load per page: StrictMode double mounts and parallel callers share it.
let inFlight: Promise<Preset[]> | null = null;

const seededKey = () => `focus-library:scenes-seeded:${getClientId()}`;

function wasSeeded(): boolean {
  try {
    return localStorage.getItem(seededKey()) === '1';
  } catch {
    return false;
  }
}

function markSeeded(): void {
  try {
    localStorage.setItem(seededKey(), '1');
  } catch {
    // Storage unavailable: the in-flight guard still covers this page load.
  }
}

async function load(): Promise<Preset[]> {
  const existing = await listPresets();
  // Seed only once per browser and only on an empty list, so deleting every scene sticks.
  if (existing.length > 0 || wasSeeded()) {
    if (existing.length > 0) markSeeded();
    return existing;
  }
  // Sequential on purpose: the API orders by creation time, which keeps the seed order.
  const created: Preset[] = [];
  for (const seed of SEED_SCENES) {
    created.push(await createPreset(toInput(seed.name, seed.levels)));
  }
  markSeeded();
  return created;
}

/** Lists the client's scenes, creating the three seeds the first time the list is empty. */
export function loadScenes(): Promise<Preset[]> {
  inFlight ??= load().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
