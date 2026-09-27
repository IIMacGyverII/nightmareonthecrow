import { business } from "@/data/business";

/**
 * The seven stops of the ride, in order. Scene stops are looked up in
 * business.scenes so the zone label (The Yard, The Woods, The Back Forty)
 * always comes from data.
 */
const RIDE_SCENES = ["The Bridge", "The Tunnel", "The Corn Field", "The Graveyard"] as const;

function zoneOf(name: string) {
  return business.scenes.find((z) => (z.names as readonly string[]).includes(name));
}

/** Other real scenes in the same zone as `name` (for the "also in this zone" chips). */
export function siblingsOf(name: string): readonly string[] {
  const zone = zoneOf(name);
  return zone ? zone.names.filter((n) => n !== name) : [];
}

export interface Stop {
  id: string;
  name: string;
  eyebrow: string;
}

const streetName = business.address.street.replace(/^\d+\s*/, "");

export const STOPS: readonly Stop[] = [
  { id: "ride-0", name: streetName, eyebrow: `${business.address.city}, ${business.address.state}` },
  { id: "ride-1", name: "The Wagon", eyebrow: "Boarding" },
  ...RIDE_SCENES.map((name, i) => ({ id: `ride-${i + 2}`, name, eyebrow: zoneOf(name)?.zone ?? "The Trail" })),
  { id: "dawn", name: "Dawn", eyebrow: "Everything you need" },
];

export const DAWN_INDEX = STOPS.length - 1;
