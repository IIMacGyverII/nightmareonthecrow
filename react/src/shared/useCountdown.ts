import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Total milliseconds remaining, clamped at 0. */
  total: number;
  /** True once the target time has passed. */
  done: boolean;
}

function compute(target: number): Countdown {
  const total = Math.max(0, target - Date.now());
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
    done: total === 0,
  };
}

/**
 * Live countdown to an ISO timestamp (e.g. business.season.opensAt).
 * Ticks once a second; never produces NaN (invalid dates count down from 0).
 */
export function useCountdown(iso: string): Countdown {
  const target = Number.isNaN(Date.parse(iso)) ? Date.now() : Date.parse(iso);
  const [state, setState] = useState(() => compute(target));
  useEffect(() => {
    setState(compute(target));
    const id = window.setInterval(() => setState(compute(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return state;
}

/** Zero-pads a countdown unit for display. */
export const pad2 = (n: number) => String(n).padStart(2, "0");
