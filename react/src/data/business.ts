/**
 * Single source of truth for every business fact used by the React concepts.
 * Concepts import from "@/data/business" and never hardcode facts.
 * Facts reflect nightmareonthecrow.com and the owner's crew page, Sept 26 2026.
 */

export const business = {
  name: "Nightmare on the Crow",
  tagline: "It All Begins with a Hayride!",
  voice: "This isn't just a haunt. It's an experience designed to crawl under your skin.",
  address: {
    street: "6470 Harff Road",
    city: "Greenfield",
    state: "MN",
    zip: "55373",
    full: "6470 Harff Road, Greenfield, MN 55373",
    mapsUrl: "https://maps.google.com/?q=6470+Harff+Road+Greenfield+MN",
  },
  ticketUrl: "https://app.hauntpay.com/events/nightmare-on-the-crow-haunted-trail",
  socials: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
  ],
  origin:
    "Three neighbors — Jason Michaud, David Jubert and Benjamin Hannay — who loved Halloween and giving back, and started with a hayride.",
  crew: [
    { name: "Evan", role: "Plays Beetlejuice. Runs socials and tech." },
    { name: "Ben", role: "Set designer. The skeleton in the cage, the zombie graveyard." },
  ],
  season: {
    year: 2026,
    /** Opening night, America/Chicago. */
    opensAt: "2026-10-09T19:30:00-05:00",
    hours: "7:30 – 10:30 PM",
    lastEntry: "10:00 PM",
    nights: [
      { id: "oct9", date: "2026-10-09", label: "Fri, Oct 9", short: "Oct 9", note: "Opening night", start: "7:30 PM", end: "10:30 PM" },
      { id: "oct10", date: "2026-10-10", label: "Sat, Oct 10", short: "Oct 10", note: "Fireworks 7:45 · haunt 8:00", start: "8:00 PM", end: "10:30 PM", fireworks: "7:45 PM" },
      { id: "oct16", date: "2026-10-16", label: "Fri, Oct 16", short: "Oct 16", note: "Second weekend", start: "7:30 PM", end: "10:30 PM" },
      { id: "oct17", date: "2026-10-17", label: "Sat, Oct 17", short: "Oct 17", note: "Closing night", start: "7:30 PM", end: "10:30 PM" },
    ],
  },
  pricing: {
    trail: 20,
    withDonation: 15,
    donationNote: "Bring a food-shelf donation or a winter clothing item (hats, gloves, coats) and pay $15.",
    kidsDay: 5,
    kidsDayCredit: "Your Kids Day ticket is worth $5 off an evening haunt ticket.",
  },
  kidsDay: {
    date: "2026-10-10",
    label: "Sat, Oct 10",
    time: "Noon – 3 PM",
    blurb: "Lights-on trail, trick-or-treating, family activities, and the Hanover Fire Department on site. Come back at dark for fireworks at 7:45.",
  },
  community: {
    headline: "Donate If You Dare",
    partners: ["Hanover Fire Department", "Local food shelf"],
    accepts: ["Canned goods and pantry staples", "Winter jackets, snow pants, boots", "Hats and gloves"],
  },
  foodTrucks: ["Just in Time Concessions", "Burger Box"],
  /** Real scene names, approved by the owner for public use. */
  scenes: [
    { zone: "The Yard", names: ["The Bridge", "Beetlejuice", "The Butcher", "The Black Sheets", "Blackout"] },
    { zone: "The Woods", names: ["The Witch", "Dark Harvest", "The Bus", "The Barn Hang", "The Tunnel", "The Cage", "The Last Woods"] },
    { zone: "The Back Forty", names: ["The Junk & Candy Van", "The Corn Field", "The Graveyard", "The Camp", "The Crossing", "The Saloon"] },
  ],
  attractions: [
    { title: "The Hayride", blurb: "The wagon carries you to the edge of the forest. The last comfortable seat you'll have all night." },
    { title: "The Trail", blurb: "Winding paths through real woods along the Crow River. Every turn is a decision. Every decision is wrong." },
    { title: "The Tunnels", blurb: "Low, tight and pitch black. Keep a hand on the shoulder in front of you." },
    { title: "Haunted Buildings", blurb: "Rooms full of live actors and displays. The skeleton in the cage lives here." },
    { title: "The Corn Maze", blurb: "The corn is taller than you are, and it doesn't want you to leave." },
  ],
  faq: [
    { q: "How scary is it?", a: "Intense. Live actors, darkness, fog, strobes, tight spaces and sudden scares. It's designed for teens and adults. Kids Day is the gentle version." },
    { q: "What age is it for?", a: "We recommend 13+ for the night haunt. Under 13 should bring a parent, and consider Kids Day on Oct 10 instead." },
    { q: "Will the actors touch me?", a: "No. Our actors never touch guests, and we ask the same of you." },
    { q: "How long does it take?", a: "Plan on 45 minutes to an hour from the wagon to the exit, plus your wait." },
    { q: "What if it rains?", a: "We run in light rain. It's a forest trail, so wear boots. Severe weather closes us, and we'll post on socials." },
    { q: "Is there parking?", a: "Yes, free parking in the field at 6470 Harff Road. Follow the signs and the volunteers with flashlights." },
    { q: "Is it wheelchair accessible?", a: "The trail is natural terrain with mud, roots and hills, so it isn't accessible by wheelchair. Kids Day is easier going. Contact us and we'll help where we can." },
    { q: "Is there food?", a: "Yes. Just in Time Concessions and Burger Box are on site every night." },
  ],
} as const;

export type Night = (typeof business.season.nights)[number];
