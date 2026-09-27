/**
 * Split-flap display primitives.
 *
 * FlapCell  — one character drum. When its target char changes it flips
 *             forward through the drum (top half falls, bottom half lands)
 *             until it reaches the target. Memoized: a row that re-renders
 *             every second only wakes the cells whose char actually changed.
 * FlapRow   — a fixed-width line of cells; re-flaps when its text changes.
 *
 * All flipping cells share ONE interval (the scheduler below) so React
 * commits a single batched update per tick instead of one per cell.
 */
import { createContext, memo, useContext, useEffect, useRef, useState } from "react";

/** Characters on the drum, in flip order. Anything else is shown as a blank. */
export const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-·$/&,'!?+()";
const DRUM = FLAP_CHARS.length;
/** A drum never travels further than this: it jumps, then flips the last few. */
const MAX_STEPS = 9;
/** One flap = one tick. Also the CSS animation duration (see --fms). */
export const FLAP_STEP_MS = 65;

/** true = prefers reduced motion; cells snap instead of flipping. */
export const FlapMotion = createContext(false);

export type Tone = "amber" | "dim" | "gap";

const SUBS = new Map<string, string>([
  ["–", "-"],
  ["—", "-"],
  ["’", "'"],
  ["“", ""],
  ["”", ""],
]);

/** Uppercases and maps text onto the drum alphabet. */
export function toFlapText(text: string): string {
  let out = "";
  for (const raw of text.toUpperCase()) {
    const ch = SUBS.get(raw) ?? raw;
    if (ch === "") continue;
    out += FLAP_CHARS.includes(ch) ? ch : " ";
  }
  return out;
}

/** Greedy word wrap for multi-row board values. */
export function wrapWords(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= width) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word.slice(0, width);
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/* ---------- shared scheduler: one interval for every flipping cell ---------- */

const active = new Set<() => void>();
let timer = 0;

function runAll() {
  for (const step of Array.from(active)) step();
}
function schedule(step: () => void) {
  active.add(step);
  if (!timer) timer = window.setInterval(runAll, FLAP_STEP_MS);
}
function unschedule(step: () => void) {
  active.delete(step);
  if (active.size === 0 && timer) {
    window.clearInterval(timer);
    timer = 0;
  }
}

/* ---------- cell ---------- */

interface CellProps {
  char: string;
  /** Milliseconds to wait before starting to flip (for the row sweep). */
  delay: number;
  tone?: Tone;
}
interface CellState {
  /** Drum index currently shown. */
  shown: number;
  /** Drum index being flipped away, or -1 when idle. */
  from: number;
}

export const FlapCell = memo(function FlapCell({ char, delay, tone }: CellProps) {
  const reduced = useContext(FlapMotion);
  const target = Math.max(0, FLAP_CHARS.indexOf(char));
  const [state, setState] = useState<CellState>({ shown: 0, from: -1 });
  const shownRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      shownRef.current = target;
      setState((s) => (s.shown === target && s.from === -1 ? s : { shown: target, from: -1 }));
      return;
    }
    let shown = shownRef.current;
    if (shown === target) {
      setState((s) => (s.from === -1 ? s : { shown: target, from: -1 }));
      return;
    }
    // Long trips jump most of the way so a cell never flips more than MAX_STEPS.
    const dist = (target - shown + DRUM) % DRUM;
    if (dist > MAX_STEPS) shown = (target - MAX_STEPS + DRUM) % DRUM;

    let wait = Math.round(delay / FLAP_STEP_MS);
    let landed = false;
    const step = () => {
      if (wait > 0) {
        wait -= 1;
        return;
      }
      if (landed) {
        setState({ shown: target, from: -1 });
        unschedule(step);
        return;
      }
      const prev = shown;
      shown = (shown + 1) % DRUM;
      shownRef.current = shown;
      setState({ shown, from: prev });
      if (shown === target) landed = true;
    };
    schedule(step);
    return () => unschedule(step);
  }, [target, delay, reduced]);

  const cur = FLAP_CHARS[state.shown];
  const flipping = state.from >= 0;
  const old = flipping ? FLAP_CHARS[state.from] : cur;
  const cls = "fc" + (tone ? ` fc-${tone}` : "") + (flipping ? " is-flipping" : "");

  return (
    <span className={cls} aria-hidden="true">
      <span className="fc-h fc-top">
        <b>{cur}</b>
      </span>
      <span className="fc-h fc-bot">
        <b>{old}</b>
      </span>
      {flipping && (
        <span key={state.shown} className="fc-anim">
          <span className="fc-h fc-top">
            <b>{old}</b>
          </span>
          <span className="fc-h fc-bot">
            <b>{cur}</b>
          </span>
        </span>
      )}
    </span>
  );
});

/* ---------- row ---------- */

interface RowProps {
  text: string;
  width: number;
  /** Per-slot tones, same length as width. */
  tones?: readonly (Tone | undefined)[];
  /** Extra ms of delay per cell index (the left-to-right sweep). */
  stagger?: number;
  /** Base delay in ms (row-by-row sweep). */
  delay?: number;
  className?: string;
}

export const FlapRow = memo(function FlapRow({ text, width, tones, stagger = 0, delay = 0, className }: RowProps) {
  const chars = toFlapText(text).padEnd(width).slice(0, width);
  const label = text.trim() || "blank";
  return (
    <span className={"fr" + (className ? ` ${className}` : "")} role="img" aria-label={label}>
      {Array.from(chars, (c, i) => (
        <FlapCell key={i} char={c} delay={delay + i * stagger} tone={tones?.[i]} />
      ))}
    </span>
  );
});
