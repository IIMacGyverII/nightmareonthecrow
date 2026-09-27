/**
 * Wall state: the notes, live arrivals every 6–12 s (paused while the tab is
 * hidden), the 40-note cap with a CSS exit for the oldest, the visitor's own
 * notes (persisted locally), and a throttled screen-reader announcement.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { arrivalNote, loadMine, makeNote, saveMine, seedNotes, WALL_CAP, type Fear, type NightId, type Note, type SceneName } from "./notes";

const ARRIVAL_MIN_MS = 6_000;
const ARRIVAL_SPAN_MS = 6_000;
const EXIT_MS = 480;
const ANNOUNCE_EVERY_MS = 20_000;

export interface NewScream {
  text: string;
  scene: SceneName;
  night: NightId;
  fear: Fear;
}

export function useWall(reducedMotion: boolean) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const now = Date.now();
    return [...loadMine(), ...seedNotes(now)];
  });
  const [announcement, setAnnouncement] = useState("");
  const arrivals = useRef(0);
  const lastAnnounce = useRef(0);
  const skipped = useRef(0);
  const exitTimers = useRef<number[]>([]);

  /** Announce at most once per ANNOUNCE_EVERY_MS; batch the rest into a count. */
  const announce = useCallback((note: Note) => {
    const now = Date.now();
    if (now - lastAnnounce.current < ANNOUNCE_EVERY_MS) {
      skipped.current += 1;
      return;
    }
    const extra = skipped.current > 0 ? ` and ${skipped.current} more` : "";
    setAnnouncement(`New scream about ${note.scene}, ${note.fear} of 5 skulls${extra}.`);
    lastAnnounce.current = now;
    skipped.current = 0;
  }, []);

  /* Live arrivals from the seeded pool. */
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      if (document.visibilityState === "visible") {
        const note = arrivalNote(arrivals.current++, Date.now());
        setNotes((prev) => [note, ...prev]);
        announce(note);
      }
      schedule();
    };
    const schedule = () => {
      timer = window.setTimeout(tick, ARRIVAL_MIN_MS + Math.random() * ARRIVAL_SPAN_MS);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [announce]);

  /* Enforce the cap: mark the oldest sample notes as leaving, then drop them. */
  useEffect(() => {
    const live = notes.filter((n) => !n.leaving);
    if (live.length <= WALL_CAP) return;
    const victims = live
      .filter((n) => !n.mine)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, live.length - WALL_CAP);
    if (victims.length === 0) return;
    const ids = new Set(victims.map((v) => v.id));
    const drop = () => setNotes((prev) => prev.filter((n) => !ids.has(n.id)));
    if (reducedMotion) {
      drop();
      return;
    }
    setNotes((prev) => prev.map((n) => (ids.has(n.id) ? { ...n, leaving: true } : n)));
    exitTimers.current.push(window.setTimeout(drop, EXIT_MS));
  }, [notes, reducedMotion]);

  /* Clear any pending exit timers only on unmount. */
  useEffect(() => {
    const timers = exitTimers.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const addScream = useCallback((s: NewScream) => {
    const ts = Date.now();
    const note = makeNote({ id: `mine-${ts}`, ...s, ts, mine: true, fresh: true });
    setNotes((prev) => [note, ...prev]);
  }, []);

  /* Persist the visitor's own notes whenever that set changes (not on every arrival). */
  const mineKey = notes
    .filter((n) => n.mine)
    .map((n) => n.id)
    .join("|");
  useEffect(() => {
    if (mineKey) saveMine(notes);
  }, [mineKey]);

  return { notes, addScream, announcement };
}
