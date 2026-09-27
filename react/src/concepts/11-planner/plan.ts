/**
 * The planner's data model. State is tiny (four fields); everything the panel
 * shows is derived from it plus business facts.
 */
import { business, type Night } from "@/data/business";
import { approxSunset, formatClock, parseClock, roundTo } from "./time";

export type NightId = Night["id"];

export interface Plan {
  nightId: NightId;
  /** Party size. */
  people: number;
  /** How many of the party are bringing a food-shelf or winter-clothing donation. */
  donors: number;
  /** Also coming to Kids Day earlier that afternoon (only valid on the Kids Day date). */
  kidsDay: boolean;
}

export const PEOPLE_MIN = 1;
export const PEOPLE_MAX = 12;

/** Trail time per the FAQ ("45 minutes to an hour") plus a modest queue estimate. */
const TRAIL_MINUTES = 60;
const QUEUE_MINUTES = 20;
const ARRIVE_EARLY_MINUTES = 30;

export const NIGHTS = business.season.nights;

export const DEFAULT_PLAN: Plan = { nightId: NIGHTS[0].id, people: 2, donors: 0, kidsDay: false };

export const findNight = (id: NightId): Night => NIGHTS.find((n) => n.id === id) ?? NIGHTS[0];

/** True when the night is the same calendar day as Kids Day. */
export const nightHasKidsDay = (night: Night) => night.date === business.kidsDay.date;

/** Fireworks time when the night has one (only some nights carry the field). */
export const nightFireworks = (night: Night): string | undefined => ("fireworks" in night ? night.fireworks : undefined);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Coerce anything (bad localStorage, stale keys) into a valid Plan. */
export function normalizePlan(input: unknown): Plan {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Partial<Record<keyof Plan, unknown>>;
  const nightId = NIGHTS.some((n) => n.id === raw.nightId) ? (raw.nightId as NightId) : DEFAULT_PLAN.nightId;
  const people = clamp(Math.round(Number(raw.people) || DEFAULT_PLAN.people), PEOPLE_MIN, PEOPLE_MAX);
  const donors = clamp(Math.round(Number(raw.donors) || 0), 0, people);
  const kidsDay = raw.kidsDay === true && nightHasKidsDay(findNight(nightId));
  return { nightId, people, donors, kidsDay };
}

export interface LineItem {
  id: string;
  label: string;
  detail: string;
  amount: number;
}

export interface Quote {
  night: Night;
  kidsDayAvailable: boolean;
  lines: LineItem[];
  total: number;
  savings: number;
  sunset: string;
  arriveBy: string;
  gatesOpen: string;
  fireworks?: string;
  outBy: string;
  lastEntry: string;
}

export function computeQuote(plan: Plan): Quote {
  const night = findNight(plan.nightId);
  const { trail, withDonation, kidsDay } = business.pricing;
  const donationOff = trail - withDonation;
  const lines: LineItem[] = [
    { id: "base", label: "Haunted Trail", detail: `${plan.people} × $${trail}`, amount: trail * plan.people },
  ];
  if (plan.donors > 0) {
    lines.push({
      id: "donation",
      label: "Donation discount",
      detail: `${plan.donors} × −$${donationOff}`,
      amount: -donationOff * plan.donors,
    });
  }
  if (plan.kidsDay) {
    lines.push({ id: "kids", label: "Kids Day (afternoon)", detail: `${plan.people} × $${kidsDay}`, amount: kidsDay * plan.people });
    lines.push({ id: "kidsCredit", label: "Kids Day credit", detail: `${plan.people} × −$${kidsDay}`, amount: -kidsDay * plan.people });
  }
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const savings = lines.filter((l) => l.amount < 0).reduce((sum, l) => sum - l.amount, 0);

  const start = parseClock(night.start);
  return {
    night,
    kidsDayAvailable: nightHasKidsDay(night),
    lines,
    total,
    savings,
    sunset: formatClock(roundTo(approxSunset(night.date), 5)),
    arriveBy: formatClock(start - ARRIVE_EARLY_MINUTES),
    gatesOpen: night.start,
    fireworks: nightFireworks(night),
    outBy: formatClock(start + QUEUE_MINUTES + TRAIL_MINUTES),
    lastEntry: business.season.lastEntry,
  };
}
