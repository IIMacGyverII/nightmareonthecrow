/**
 * Quiz content + scoring for Concept #12.
 * Facts (nights, prices, scenes) are NOT here; they come from "@/data/business"
 * at recommendation time. This file only holds the questions and the personas.
 */
import { business, type Night } from "@/data/business";

export type Trait = "dread" | "startle" | "claustro" | "nerve";
export const TRAITS: readonly Trait[] = ["dread", "startle", "claustro", "nerve"];

/** Who the visitor is bringing. Shapes the recommendation, not the score. */
export type Group = "kids" | "friends" | "date" | "solo";

export interface Answer {
  label: string;
  sub?: string;
  traits: Partial<Record<Trait, number>>;
  group?: Group;
}

export interface Question {
  id: string;
  prompt: string;
  answers: readonly Answer[];
}

export const QUESTIONS: readonly Question[] = [
  {
    id: "fog",
    prompt: "Fog or strobes?",
    answers: [
      { label: "Fog.", sub: "I'd rather see nothing at all.", traits: { dread: 2, nerve: 1 } },
      { label: "Strobes.", sub: "Chaos I can handle.", traits: { startle: 1, nerve: 2 } },
      { label: "Neither.", sub: "Turn the lights on, please.", traits: { dread: 3, startle: 3 } },
      { label: "Both. At once.", sub: "Hit me with everything.", traits: { nerve: 3 } },
    ],
  },
  {
    id: "curtain",
    prompt: "Do you check behind the shower curtain?",
    answers: [
      { label: "Every single time.", traits: { dread: 3 } },
      { label: "Only after a scary movie.", traits: { dread: 2, startle: 1 } },
      { label: "Never.", sub: "What would even be back there?", traits: { nerve: 3 } },
      { label: "I check. Then I check again.", traits: { dread: 3, startle: 2 } },
    ],
  },
  {
    id: "corn",
    prompt: "Corn maze: fun or nightmare?",
    answers: [
      { label: "Fun.", sub: "I'd race you to the middle.", traits: { nerve: 3 } },
      { label: "Fun, until I lose the group.", traits: { dread: 2, claustro: 1 } },
      { label: "Nightmare.", sub: "I'd walk the outside edge.", traits: { claustro: 3, dread: 2 } },
      { label: "Nightmare. And the corn knows it.", traits: { claustro: 2, startle: 2, dread: 1 } },
    ],
  },
  {
    id: "whisper",
    prompt: "Someone whispers your name in the dark. You…",
    answers: [
      { label: "Answer. Politely.", traits: { nerve: 3 } },
      { label: "Freeze and wait for it to pass.", traits: { dread: 3 } },
      { label: "Scream first, ask questions later.", traits: { startle: 3 } },
      { label: "Grab whoever's closest.", traits: { startle: 2, dread: 1 } },
    ],
  },
  {
    id: "clowns",
    prompt: "Clowns?",
    answers: [
      { label: "Fine.", sub: "It's a guy in makeup.", traits: { nerve: 3 } },
      { label: "Fine from a distance.", traits: { startle: 1, dread: 1 } },
      { label: "Absolutely not.", traits: { startle: 3, dread: 1 } },
      { label: "Only if I can outrun them.", traits: { startle: 2, nerve: 1 } },
    ],
  },
  {
    id: "tight",
    prompt: "How do you feel about tight spaces?",
    answers: [
      { label: "Cozy.", traits: { nerve: 3 } },
      { label: "Fine, if I can see the exit.", traits: { claustro: 2 } },
      { label: "I need my elbows.", traits: { claustro: 3, startle: 1 } },
      { label: "My chest tightened reading this.", traits: { claustro: 4, dread: 1 } },
    ],
  },
  {
    id: "group",
    prompt: "Who are you bringing?",
    answers: [
      { label: "My kids.", sub: "The small kind.", traits: {}, group: "kids" },
      { label: "A pack of friends.", traits: {}, group: "friends" },
      { label: "A date.", traits: { nerve: 1 }, group: "date" },
      { label: "Nobody.", sub: "I go in alone.", traits: { nerve: 2 }, group: "solo" },
    ],
  },
];

export type Totals = Record<Trait, number>;

const SCARE: readonly Trait[] = ["dread", "startle", "claustro"];

/** Sums each trait over the chosen answers. Unanswered questions are skipped. */
export function tally(answers: readonly (number | null)[]): Totals {
  const t: Totals = { dread: 0, startle: 0, claustro: 0, nerve: 0 };
  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (a == null) return;
    const chosen = q.answers[a];
    if (!chosen) return;
    for (const trait of TRAITS) t[trait] += chosen.traits[trait] ?? 0;
  });
  return t;
}

/** Highest possible "scare" points and "nerve" points, derived from the data. */
const bounds = QUESTIONS.reduce(
  (acc, q) => {
    let scare = 0;
    let nerve = 0;
    for (const a of q.answers) {
      scare = Math.max(scare, SCARE.reduce((s, tr) => s + (a.traits[tr] ?? 0), 0));
      nerve = Math.max(nerve, a.traits.nerve ?? 0);
    }
    return { scare: acc.scare + scare, nerve: acc.nerve + nerve };
  },
  { scare: 0, nerve: 0 },
);

const NERVE_WEIGHT = 0.6;

/** 0 (fearless) to 100 (absolutely terrified), normalized against the data's own extremes. */
export function fearScore(t: Totals): number {
  const raw = SCARE.reduce((s, tr) => s + t[tr], 0) - t.nerve * NERVE_WEIGHT;
  const min = -bounds.nerve * NERVE_WEIGHT;
  const max = bounds.scare;
  const pct = ((raw - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** The scare trait (not nerve) with the most points; ties go to the earlier trait. */
export function dominantTrait(t: Totals): Trait {
  let best: Trait = "dread";
  for (const tr of SCARE) if (t[tr] > t[best]) best = tr;
  if (t[best] === 0) return "nerve";
  return best;
}

export function groupOf(answers: readonly (number | null)[]): Group {
  const i = QUESTIONS.findIndex((q) => q.id === "group");
  const a = answers[i];
  const g = a == null ? undefined : QUESTIONS[i]?.answers[a]?.group;
  return g ?? "friends";
}

export interface Persona {
  title: string;
  tagline: string;
}

export function persona(score: number, dominant: Trait): Persona {
  if (score < 22) return { title: "The Skeptic", tagline: "You'll narrate the whole trail like a tour guide. The Butcher would like a word." };
  if (score < 45) return { title: "The One Who Goes First", tagline: "Everyone lines up behind you. You pretend that's fine. It's fine." };
  if (score < 65) {
    if (dominant === "startle") return { title: "The Screamer", tagline: "Loud, immediate, and honestly a gift to the actors." };
    return { title: "The Flashlight Holder", tagline: "You volunteer to carry the light so you have something to hold." };
  }
  if (score < 85) {
    if (dominant === "claustro") return { title: "The Wall Hugger", tagline: "One hand on the wall, one hand on a friend, eyes on the exit." };
    return { title: "The Screamer", tagline: "Loud, immediate, and honestly a gift to the actors." };
  }
  return { title: "The Sleeve Grabber", tagline: "Whoever walks in front of you is not getting their jacket back." };
}

/** Finds an approved scene name in business.scenes so the copy never drifts from the data. */
function scene(name: string): string {
  for (const z of business.scenes) {
    const hit = z.names.find((n) => n === name);
    if (hit) return hit;
  }
  return business.scenes[0].names[0];
}

export interface Recommendation {
  night: Night;
  nightWhy: string;
  scene: string;
  sceneWhy: string;
  donation: string;
  groupNote: string;
  kidsDay: boolean;
}

export function recommend(score: number, dominant: Trait, group: Group): Recommendation {
  const nights = business.season.nights;
  const fireworksNight = nights.find((n) => "fireworks" in n) ?? nights[1];

  const sceneByTrait: Record<Trait, [string, string]> = {
    claustro: [scene("The Tunnel"), "Low ceiling, no light, and the only way out is through."],
    startle: [scene("Blackout"), "You won't see it coming. That's the whole point."],
    dread: [scene("The Last Woods"), "Nothing jumps. Nothing has to. It just keeps getting darker."],
    nerve: [scene("The Corn Field"), "Even the fearless lose their bearings when the corn closes in."],
  };
  const [sc, sceneWhy] = sceneByTrait[dominant];

  let night: Night = nights[0];
  let nightWhy = "";
  if (group === "kids") {
    night = fireworksNight;
    nightWhy = `Do Kids Day at ${business.kidsDay.time} for the lights-on trail, then come back at dark for the fireworks.`;
  } else if (score < 35) {
    night = nights[0];
    nightWhy = "Opening night. The actors are freshest and so is the fog. You can take it.";
  } else if (score < 70) {
    night = fireworksNight;
    nightWhy = `Watch the fireworks at ${"fireworks" in fireworksNight ? fireworksNight.fireworks : ""} to loosen up, then head in when the haunt opens at ${fireworksNight.start}.`;
  } else {
    night = nights[nights.length - 1];
    nightWhy = "Give yourself the whole month to work up to it. The last night is still the full haunt, though.";
  }

  const p = business.pricing;
  const donation =
    group === "kids"
      ? `Grown-ups: bring a food-shelf item or a winter coat and pay $${p.withDonation} instead of $${p.trail}. ${p.kidsDayCredit}`
      : group === "friends"
        ? `Everyone brings one canned good or one pair of gloves. That's $${p.withDonation} apiece instead of $${p.trail}, and a full box for the food shelf.`
        : `Bring a food-shelf donation or a winter clothing item and pay $${p.withDonation} instead of $${p.trail}. Cheapest scare in the metro.`;

  const groupNote: Record<Group, string> = {
    kids: "Kids Day is the gentle version: lights on, candy out, nobody lunges.",
    friends: "Pick your walking order now. Whoever's last in line gets the most attention.",
    date: "The Tunnel is a very good place to hold hands. Just saying.",
    solo: "Nobody stays alone out there for long. Something will keep you company.",
  };

  return { night, nightWhy, scene: sc, sceneWhy, donation, groupNote: groupNote[group], kidsDay: group === "kids" };
}

export const STORAGE_KEY = "notc12:lastResult";

export interface StoredResult {
  answers: number[];
  at: string;
}

export function loadStored(): StoredResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as StoredResult).answers) &&
      (parsed as StoredResult).answers.length === QUESTIONS.length &&
      (parsed as StoredResult).answers.every((n) => Number.isInteger(n))
    ) {
      return parsed as StoredResult;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStored(answers: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, at: new Date().toISOString() } satisfies StoredResult));
  } catch {
    /* private mode / blocked storage: the result simply isn't remembered */
  }
}
