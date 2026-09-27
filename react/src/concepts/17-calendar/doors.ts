/**
 * Concept 17 — "31 Doors".
 * Everything about the month grid and what hides behind each door is derived
 * here, deterministically, from the season data. No hand-typed calendars.
 */
import { business, type Night } from "@/data/business";

/** The season month, read off the first haunt night (e.g. "2026-10-09"). */
const [seasonYear, seasonMonth1] = business.season.nights[0].date.split("-").map(Number);
export const season = { year: seasonYear, month: seasonMonth1 - 1 };

/** Month geometry, all from Date so the grid is always correct. */
export const daysInMonth = new Date(season.year, season.month + 1, 0).getDate();
export const firstWeekday = new Date(season.year, season.month, 1).getDay();
export const monthName = new Date(season.year, season.month, 1).toLocaleDateString("en-US", { month: "long" });
export const monthShort = new Date(season.year, season.month, 1).toLocaleDateString("en-US", { month: "short" });
export const weekdayNames = Array.from({ length: 7 }, (_, i) =>
  new Date(season.year, season.month, 1 + ((i - firstWeekday + 7) % 7)).toLocaleDateString("en-US", { weekday: "short" }),
);

export const dateOf = (day: number) => new Date(season.year, season.month, day);
export const longDate = (day: number) => dateOf(day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
/** Day-of-month from an ISO date string like "2026-10-10". */
export const dayOf = (iso: string) => Number(iso.slice(8, 10));

/** Fireworks time for a night, if that night has one (only Oct 10 does). */
export const fireworksOf = (n: Night): string | undefined => ("fireworks" in n ? n.fireworks : undefined);

export const openingDay = dayOf(business.season.nights[0].date);
export const kidsDayDay = dayOf(business.kidsDay.date);

/**
 * How many doors the real calendar allows open on a given date:
 * none before the month starts, all of them once it's over.
 */
export function openableThrough(now: Date): number {
  const start = new Date(season.year, season.month, 1);
  const end = new Date(season.year, season.month, daysInMonth, 23, 59, 59);
  if (now.getTime() < start.getTime()) return 0;
  if (now.getTime() > end.getTime()) return daysInMonth;
  return now.getDate();
}

/** True when `now` falls on the given day of the season month. */
export function isSameDay(now: Date, day: number): boolean {
  return now.getFullYear() === season.year && now.getMonth() === season.month && now.getDate() === day;
}

export type NoteKind = "welcome" | "donate" | "crew" | "trail" | "food" | "halloween";

export interface HauntDoor {
  kind: "haunt";
  day: number;
  night: Night;
  /** Oct 10 shares its door with Kids Day. */
  kidsDay: boolean;
}
export interface SceneDoor {
  kind: "scene";
  day: number;
  scene: string;
  zone: string;
  /** Lower-case teaser line, e.g. "the Butcher sharpens something." */
  line: string;
}
export interface NoteDoor {
  kind: NoteKind;
  day: number;
}
export type Door = HauntDoor | SceneDoor | NoteDoor;

/** One teaser line per real scene name. Unknown scenes get a generic line. */
const SCENE_LINES: Record<string, string> = {
  "The Bridge": "something under the Bridge is counting footsteps.",
  Beetlejuice: "say it three times. Beetlejuice is already listening.",
  "The Butcher": "the Butcher sharpens something.",
  "The Black Sheets": "the Black Sheets are on the line. Don't walk between them.",
  Blackout: "Blackout. That's the whole warning.",
  "The Witch": "the Witch has lit her fire in the Woods.",
  "Dark Harvest": "Dark Harvest is in. Whatever they planted, it grew.",
  "The Bus": "the Bus is parked where no road goes.",
  "The Barn Hang": "rope creaks in the rafters of the Barn Hang.",
  "The Tunnel": "the Tunnel is low, tight and pitch black. Hand on the shoulder in front.",
  "The Cage": "the skeleton in the Cage rattled last night. Ben swears he didn't touch it.",
  "The Last Woods": "the Last Woods. Last for a reason.",
  "The Junk & Candy Van": "the Junk & Candy Van is giving away free candy. Don't.",
  "The Corn Field": "the Corn Field is taller than you now.",
  "The Graveyard": "someone's been digging in the Graveyard. Fresh dirt, no name.",
  "The Camp": "the Camp fire is lit. Nobody's sitting at it.",
  "The Crossing": "the Crossing. Look both ways. Then look behind you.",
  "The Saloon": "the Saloon is open. Last call never comes.",
};

/** Non-haunt days cycle through this pattern, so the month is stable and varied. */
const FILLER_PATTERN: readonly ("scene" | NoteKind)[] = ["scene", "scene", "donate", "scene", "crew", "scene", "trail", "scene", "food"];

/** Builds all doors for the month. Pure and deterministic. */
export function buildDoors(): Door[] {
  const nightsByDay = new Map<number, Night>(business.season.nights.map((n) => [dayOf(n.date), n]));
  const scenes = business.scenes.flatMap((z) => z.names.map((name) => ({ zone: z.zone, name })));
  const doors: Door[] = [];
  let filler = 0;
  let sceneIdx = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const night = nightsByDay.get(day);
    if (night) {
      doors.push({ kind: "haunt", day, night, kidsDay: day === kidsDayDay });
      continue;
    }
    if (day === 1) {
      doors.push({ kind: "welcome", day });
      continue;
    }
    if (day === daysInMonth) {
      doors.push({ kind: "halloween", day });
      continue;
    }
    const kind = FILLER_PATTERN[filler++ % FILLER_PATTERN.length];
    if (kind === "scene") {
      const s = scenes[sceneIdx++ % scenes.length];
      doors.push({ kind, day, scene: s.name, zone: s.zone, line: SCENE_LINES[s.name] ?? `${s.name} is waiting.` });
    } else {
      doors.push({ kind, day });
    }
  }
  return doors;
}

/** Short label shown under the flap once a door is open. */
export function peekLabel(door: Door): string {
  switch (door.kind) {
    case "haunt":
      return door.kidsDay ? "Kids + Haunt" : "Haunt night";
    case "scene":
      return door.scene.replace(/^The /, "");
    case "welcome":
      return "Welcome";
    case "donate":
      return "Donate";
    case "crew":
      return "Join us";
    case "trail":
      return "The trail";
    case "food":
      return "Food";
    case "halloween":
      return "Halloween";
  }
}

/* ---- localStorage conveniences (never throw) ---- */
const KEY_OPENED = "notc17:opened";
const KEY_PREVIEW = "notc17:preview";

export function loadOpened(): number[] {
  try {
    const raw = localStorage.getItem(KEY_OPENED);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((d): d is number => typeof d === "number" && d >= 1 && d <= daysInMonth);
  } catch {
    return [];
  }
}
export function saveOpened(days: number[]): void {
  try {
    localStorage.setItem(KEY_OPENED, JSON.stringify(days));
  } catch {
    /* private mode, quota, etc. — opened state simply won't persist */
  }
}
export function loadPreview(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get("preview") === "1") return true;
    return localStorage.getItem(KEY_PREVIEW) === "1";
  } catch {
    return false;
  }
}
export function savePreview(on: boolean): void {
  try {
    localStorage.setItem(KEY_PREVIEW, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}
