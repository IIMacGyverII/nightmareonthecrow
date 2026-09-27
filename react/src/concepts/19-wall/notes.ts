/**
 * Scream Wall data: note types, the seeded sample pool, and the deterministic
 * "decoration" (rotation, paper tone, tape vs pin) derived from each note's id
 * so cards never re-roll their look between renders.
 *
 * Every note is SAMPLE data written for the demo. Scene names come from
 * business.scenes and are type-checked against it.
 */
import { business, type Night } from "@/data/business";

export type NightId = Night["id"];
export type Fear = 1 | 2 | 3 | 4 | 5;
export type Tone = "paper" | "orange" | "bone";
export type SceneName = (typeof business.scenes)[number]["names"][number];

export interface Note {
  id: string;
  text: string;
  scene: SceneName;
  night: NightId;
  fear: Fear;
  /** Arrival time (ms). Seeded notes are back-dated so "newest" sorting is meaningful. */
  ts: number;
  /** Left by this visitor (local only). */
  mine?: boolean;
  /** Arrived after mount: plays the pop-in animation. */
  fresh?: boolean;
  /** Being pushed off the wall: plays the exit animation. */
  leaving?: boolean;
  /** Deterministic look. */
  rot: number;
  tone: Tone;
  pin: boolean;
}

export const WALL_CAP = 40;
export const MAX_CHARS = 120;
export const SCENE_NAMES: readonly SceneName[] = business.scenes.flatMap((z) => z.names);
export const NIGHTS = business.season.nights;

export function isSceneName(s: string): s is SceneName {
  return (SCENE_NAMES as readonly string[]).includes(s);
}
export function isNightId(s: string): s is NightId {
  return NIGHTS.some((n) => n.id === s);
}
export function isFear(n: number): n is Fear {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/** FNV-1a: small, deterministic, good enough to seed a card's look. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TONES: readonly Tone[] = ["paper", "paper", "bone", "orange", "paper", "bone"];

/** Build a full Note from its content, deriving the look from the id. */
export function makeNote(base: Omit<Note, "rot" | "tone" | "pin">): Note {
  const h = hash(base.id);
  return {
    ...base,
    rot: Math.round(((h % 1000) / 1000 - 0.5) * 5 * 10) / 10, // -2.5 .. 2.5 deg
    tone: TONES[(h >>> 10) % TONES.length],
    pin: ((h >>> 20) & 1) === 1,
  };
}

type Seed = readonly [text: string, scene: SceneName, night: NightId, fear: Fear];

/** The 24 notes on the wall at load. */
const INITIAL: readonly Seed[] = [
  ["I held a stranger's hand in the Tunnel and I'm not sorry.", "The Tunnel", "oct9", 5],
  ["The Butcher looked at my boyfriend like he was a menu.", "The Butcher", "oct10", 4],
  ["Fireworks were beautiful. Then it got dark. Then it got bad.", "The Bridge", "oct10", 3],
  ["Blackout: I counted my steps. Lost count at four.", "Blackout", "oct9", 5],
  ["Beetlejuice said my name. I never told him my name.", "Beetlejuice", "oct16", 4],
  ["The Witch offered me something. I said yes. Regret.", "The Witch", "oct17", 3],
  ["Six of us went in. Six came out. Not the same six.", "The Last Woods", "oct16", 4],
  ["I laughed the entire time. It was nervous laughing.", "The Black Sheets", "oct9", 3],
  ["The corn was quiet. That was the problem.", "The Corn Field", "oct17", 4],
  ["Brought a coat for the drive, paid less, screamed more.", "The Saloon", "oct10", 2],
  ["Someone on the Bus was breathing. Not one of us.", "The Bus", "oct16", 5],
  ["The Barn Hang. I'm not explaining. Go.", "The Barn Hang", "oct9", 5],
  ["The skeleton in the Cage rattled when I walked by. Just me. Not my sister.", "The Cage", "oct10", 4],
  ["Dark Harvest has a smell. I need to talk about the smell.", "Dark Harvest", "oct17", 3],
  ["The Graveyard zombies are slow until they aren't.", "The Graveyard", "oct16", 4],
  ["A man in the Camp asked if I'd seen his friends. I hope not.", "The Camp", "oct9", 3],
  ["The Crossing: the water was the least scary thing about the water.", "The Crossing", "oct10", 4],
  ["The Saloon bartender poured nothing and I still drank it.", "The Saloon", "oct17", 2],
  ["Junk & Candy Van. Do not take the candy. I took the candy.", "The Junk & Candy Van", "oct16", 3],
  ["The hayride was lovely. The hayride was a lie.", "The Bridge", "oct9", 2],
  ["My dad screamed higher than me in the Tunnel. We don't discuss it.", "The Tunnel", "oct17", 4],
  ["Wore boots like the FAQ said. Lost one anyway.", "The Corn Field", "oct10", 3],
  ["The Black Sheets moved when nobody was behind them.", "The Black Sheets", "oct16", 5],
  ["Kids Day was adorable. Came back at night. Not adorable.", "The Witch", "oct10", 3],
];

/** Notes that "arrive" live, cycled in order. */
const ARRIVALS: readonly Seed[] = [
  ["Blackout took my sense of direction and never gave it back.", "Blackout", "oct17", 5],
  ["The Butcher waved. That's it. That was enough.", "The Butcher", "oct16", 4],
  ["Beetlejuice did the voice. I did a different voice.", "Beetlejuice", "oct9", 3],
  ["Second lap through the Last Woods. Still lost. Still screaming.", "The Last Woods", "oct17", 4],
  ["The Bus has no route and no mercy.", "The Bus", "oct10", 4],
  ["The Witch knows what you did in the corn.", "The Witch", "oct16", 4],
  ["Something in the Graveyard knew my shoe size.", "The Graveyard", "oct9", 3],
  ["Held my breath through the whole Tunnel. Not a strategy. Do not recommend.", "The Tunnel", "oct16", 5],
  ["The Camp was silent, and then it very much wasn't.", "The Camp", "oct17", 4],
  ["I'd go again tomorrow. I would also need a ride home.", "The Saloon", "oct9", 2],
  ["The Cage rattles. Ben, if you're reading this: why.", "The Cage", "oct17", 4],
  ["Dark Harvest: the scarecrows are counting. I don't know what.", "Dark Harvest", "oct10", 4],
  ["The Barn Hang made my teenager hold my hand. Worth it.", "The Barn Hang", "oct16", 5],
  ["The Crossing is where my group split up. We regrouped in the parking lot.", "The Crossing", "oct17", 3],
  ["The candy van guy remembered me from last year. How.", "The Junk & Candy Van", "oct9", 3],
  ["The Corn Field ate my phone signal and my confidence.", "The Corn Field", "oct16", 4],
  ["The Bridge creaks on purpose. I asked.", "The Bridge", "oct17", 2],
  ["Black Sheets. Something under them. Something under me?", "The Black Sheets", "oct10", 5],
];

function fromSeed([text, scene, night, fear]: Seed, id: string, ts: number, fresh = false): Note {
  return makeNote({ id, text, scene, night, fear, ts, fresh });
}

/** The initial wall, back-dated 90 s apart so index 0 is newest. */
export function seedNotes(now: number): Note[] {
  return INITIAL.map((s, i) => fromSeed(s, `seed-${i}`, now - (i + 1) * 90_000));
}

/** The n-th live arrival (cycles through the pool with a unique id each lap). */
export function arrivalNote(n: number, now: number): Note {
  return fromSeed(ARRIVALS[n % ARRIVALS.length], `live-${n}`, now, true);
}

/* ---------- Local persistence for the visitor's own screams (demo only) ---------- */

const STORAGE_KEY = "notc-19-wall-mine";
const MAX_MINE = 10;

interface StoredNote {
  id: string;
  text: string;
  scene: string;
  night: string;
  fear: number;
  ts: number;
}

export function loadMine(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: Note[] = [];
    for (const item of parsed as unknown[]) {
      if (typeof item !== "object" || item === null) continue;
      const s = item as Partial<StoredNote>;
      if (
        typeof s.id === "string" &&
        typeof s.text === "string" &&
        typeof s.scene === "string" &&
        isSceneName(s.scene) &&
        typeof s.night === "string" &&
        isNightId(s.night) &&
        typeof s.fear === "number" &&
        isFear(s.fear) &&
        typeof s.ts === "number"
      ) {
        out.push(makeNote({ id: s.id, text: s.text.slice(0, MAX_CHARS), scene: s.scene, night: s.night, fear: s.fear, ts: s.ts, mine: true }));
      }
    }
    return out.slice(0, MAX_MINE);
  } catch {
    return [];
  }
}

export function saveMine(notes: Note[]): void {
  try {
    const mine: StoredNote[] = notes
      .filter((n) => n.mine)
      .slice(0, MAX_MINE)
      .map(({ id, text, scene, night, fear, ts }) => ({ id, text, scene, night, fear, ts }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mine));
  } catch {
    /* private mode or quota: the demo simply does not persist */
  }
}
