import { DEFAULT_LEVELS, DEFAULT_MASTER, SOUND_IDS, SOUNDS_BY_ID } from './sounds';
import type { Levels, SoundId } from './sounds';

/** Every gain change glides over this long, so slider moves never click. */
export const RAMP_MS = 120;
const RAMP_S = RAMP_MS / 1000;

/**
 * Lifecycle of one layer's audio file.
 * idle → nothing fetched yet · loading → fetch/decode in flight · ready → looping · error → gave up
 */
export type LayerStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AmbienceState {
  levels: Levels;
  /** Master volume, 0–100. */
  master: number;
  /** Master transport. */
  playing: boolean;
  status: Record<SoundId, LayerStatus>;
  /** True once a user gesture has created the AudioContext. */
  unlocked: boolean;
}

export interface AmbienceEngine {
  getState(): AmbienceState;
  /** Listener runs after every state change; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
  setLevel(id: SoundId, level: number): void;
  /** Sets all six levels at once (scenes / presets). Does not touch playback. */
  applyLevels(levels: Levels): void;
  setMaster(level: number): void;
  play(): void;
  pause(): void;
  toggle(): void;
  /** Call from inside a user gesture: creates/resumes the AudioContext. */
  unlock(): void;
  /** Resumes a context the browser suspended (e.g. iOS interruption). Never creates one. */
  resumeIfPlaying(): void;
  dispose(): void;
}

export interface AmbienceEngineOptions {
  /** Defaults to `new AudioContext()`. Injected in tests. */
  createContext?: () => AudioContext;
  /** Defaults to the global fetch. */
  fetch?: (url: string) => Promise<Response>;
  /** URL for a layer's file. Defaults to SOUNDS_BY_ID[id].src. */
  soundUrl?: (id: SoundId) => string;
  initialLevels?: Levels;
  initialMaster?: number;
}

/** Clamp to an integer in 0–100; anything unparseable becomes 0. */
export function clampLevel(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Perceptual volume curve: gain = (level / 100)².
 * A square law spreads loudness evenly along the slider (~40 dB of useful range) and,
 * unlike a dB curve, lands exactly on 0 at level 0. It stays usable when the layer and
 * master curves multiply (34% × 72% ≈ −24 dBFS), where a cubic curve gets too quiet.
 */
export function levelToGain(level: number): number {
  const x = clampLevel(level) / 100;
  return x * x;
}

/** Below this, a sample counts as encoder padding rather than sound. */
const SILENCE = 1e-4;
/** MP3 encoders pad at most ~2 frames (2 × 1152 samples); don't scan further than this. */
const MAX_PAD_SAMPLES = 4096;

/**
 * Loop points that skip the digital silence MP3 encoders add at both ends; without this the
 * gap is audible as a tick at every seam.
 */
export function findLoopBounds(buffer: AudioBuffer): { start: number; end: number } {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) =>
    buffer.getChannelData(c),
  );
  const n = buffer.length;
  const loud = (i: number) => channels.some((data) => Math.abs(data[i]) > SILENCE);

  let first = 0;
  while (first < Math.min(MAX_PAD_SAMPLES, n) && !loud(first)) first++;
  let last = n - 1;
  while (last > Math.max(first, n - 1 - MAX_PAD_SAMPLES) && !loud(last)) last--;

  // Nothing audible near the edges at all: loop the whole buffer.
  if (first >= last) return { start: 0, end: buffer.duration };
  return { start: first / buffer.sampleRate, end: (last + 1) / buffer.sampleRate };
}

/** Glide a param from wherever it is now to `target` over RAMP_MS. */
function rampTo(param: AudioParam, target: number, now: number) {
  // cancelAndHoldAtTime keeps a ramp already in flight from jumping; Firefox lacks it.
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(now);
  } else {
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
  }
  param.linearRampToValueAtTime(target, now + RAMP_S);
}

function mapLevels<T>(fn: (id: SoundId) => T): Record<SoundId, T> {
  return Object.fromEntries(SOUND_IDS.map((id) => [id, fn(id)])) as Record<SoundId, T>;
}

export function createAmbienceEngine(options: AmbienceEngineOptions = {}): AmbienceEngine {
  const createContext = options.createContext ?? (() => new AudioContext());
  const doFetch = options.fetch ?? ((url: string) => fetch(url));
  const soundUrl = options.soundUrl ?? ((id: SoundId) => SOUNDS_BY_ID[id].src);
  const initialLevels = options.initialLevels ?? DEFAULT_LEVELS;

  let state: AmbienceState = {
    levels: mapLevels((id) => clampLevel(initialLevels[id] ?? 0)),
    master: clampLevel(options.initialMaster ?? DEFAULT_MASTER),
    playing: false,
    status: mapLevels((): LayerStatus => 'idle'),
    unlocked: false,
  };

  const listeners = new Set<() => void>();
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  const layerGains = {} as Record<SoundId, GainNode>;
  const sources: Partial<Record<SoundId, AudioBufferSourceNode>> = {};
  let suspendTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  // New object per change so useSyncExternalStore sees a fresh snapshot.
  function update(patch: Partial<AmbienceState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }

  function setStatus(id: SoundId, status: LayerStatus) {
    update({ status: { ...state.status, [id]: status } });
  }

  const masterTarget = () => (state.playing ? levelToGain(state.master) : 0);

  function clearSuspendTimer() {
    if (suspendTimer !== null) {
      clearTimeout(suspendTimer);
      suspendTimer = null;
    }
  }

  async function loadLayer(id: SoundId) {
    if (!ctx || state.status[id] !== 'idle') return;
    const context = ctx;
    setStatus(id, 'loading');
    try {
      const response = await doFetch(soundUrl(id));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (disposed) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      // A looping buffer source is sample-accurate at the seam, unlike <audio loop>.
      source.loop = true;
      const { start, end } = findLoopBounds(buffer);
      source.loopStart = start;
      source.loopEnd = end;
      source.connect(layerGains[id]);
      // Fade the layer in from silence so a late-arriving loop doesn't pop in.
      const gain = layerGains[id].gain;
      const now = context.currentTime;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(0, now);
      gain.linearRampToValueAtTime(levelToGain(state.levels[id]), now + RAMP_S);
      source.start(0, start);
      sources[id] = source;
      setStatus(id, 'ready');
    } catch (error) {
      // One broken file must not take the other layers down.
      console.error(`[ambience] could not load "${id}"`, error);
      if (!disposed) setStatus(id, 'error');
    }
  }

  // Lazy preload: a layer's file is fetched the first time its level is above 0
  // while a context exists.
  function loadAudibleLayers() {
    SOUND_IDS.forEach((id) => {
      if (state.levels[id] > 0) void loadLayer(id);
    });
  }

  function ensureContext(): AudioContext | null {
    if (ctx || disposed) return ctx;
    const context = createContext();
    masterGain = context.createGain();
    // Start silent; play() fades the master in.
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);
    SOUND_IDS.forEach((id) => {
      const gain = context.createGain();
      gain.gain.value = levelToGain(state.levels[id]);
      gain.connect(masterGain!);
      layerGains[id] = gain;
    });
    ctx = context;
    update({ unlocked: true });
    // Nothing to hear yet: don't keep the audio thread busy until play().
    if (!state.playing) void context.suspend().catch(() => undefined);
    loadAudibleLayers();
    return context;
  }

  function resume() {
    if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') {
      ctx.resume().catch((error: unknown) => console.error('[ambience] resume failed', error));
    }
  }

  function setLevels(next: Levels) {
    const levels = mapLevels((id) => clampLevel(next[id]));
    update({ levels });
    if (!ctx) return;
    SOUND_IDS.forEach((id) => {
      // Level 0 only silences the layer; buffer and source stay alive for the next unmute.
      rampTo(layerGains[id].gain, levelToGain(levels[id]), ctx!.currentTime);
    });
    loadAudibleLayers();
  }

  const engine: AmbienceEngine = {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    setLevel(id, level) {
      setLevels({ ...state.levels, [id]: level });
    },

    applyLevels(levels) {
      setLevels(levels);
    },

    setMaster(level) {
      update({ master: clampLevel(level) });
      if (ctx && masterGain) rampTo(masterGain.gain, masterTarget(), ctx.currentTime);
    },

    play() {
      if (disposed) return;
      update({ playing: true });
      clearSuspendTimer();
      const context = ensureContext();
      if (!context || !masterGain) return;
      resume();
      rampTo(masterGain.gain, masterTarget(), context.currentTime);
    },

    pause() {
      update({ playing: false });
      if (!ctx || !masterGain) return;
      rampTo(masterGain.gain, 0, ctx.currentTime);
      // Suspend only after the fade-out lands, and only if nobody pressed play meanwhile.
      clearSuspendTimer();
      const context = ctx;
      suspendTimer = setTimeout(() => {
        suspendTimer = null;
        if (!state.playing && context.state === 'running') {
          void context.suspend().catch(() => undefined);
        }
      }, RAMP_MS + 30);
    },

    toggle() {
      if (state.playing) engine.pause();
      else engine.play();
    },

    unlock() {
      ensureContext();
      if (state.playing) resume();
    },

    resumeIfPlaying() {
      if (state.playing) resume();
    },

    dispose() {
      disposed = true;
      clearSuspendTimer();
      SOUND_IDS.forEach((id) => {
        try {
          sources[id]?.stop();
        } catch {
          // Already stopped.
        }
      });
      void ctx?.close().catch(() => undefined);
      ctx = null;
      listeners.clear();
    },
  };

  return engine;
}
