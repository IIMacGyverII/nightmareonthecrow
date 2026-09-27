/**
 * The Sound of the Crow — a tiny Web Audio synth that builds the trail's
 * soundscape from nothing but noise buffers and oscillators. No audio files.
 *
 * Graph (per channel):
 *   sources → shaping → channel gain → channel analyser (for its meter) → master
 * Master:
 *   master gain → master analyser (for the visualizer) → destination
 *
 * Everything is created lazily inside `AmbienceEngine`, which is only
 * constructed from a user gesture (the PLAY button). `dispose()` stops every
 * source, clears every timer and closes the context.
 */

export const CHANNEL_IDS = ["wind", "crows", "heartbeat", "corn", "fog"] as const;
export type ChannelId = (typeof CHANNEL_IDS)[number];

export interface ChannelState {
  on: boolean;
  /** 0–100 */
  level: number;
}
export type Channels = Record<ChannelId, ChannelState>;

export interface Mix {
  channels: Channels;
  /** Master FEAR knob, 0–100. Scales heartbeat tempo, crow frequency and wind intensity. */
  fear: number;
}

export const CHANNEL_META: Record<ChannelId, { label: string; hint: string; fearLinked: boolean }> = {
  wind: { label: "Wind", hint: "Filtered noise, slow LFO on the cutoff", fearLinked: true },
  crows: { label: "Crows", hint: "FM caws at random intervals, pitch randomized", fearLinked: true },
  heartbeat: { label: "Heartbeat", hint: "Two low sine thumps. Tempo follows FEAR", fearLinked: true },
  corn: { label: "Corn rustle", hint: "Bandpassed noise crackle", fearLinked: false },
  fog: { label: "Fog machine", hint: "Low hiss with a periodic swell", fearLinked: false },
};

export const DEFAULT_MIX: Mix = {
  channels: {
    wind: { on: true, level: 45 },
    crows: { on: true, level: 40 },
    heartbeat: { on: true, level: 35 },
    corn: { on: true, level: 30 },
    fog: { on: true, level: 25 },
  },
  fear: 35,
};

type AudioContextCtor = typeof AudioContext;

function getContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  // `typeof` on an undeclared global is safe; it just yields "undefined".
  if (typeof AudioContext === "function") return AudioContext;
  const w = window as unknown as { webkitAudioContext?: AudioContextCtor };
  if (typeof w.webkitAudioContext === "function") return w.webkitAudioContext;
  return null;
}

/** True when this browser can build the audio graph at all. */
export function isWebAudioSupported(): boolean {
  return getContextCtor() !== null;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
/** Smoothing constant used for every parameter change so nothing clicks. */
const SMOOTH = 0.08;

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Schedules a callback and remembers it so `dispose()` can cancel it. */
type Later = (ms: number, fn: () => void) => void;

interface Channel {
  out: GainNode;
  /** level is already 0–1 and 0 when the channel is switched off. fear is 0–1. */
  update(level: number, fear: number): void;
  dispose(): void;
}

function safeDisconnect(node: AudioNode) {
  try {
    node.disconnect();
  } catch {
    /* already disconnected */
  }
}

function stopSafely(node: AudioScheduledSourceNode, when?: number) {
  try {
    node.stop(when);
  } catch {
    /* never started or already stopped */
  }
}

/* ------------------------------------------------------------------ WIND */
function makeWind(ctx: AudioContext, noise: AudioBuffer): Channel {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 320;
  filter.Q.value = 1.4;

  // Slow LFO sweeping the cutoff: the "howl".
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.1;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 160;
  lfo.connect(lfoDepth).connect(filter.frequency);

  // A second, slower LFO on amplitude: gusts.
  const gust = ctx.createOscillator();
  gust.type = "triangle";
  gust.frequency.value = 0.045;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 0;
  const body = ctx.createGain();
  body.gain.value = 0.7;
  gust.connect(gustDepth).connect(body.gain);

  const out = ctx.createGain();
  out.gain.value = 0;
  src.connect(filter).connect(body).connect(out);
  src.start();
  lfo.start();
  gust.start();

  return {
    out,
    update(level, fear) {
      const t = ctx.currentTime;
      // More fear: brighter, faster, deeper sweep. Base always exceeds depth so the cutoff stays positive.
      filter.frequency.setTargetAtTime(300 + 900 * fear, t, 0.4);
      lfoDepth.gain.setTargetAtTime(150 + 600 * fear, t, 0.4);
      lfo.frequency.setTargetAtTime(0.08 + 0.3 * fear, t, 0.4);
      gustDepth.gain.setTargetAtTime(0.25 * level, t, SMOOTH);
      out.gain.setTargetAtTime(level * 0.9, t, SMOOTH);
    },
    dispose() {
      stopSafely(src);
      stopSafely(lfo);
      stopSafely(gust);
      [src, filter, lfo, lfoDepth, gust, gustDepth, body, out].forEach(safeDisconnect);
    },
  };
}

/* ----------------------------------------------------------------- CROWS */
function makeCrows(ctx: AudioContext, noise: AudioBuffer, later: Later): Channel {
  const out = ctx.createGain();
  out.gain.value = 0;
  let level = 0;
  let fear = 0;
  let alive = true;

  /** One caw: FM sawtooth with a downward glide plus a breathy bandpassed noise burst. */
  const caw = (t: number, pitch: number) => {
    const dur = rand(0.16, 0.3);
    const carrier = ctx.createOscillator();
    carrier.type = "sawtooth";
    carrier.frequency.setValueAtTime(pitch, t);
    carrier.frequency.exponentialRampToValueAtTime(pitch * 0.65, t + dur);

    const modulator = ctx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.value = pitch * rand(0.8, 1.7);
    const modDepth = ctx.createGain();
    modDepth.gain.value = pitch * 0.9;
    modulator.connect(modDepth).connect(carrier.frequency);

    const shape = ctx.createBiquadFilter();
    shape.type = "bandpass";
    shape.frequency.value = pitch * 2.2;
    shape.Q.value = 1.6;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.55, t + 0.02);
    env.gain.setValueAtTime(0.55, t + dur * 0.55);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const breath = ctx.createBufferSource();
    breath.buffer = noise;
    breath.loop = true;
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = "bandpass";
    breathFilter.frequency.value = pitch * 3;
    breathFilter.Q.value = 3;
    const breathEnv = ctx.createGain();
    breathEnv.gain.setValueAtTime(0.0001, t);
    breathEnv.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
    breathEnv.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    carrier.connect(shape).connect(env).connect(out);
    breath.connect(breathFilter).connect(breathEnv).connect(out);

    const end = t + dur + 0.05;
    carrier.start(t);
    modulator.start(t);
    breath.start(t);
    carrier.stop(end);
    modulator.stop(end);
    breath.stop(end);
    carrier.onended = () => [carrier, modulator, modDepth, shape, env, breath, breathFilter, breathEnv].forEach(safeDisconnect);
  };

  /** A burst of 1–3 caws from one bird, then wait a fear-scaled random gap. */
  const burst = () => {
    if (!alive) return;
    if (level > 0) {
      const count = 1 + Math.floor(rand(0, 3));
      const pitch = rand(480, 980);
      let t = ctx.currentTime + 0.05;
      for (let i = 0; i < count; i++) {
        caw(t, pitch * rand(0.92, 1.08));
        t += rand(0.22, 0.42);
      }
    }
    const gap = rand(2.5, 7.5) * (1 - 0.75 * fear) + 0.4;
    later(gap * 1000, burst);
  };
  later(600, burst);

  return {
    out,
    update(nextLevel, nextFear) {
      level = nextLevel;
      fear = nextFear;
      out.gain.setTargetAtTime(nextLevel * 0.8, ctx.currentTime, SMOOTH);
    },
    dispose() {
      alive = false;
      safeDisconnect(out);
    },
  };
}

/* ------------------------------------------------------------- HEARTBEAT */
function makeHeartbeat(ctx: AudioContext, later: Later): Channel {
  const out = ctx.createGain();
  out.gain.value = 0;
  let level = 0;
  let fear = 0;
  let alive = true;
  let nextBeat = ctx.currentTime + 0.1;

  const thump = (t: number, strength: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(78, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.14);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(strength, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    osc.connect(env).connect(out);
    osc.start(t);
    osc.stop(t + 0.2);
    osc.onended = () => [osc, env].forEach(safeDisconnect);
  };

  // Look-ahead scheduler: queue beats ~350ms ahead on the audio clock.
  const tick = () => {
    if (!alive) return;
    const bpm = 48 + fear * 95; // 48 bpm calm → 143 bpm terrified
    const period = 60 / bpm;
    if (nextBeat < ctx.currentTime - 0.5) nextBeat = ctx.currentTime + 0.05; // tab was hidden; don't pile up
    while (nextBeat < ctx.currentTime + 0.35) {
      if (level > 0) {
        thump(nextBeat, 1);
        thump(nextBeat + Math.min(0.22, period * 0.3), 0.6);
      }
      nextBeat += period;
    }
    later(100, tick);
  };
  tick();

  return {
    out,
    update(nextLevel, nextFear) {
      level = nextLevel;
      fear = nextFear;
      out.gain.setTargetAtTime(nextLevel * 1.1, ctx.currentTime, SMOOTH);
    },
    dispose() {
      alive = false;
      safeDisconnect(out);
    },
  };
}

/* ---------------------------------------------------------- CORN RUSTLE */
function makeCorn(ctx: AudioContext, noise: AudioBuffer, later: Later): Channel {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2200;
  band.Q.value = 1.1;

  const crackle = ctx.createGain();
  crackle.gain.value = 0.1;
  const out = ctx.createGain();
  out.gain.value = 0;
  src.connect(band).connect(crackle).connect(out);
  src.start();

  let alive = true;
  // Random amplitude steps every 40–180ms: dry leaves brushing past.
  const step = () => {
    if (!alive) return;
    const quiet = Math.random() < 0.55;
    const v = quiet ? rand(0.02, 0.15) : rand(0.35, 1);
    crackle.gain.setTargetAtTime(v, ctx.currentTime, 0.015);
    later(rand(40, 180), step);
  };
  step();

  return {
    out,
    update(level, fear) {
      const t = ctx.currentTime;
      band.frequency.setTargetAtTime(1800 + 900 * fear, t, 0.3);
      out.gain.setTargetAtTime(level * 0.5, t, SMOOTH);
    },
    dispose() {
      alive = false;
      stopSafely(src);
      [src, band, crackle, out].forEach(safeDisconnect);
    },
  };
}

/* ----------------------------------------------------------- FOG MACHINE */
function makeFog(ctx: AudioContext, noise: AudioBuffer): Channel {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;

  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 240;
  low.Q.value = 0.7;

  // Periodic swell: base 0.55 ± 0.45 from a very slow sine.
  const swell = ctx.createGain();
  swell.gain.value = 0.55;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.45;
  lfo.connect(lfoDepth).connect(swell.gain);

  const out = ctx.createGain();
  out.gain.value = 0;
  src.connect(low).connect(swell).connect(out);
  src.start();
  lfo.start();

  return {
    out,
    update(level) {
      out.gain.setTargetAtTime(level * 0.9, ctx.currentTime, SMOOTH);
    },
    dispose() {
      stopSafely(src);
      stopSafely(lfo);
      [src, low, swell, lfo, lfoDepth, out].forEach(safeDisconnect);
    },
  };
}

/* ---------------------------------------------------------------- ENGINE */
export class AmbienceEngine {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  /** Post-master analyser for the visualizer. */
  readonly analyser: AnalyserNode;
  private readonly channels = new Map<ChannelId, Channel>();
  private readonly meters = new Map<ChannelId, AnalyserNode>();
  private readonly timers = new Set<number>();
  private disposed = false;

  constructor(initial: Mix) {
    const Ctor = getContextCtor();
    if (!Ctor) throw new Error("Web Audio is not available in this browser.");
    this.ctx = new Ctor();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;
    this.master.connect(this.analyser).connect(this.ctx.destination);

    const noise = makeNoiseBuffer(this.ctx);
    const later: Later = (ms, fn) => {
      if (this.disposed) return;
      const id = window.setTimeout(() => {
        this.timers.delete(id);
        if (!this.disposed) fn();
      }, ms);
      this.timers.add(id);
    };

    const builders: Record<ChannelId, () => Channel> = {
      wind: () => makeWind(this.ctx, noise),
      crows: () => makeCrows(this.ctx, noise, later),
      heartbeat: () => makeHeartbeat(this.ctx, later),
      corn: () => makeCorn(this.ctx, noise, later),
      fog: () => makeFog(this.ctx, noise),
    };
    for (const id of CHANNEL_IDS) {
      const channel = builders[id]();
      const meter = this.ctx.createAnalyser();
      meter.fftSize = 256;
      meter.smoothingTimeConstant = 0.5;
      channel.out.connect(meter).connect(this.master);
      this.channels.set(id, channel);
      this.meters.set(id, meter);
    }
    this.setMix(initial);
  }

  /** Must be called from a user gesture. Resumes a suspended context and fades the master in. */
  async start(): Promise<void> {
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.disposed) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(0, t);
    this.master.gain.linearRampToValueAtTime(1, t + 0.8);
  }

  get state(): AudioContextState {
    return this.ctx.state;
  }

  meterFor(id: ChannelId): AnalyserNode | null {
    return this.meters.get(id) ?? null;
  }

  setMix(mix: Mix): void {
    if (this.disposed) return;
    const fear = clamp(mix.fear, 0, 100) / 100;
    for (const id of CHANNEL_IDS) {
      const { on, level } = mix.channels[id];
      this.channels.get(id)?.update(on ? clamp(level, 0, 100) / 100 : 0, fear);
    }
  }

  /** Fades out, stops every source, cancels every timer, closes the context. Safe to call twice. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.05);
    const ctx = this.ctx;
    const channels = [...this.channels.values()];
    const meters = [...this.meters.values()];
    window.setTimeout(() => {
      channels.forEach((c) => c.dispose());
      meters.forEach(safeDisconnect);
      safeDisconnect(this.master);
      safeDisconnect(this.analyser);
      if (ctx.state !== "closed") void ctx.close().catch(() => undefined);
    }, 300);
  }
}

/** RMS level (0–1) of an analyser's current time-domain block, for meters. */
export function readLevel(analyser: AnalyserNode, scratch: Uint8Array<ArrayBuffer>): number {
  analyser.getByteTimeDomainData(scratch);
  let sum = 0;
  for (let i = 0; i < scratch.length; i++) {
    const v = (scratch[i] - 128) / 128;
    sum += v * v;
  }
  // Boost a little: ambience is quiet and meters should visibly move.
  return clamp(Math.sqrt(sum / scratch.length) * 2.6, 0, 1);
}
