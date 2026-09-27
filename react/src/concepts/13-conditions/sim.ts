/**
 * Simulation + schedule helpers for Concept #13 "Trail Conditions".
 *
 * Everything in `useSimulation` is FAKE and clearly labeled as such in the UI.
 * The schedule helpers (`trailState`, `nextNight`) are real: they derive from
 * `business.season` so the board flips to OPEN on its own once the haunt runs.
 */
import { useEffect, useState } from "react";
import { business, type Night } from "@/data/business";

/* ------------------------------------------------------------------ */
/* Seeded pseudo-random                                                */
/* ------------------------------------------------------------------ */

/** mulberry32 — tiny seeded PRNG so the demo drifts the same way every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash, used to pick deterministic "sample" states per scene/night. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

/** Current time, re-read every `intervalMs`. Drives the clock and the schedule logic. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ------------------------------------------------------------------ */
/* Simulated readings                                                  */
/* ------------------------------------------------------------------ */

export const FOG_HISTORY = 30;

export interface Readings {
  /** Last FOG_HISTORY fog levels, 0–100, oldest first. */
  fog: number[];
  /** Simulated wait, minutes. */
  wait: number;
  /** Simulated temperature, °F. */
  temp: number;
  /** Simulated crows sighted tonight. Only ever goes up. */
  crows: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** One step of a bounded random walk. */
const walk = (rng: () => number, value: number, amount: number, lo: number, hi: number) =>
  clamp(value + (rng() * 2 - 1) * amount, lo, hi);

function seedReadings(rng: () => number): Readings {
  let fog = 58;
  const history: number[] = [];
  for (let i = 0; i < FOG_HISTORY; i++) {
    fog = walk(rng, fog, 9, 0, 100);
    history.push(fog);
  }
  return { fog: history, wait: 18, temp: 41, crows: 12 };
}

function advance(rng: () => number, r: Readings): Readings {
  const last = r.fog[r.fog.length - 1] ?? 50;
  return {
    fog: [...r.fog.slice(1), walk(rng, last, 8, 0, 100)],
    wait: walk(rng, r.wait, 4, 0, 60),
    temp: walk(rng, r.temp, 0.8, 28, 54),
    crows: r.crows + (rng() < 0.35 ? 1 : 0) + (rng() < 0.08 ? 1 : 0),
  };
}

/**
 * Seeded random-walk simulation. Ticks every `intervalMs`, pauses while the
 * tab is hidden. SIMULATED — the UI must label it so the client never mistakes
 * these for live numbers.
 */
export function useSimulation(seed: number, intervalMs: number): Readings {
  const [rng] = useState(() => mulberry32(seed));
  const [readings, setReadings] = useState(() => seedReadings(mulberry32(seed ^ 0x9e3779b9)));

  useEffect(() => {
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(() => setReadings((p) => advance(rng, p)), intervalMs);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rng, intervalMs]);

  return readings;
}

/* ------------------------------------------------------------------ */
/* Real schedule logic                                                 */
/* ------------------------------------------------------------------ */

/** "7:30 PM" → [19, 30]. Unknown formats fall back to midnight, never NaN. */
function parse12h(time: string): [number, number] {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!m) return [0, 0];
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return [h, Number(m[2])];
}

/** The season runs in one timezone; reuse opening night's UTC offset for every night. */
const tzOffset = business.season.opensAt.slice(-6);
const pad = (n: number) => String(n).padStart(2, "0");

/** Epoch ms for a night's `date` + a 12-hour clock string, in the venue timezone. */
export function nightMs(date: string, time: string): number {
  const [h, m] = parse12h(time);
  const ms = Date.parse(`${date}T${pad(h)}:${pad(m)}:00${tzOffset}`);
  return Number.isNaN(ms) ? 0 : ms;
}

export type TrailCode = "preseason" | "open" | "between" | "wrapped";

export interface TrailState {
  code: TrailCode;
  /** The night this state refers to: opening night, the night in progress, or the next one. */
  night: Night | null;
}

/** Where the haunt stands right now, derived purely from `business.season`. */
export function trailState(now: number): TrailState {
  const nights = business.season.nights;
  const opens = Date.parse(business.season.opensAt);
  if (now < opens) return { code: "preseason", night: nights[0] };
  for (const n of nights) {
    if (now >= nightMs(n.date, n.start) && now <= nightMs(n.date, n.end)) return { code: "open", night: n };
  }
  const next = nights.find((n) => nightMs(n.date, n.start) > now);
  return next ? { code: "between", night: next } : { code: "wrapped", night: null };
}

/** The night to show under "TONIGHT": the first one that hasn't ended yet, else the last. */
export function nextNight(now: number): Night {
  const nights = business.season.nights;
  return nights.find((n) => nightMs(n.date, n.end) > now) ?? nights[nights.length - 1];
}
