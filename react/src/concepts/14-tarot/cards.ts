/**
 * The Crow's Deck: one card per real scene (from business.scenes), the two-line
 * readings for each position, the fate paragraph, and localStorage persistence.
 * Every fact (names, nights, prices) comes from business.ts.
 */
import { business, type Night } from "@/data/business";

export type EmblemKey =
  | "bridge"
  | "beetle"
  | "cleaver"
  | "sheets"
  | "eclipse"
  | "hat"
  | "scythe"
  | "bus"
  | "barn"
  | "tunnel"
  | "cage"
  | "trees"
  | "van"
  | "corn"
  | "grave"
  | "tent"
  | "crossbuck"
  | "saloon"
  | "moon";

export const POSITIONS = ["Past", "Present", "Your Night"] as const;
export type Position = (typeof POSITIONS)[number];

export interface TarotCard {
  id: number;
  name: string;
  zone: string;
  numeral: string;
  emblem: EmblemKey;
  /** Line one of the reading: the card's own omen. */
  omen: string;
  /** Noun phrase folded into the position-specific second line. */
  theme: string;
}

/** Copy and emblem per scene, keyed by the approved scene name. */
const LORE: Record<string, { emblem: EmblemKey; omen: string; theme: string }> = {
  "The Bridge": { emblem: "bridge", omen: "A plank over black water. It holds. Probably.", theme: "a crossing you can't take back" },
  Beetlejuice: { emblem: "beetle", omen: "Say the name once. Say it twice. Don't.", theme: "a name you shouldn't have said" },
  "The Butcher": { emblem: "cleaver", omen: "He keeps his knives sharper than his manners.", theme: "something being cut short" },
  "The Black Sheets": { emblem: "sheets", omen: "Laundry on the line, and something breathing behind it.", theme: "what hides in plain sight" },
  Blackout: { emblem: "eclipse", omen: "The lights go. Your hand finds a shoulder. Whose?", theme: "a stretch of pure dark" },
  "The Witch": { emblem: "hat", omen: "She's been expecting you. She said so.", theme: "a bargain with the woods" },
  "Dark Harvest": { emblem: "scythe", omen: "The fields were reaped. Not everything reaped was corn.", theme: "what the season took" },
  "The Bus": { emblem: "bus", omen: "The route ends here. It has for a while.", theme: "a ride that never arrived" },
  "The Barn Hang": { emblem: "barn", omen: "Rafters creak. Rope doesn't. Look up, or don't.", theme: "a weight you carry" },
  "The Tunnel": { emblem: "tunnel", omen: "Low ceiling, no light, one way through.", theme: "the only way out, which is through" },
  "The Cage": { emblem: "cage", omen: "Ben built it. Whoever's inside didn't ask for it.", theme: "the thing you can't get out of" },
  "The Last Woods": { emblem: "trees", omen: "The trees thin out. That's not the same as ending.", theme: "the last stretch before the lights" },
  "The Junk & Candy Van": { emblem: "van", omen: "Free candy. No questions. Several regrets.", theme: "a sweet, bad idea" },
  "The Corn Field": { emblem: "corn", omen: "The rows all look the same. They aren't.", theme: "a maze of your own making" },
  "The Graveyard": { emblem: "grave", omen: "The zombies are patient. They have all the time you don't.", theme: "what refuses to stay buried" },
  "The Camp": { emblem: "tent", omen: "Fire lit, tents zipped, nobody inside. Nobody.", theme: "a safety that isn't" },
  "The Crossing": { emblem: "crossbuck", omen: "Stop. Look. Listen. Then run.", theme: "a choice between two dark roads" },
  "The Saloon": { emblem: "saloon", omen: "Last stop on the trail. First round's on the house.", theme: "an ending with a drink in it" },
};

const FALLBACK = { emblem: "moon" as EmblemKey, omen: "The deck is quiet about this one. That's worse.", theme: "something the cards won't name" };

/** Roman numerals I–XVIII (and beyond, should the trail grow). */
export function roman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = n;
  for (const [value, glyph] of table) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

/** The deck, in trail order: The Yard, The Woods, The Back Forty. */
export const CARDS: readonly TarotCard[] = business.scenes
  .flatMap((zone) => zone.names.map((name) => ({ name, zone: zone.zone })))
  .map((scene, i) => {
    const lore = LORE[scene.name] ?? FALLBACK;
    return { id: i, name: scene.name, zone: scene.zone, numeral: roman(i + 1), ...lore };
  });

export const ALL_IDS: readonly number[] = CARDS.map((c) => c.id);

export function cardById(id: number): TarotCard {
  return CARDS[id] ?? CARDS[0];
}

/** Fisher–Yates, returns a new array. */
export function shuffle(ids: readonly number[]): number[] {
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Two lines for a card in a given position. */
export function readingLines(card: TarotCard, position: Position): [string, string] {
  const second: Record<Position, string> = {
    Past: `Behind you: ${card.theme}. It got you this far.`,
    Present: `Beside you right now: ${card.theme}. Keep walking.`,
    "Your Night": `Ahead, at the end of the trail: ${card.theme}. Bring a friend.`,
  };
  return [card.omen, second[position]];
}

export interface Fate {
  text: string;
  night: Night;
}

/** Compose the reading from three draws. The night is chosen deterministically from the cards. */
export function composeFate(ids: readonly [number, number, number]): Fate {
  const [past, present, yours] = ids.map(cardById);
  const nights = business.season.nights;
  const night = nights[(ids[0] + ids[1] + ids[2]) % nights.length];
  const fireworks = "fireworks" in night ? night.fireworks : null;
  const { trail, withDonation } = business.pricing;

  const sentences = [
    `${past.name} brought you here. ${present.name} walks beside you now. And at the end of the trail, ${yours.name} is waiting.`,
    `The cards point to ${night.label}, ${night.note.toLowerCase()}. The gate opens at ${night.start}, the last soul enters at ${business.season.lastEntry}, and we close at ${night.end}.`,
    fireworks ? `Fireworks light the sky at ${fireworks} first. The sky gets loud before the woods go quiet.` : "",
    `Bring a food-shelf donation or a winter coat and the deck cuts your toll from $${trail} to $${withDonation}. The cards are never wrong about money.`,
  ];
  return { text: sentences.filter(Boolean).join(" "), night };
}

/* ---------- persistence (tiny convenience, always inside try/catch) ---------- */

const STORAGE_KEY = "c14-crows-deck";

export interface SavedReading {
  slots: (number | null)[];
  fateOpen: boolean;
}

export function loadSaved(): SavedReading | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { slots, fateOpen } = parsed as Partial<SavedReading>;
    if (!Array.isArray(slots) || slots.length !== POSITIONS.length) return null;
    const clean = slots.map((v) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < CARDS.length ? v : null));
    const seen = clean.filter((v): v is number => v !== null);
    if (new Set(seen).size !== seen.length) return null;
    return { slots: clean, fateOpen: fateOpen === true };
  } catch {
    return null;
  }
}

export function saveReading(saved: SavedReading | null): void {
  try {
    if (!saved || saved.slots.every((v) => v === null)) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    /* storage unavailable: the reading simply isn't remembered */
  }
}
