import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAmbienceEngine, findLoopBounds, levelToGain, RAMP_MS } from './engine';
import type { AmbienceEngineOptions } from './engine';
import { SOUND_IDS, uniformLevels } from './sounds';
import type { SoundId } from './sounds';

// --- Minimal Web Audio fakes -------------------------------------------------------------

class FakeParam {
  value: number;
  calls: Array<[string, ...number[]]> = [];
  constructor(value = 1) {
    this.value = value;
  }
  cancelScheduledValues(t: number) {
    this.calls.push(['cancelScheduledValues', t]);
  }
  setValueAtTime(v: number, t: number) {
    this.calls.push(['setValueAtTime', v, t]);
  }
  linearRampToValueAtTime(v: number, t: number) {
    this.calls.push(['linearRampToValueAtTime', v, t]);
    this.value = v;
  }
  lastRamp() {
    return [...this.calls].reverse().find((c) => c[0] === 'linearRampToValueAtTime');
  }
}

class FakeGain {
  gain = new FakeParam();
  connect = vi.fn();
}

class FakeSource {
  buffer: unknown = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

function fakeBuffer(samples: number[], sampleRate = 1000) {
  const data = Float32Array.from(samples);
  return {
    numberOfChannels: 1,
    length: data.length,
    sampleRate,
    duration: data.length / sampleRate,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}

class FakeContext {
  state: AudioContextState = 'running';
  currentTime = 10;
  destination = {};
  gains: FakeGain[] = [];
  sources: FakeSource[] = [];
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  close = vi.fn(async () => {
    this.state = 'closed';
  });
  decodeAudioData = vi.fn(async (data: ArrayBuffer) => {
    if (data.byteLength === 0) throw new Error('decode failed');
    return fakeBuffer([0, 0, 0.5, 0.4, 0.3, 0]);
  });
  createGain() {
    const g = new FakeGain();
    this.gains.push(g);
    return g;
  }
  createBufferSource() {
    const s = new FakeSource();
    this.sources.push(s);
    return s;
  }
}

/** gains[0] is the master; the next six follow SOUND_IDS order. */
const layerGain = (ctx: FakeContext, id: SoundId) => ctx.gains[1 + SOUND_IDS.indexOf(id)];
const masterGain = (ctx: FakeContext) => ctx.gains[0];

const okResponse = (bytes = 8) =>
  ({ ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(bytes) }) as Response;

// Let pending fetch/decode promises settle.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(overrides: AmbienceEngineOptions = {}) {
  const contexts: FakeContext[] = [];
  const fetchMock = vi.fn(async (url: string) => {
    void url;
    return okResponse();
  });
  const engine = createAmbienceEngine({
    createContext: () => {
      const c = new FakeContext();
      contexts.push(c);
      return c as unknown as AudioContext;
    },
    fetch: fetchMock,
    soundUrl: (id) => `/sounds/${id}.mp3`,
    initialLevels: uniformLevels(0),
    initialMaster: 80,
    ...overrides,
  });
  return { engine, contexts, fetchMock, ctx: () => contexts[0] };
}

const fetchedUrls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map((call) => call[0]);

// --- Tests -------------------------------------------------------------------------------

describe('levelToGain (perceptual curve)', () => {
  it('maps 0 to silence and 100 to unity', () => {
    expect(levelToGain(0)).toBe(0);
    expect(levelToGain(100)).toBe(1);
  });

  it('is strictly increasing across the slider', () => {
    for (let level = 1; level <= 100; level++) {
      expect(levelToGain(level)).toBeGreaterThan(levelToGain(level - 1));
    }
  });

  it('is quieter than linear in the middle (perceptual, not linear)', () => {
    expect(levelToGain(50)).toBeCloseTo(0.25);
  });

  it('clamps out-of-range and invalid input', () => {
    expect(levelToGain(-20)).toBe(0);
    expect(levelToGain(250)).toBe(1);
    expect(levelToGain(Number.NaN)).toBe(0);
  });
});

describe('findLoopBounds', () => {
  it('skips the silent encoder padding at both ends', () => {
    const { start, end } = findLoopBounds(fakeBuffer([0, 0, 0.5, -0.2, 0.3, 0, 0], 1000));
    expect(start).toBeCloseTo(0.002);
    expect(end).toBeCloseTo(0.005);
  });

  it('loops the whole buffer when there is nothing to trim', () => {
    expect(findLoopBounds(fakeBuffer([0.1, 0.2, 0.3], 1000))).toEqual({ start: 0, end: 0.003 });
  });
});

describe('ambience engine', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  it('creates no AudioContext before a user gesture', () => {
    const { engine, contexts } = setup({ initialLevels: { ...uniformLevels(0), rain: 60 } });
    engine.setLevel('pages', 40);
    engine.setMaster(50);
    expect(contexts).toHaveLength(0);
    expect(engine.getState().unlocked).toBe(false);
  });

  it('builds one gain per layer into a master gain on unlock', () => {
    const { engine, ctx } = setup();
    engine.unlock();
    const c = ctx();
    expect(c.gains).toHaveLength(7);
    expect(masterGain(c).connect).toHaveBeenCalledWith(c.destination);
    SOUND_IDS.forEach((id) => expect(layerGain(c, id).connect).toHaveBeenCalledWith(masterGain(c)));
    expect(engine.getState().unlocked).toBe(true);
  });

  it('resumes a suspended context on the gesture when playing', () => {
    const { engine, ctx } = setup();
    engine.unlock();
    const c = ctx();
    c.state = 'suspended';
    c.resume.mockClear();

    engine.play();
    expect(c.resume).toHaveBeenCalledTimes(1);

    c.state = 'suspended';
    engine.unlock();
    expect(c.resume).toHaveBeenCalledTimes(2);
  });

  it('play() from a click creates the context and fades the master in', () => {
    const { engine, ctx } = setup();
    engine.play();
    const c = ctx();
    expect(engine.getState().playing).toBe(true);
    expect(masterGain(c).gain.lastRamp()).toEqual([
      'linearRampToValueAtTime',
      levelToGain(80),
      c.currentTime + RAMP_MS / 1000,
    ]);
  });

  it('ramps every level change over 120ms', () => {
    const { engine, ctx } = setup();
    engine.play();
    const c = ctx();
    c.currentTime = 42;

    engine.setLevel('rain', 66);
    expect(layerGain(c, 'rain').gain.lastRamp()).toEqual([
      'linearRampToValueAtTime',
      levelToGain(66),
      42 + 0.12,
    ]);

    engine.setMaster(30);
    expect(masterGain(c).gain.lastRamp()).toEqual([
      'linearRampToValueAtTime',
      levelToGain(30),
      42 + 0.12,
    ]);
  });

  it('pause fades the master to 0 and suspends only after the ramp', () => {
    vi.useFakeTimers();
    const { engine, ctx } = setup();
    engine.play();
    const c = ctx();
    engine.pause();
    expect(masterGain(c).gain.lastRamp()?.[1]).toBe(0);
    expect(c.suspend).not.toHaveBeenCalled();
    vi.advanceTimersByTime(RAMP_MS + 50);
    expect(c.suspend).toHaveBeenCalledTimes(1);
  });

  it('does not suspend if play is pressed again during the fade-out', () => {
    vi.useFakeTimers();
    const { engine, ctx } = setup();
    engine.play();
    engine.pause();
    engine.toggle();
    vi.advanceTimersByTime(RAMP_MS + 50);
    expect(ctx().suspend).not.toHaveBeenCalled();
    expect(engine.getState().playing).toBe(true);
  });

  it('does not fetch a layer before its level first goes above 0', async () => {
    const { engine, fetchMock } = setup();
    engine.play();
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();

    engine.setLevel('fire', 20);
    await flush();
    expect(fetchedUrls(fetchMock)).toEqual(['/sounds/fire.mp3']);
    expect(engine.getState().status.fire).toBe('ready');
    expect(engine.getState().status.rain).toBe('idle');
  });

  it('defers fetching non-zero initial levels until the context exists', async () => {
    const { engine, fetchMock } = setup({ initialLevels: { ...uniformLevels(0), rain: 66 } });
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
    engine.unlock();
    await flush();
    expect(fetchedUrls(fetchMock)).toEqual(['/sounds/rain.mp3']);
  });

  it('fetches each file once, however many times the level changes', async () => {
    const { engine, fetchMock } = setup();
    engine.play();
    engine.setLevel('rain', 10);
    engine.setLevel('rain', 50);
    await flush();
    engine.setLevel('rain', 0);
    engine.setLevel('rain', 80);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('starts a seamless looping buffer source per loaded layer', async () => {
    const { engine, ctx } = setup();
    engine.play();
    engine.setLevel('clock', 24);
    await flush();
    const [source] = ctx().sources;
    expect(source.loop).toBe(true);
    expect(source.connect).toHaveBeenCalledWith(layerGain(ctx(), 'clock'));
    expect(source.start).toHaveBeenCalledTimes(1);
    expect(source.loopEnd).toBeGreaterThan(source.loopStart);
  });

  it('level 0 silences the layer but keeps its source and buffer', async () => {
    const { engine, ctx } = setup();
    engine.play();
    engine.setLevel('keys', 46);
    await flush();
    const c = ctx();
    const [source] = c.sources;

    engine.setLevel('keys', 0);
    expect(layerGain(c, 'keys').gain.lastRamp()?.[1]).toBe(0);
    expect(source.stop).not.toHaveBeenCalled();
    expect(source.buffer).not.toBeNull();
    expect(engine.getState().status.keys).toBe('ready');
  });

  it('a layer that fails to load does not affect the others', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('whispers')) return { ok: false, status: 404 } as Response;
      if (url.includes('fire')) return okResponse(0); // decode will reject
      return okResponse();
    });
    const { engine, ctx } = setup({ fetch: fetchMock });
    engine.play();
    engine.applyLevels({ pages: 20, rain: 0, clock: 16, whispers: 38, fire: 50, keys: 46 });
    await flush();

    const { status } = engine.getState();
    expect(status.whispers).toBe('error');
    expect(status.fire).toBe('error');
    expect(status.pages).toBe('ready');
    expect(status.clock).toBe('ready');
    expect(status.keys).toBe('ready');
    expect(ctx().sources).toHaveLength(3);
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('applyLevels sets all six levels at once and clamps them', () => {
    const { engine } = setup();
    engine.applyLevels({ pages: 12, rain: 40, clock: 0, whispers: -5, fire: 74.4, keys: 300 });
    expect(engine.getState().levels).toEqual({
      pages: 12,
      rain: 40,
      clock: 0,
      whispers: 0,
      fire: 74,
      keys: 100,
    });
  });

  it('notifies subscribers with a fresh snapshot on every change', () => {
    const { engine } = setup();
    const listener = vi.fn();
    const before = engine.getState();
    const unsubscribe = engine.subscribe(listener);
    engine.setLevel('rain', 30);
    expect(listener).toHaveBeenCalled();
    expect(engine.getState()).not.toBe(before);
    unsubscribe();
    listener.mockClear();
    engine.setMaster(10);
    expect(listener).not.toHaveBeenCalled();
  });
});
