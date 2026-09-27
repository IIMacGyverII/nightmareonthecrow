/**
 * The Crow's brain: a local, scripted intent matcher. No AI, no network.
 * Every answer is assembled from `business` data at reply time so a fact
 * never lives in two places.
 */
import { business, type Night } from "@/data/business";

export interface ChatLink {
  label: string;
  href: string;
  /** Opens in a new tab (external). */
  external?: boolean;
}

export interface Reply {
  text: string;
  links?: ChatLink[];
}

export interface Intent {
  id: string;
  /** Canonical question, used as the suggestion chip label. */
  label: string;
  /** [pattern, weight] pairs. The highest total wins; ties go to the earlier intent. */
  patterns: ReadonlyArray<readonly [RegExp, number]>;
  reply: () => Reply;
  /** Suggested follow-up intents. */
  next: readonly string[];
}

const b = business;
const money = (n: number) => `$${n}`;

/** "a, b and c" */
function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

type FireworksNight = Extract<Night, { fireworks: string }>;
const fireworksNight = b.season.nights.find((n): n is FireworksNight => "fireworks" in n);

/** Pull the owner's own FAQ answer by matching the question. */
function faqAnswer(re: RegExp): string {
  return b.faq.find((f) => re.test(f.q))?.a ?? "";
}

const allScenes = b.scenes.flatMap((z) => z.names);
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const fireworksLine = fireworksNight
  ? ` ${fireworksNight.label} is different: fireworks at ${fireworksNight.fireworks}, then the haunt runs ${fireworksNight.start} – ${fireworksNight.end}.`
  : "";

export const GREETING: Reply = {
  text: `Evening. I'm the Crow. I sit on the fence at ${b.address.street} and I know everything that happens on this trail. Ask me about dates, tickets, the price, Kids Day, or what's waiting in the woods.`,
};

export const INTENTS: readonly Intent[] = [
  {
    id: "secret",
    label: "Tell me a secret",
    patterns: [[/\b(secrets?|spoilers?|hint|tell me something|easter egg|behind the scenes|what should i know)\b/i, 4]],
    reply: () => ({
      text: `Closer. Between us: somewhere on the trail there's a scene called “${pick(allScenes)}.” That's all you get. If you tell them I told you, I'll deny it.`,
    }),
    next: ["scenes", "scary", "tickets"],
  },
  {
    id: "real",
    label: "Are you real?",
    patterns: [[/\b(are you real|real\??$|robot|bot|ai|human|person|alive|chatgpt|computer|who are you|what are you)\b/i, 3]],
    reply: () => ({
      text: "Real enough. I'm not an AI and I'm not a person — I'm a script with a beak. Every answer I give comes straight from the owners' own numbers, so I can't make anything up. Wish I could.",
    }),
    next: ["secret", "dates", "price"],
  },
  {
    id: "fireworks",
    label: "When are the fireworks?",
    patterns: [[/\bfirework/i, 4]],
    reply: () => ({
      text: fireworksNight
        ? `${fireworksNight.label}. Fireworks at ${fireworksNight.fireworks}, then the haunt runs ${fireworksNight.start} – ${fireworksNight.end}, last entry ${b.season.lastEntry}. Kids Day guests: come back at dark.`
        : "No fireworks on the schedule this year.",
    }),
    next: ["kidsday", "dates", "tickets"],
  },
  {
    id: "kidsday",
    label: "Tell me about Kids Day",
    patterns: [[/\b(kids?|children|child|family|families|little ones?|toddlers?|lights[- ]on|trick[- ]or[- ]treat\w*|noon|daytime)\b/i, 3]],
    reply: () => ({
      text: `Kids Day is ${b.kidsDay.label}, ${b.kidsDay.time}, ${money(b.pricing.kidsDay)} a ticket. ${b.kidsDay.blurb} ${b.pricing.kidsDayCredit}`,
      links: [{ label: "Kids Day tickets", href: b.ticketUrl, external: true }],
    }),
    next: ["fireworks", "age", "price"],
  },
  {
    id: "donation",
    label: "How does the donation deal work?",
    patterns: [[/\b(donat\w*|food[- ]?shelf|canned?|clothing|coats?|jackets?|hats?|gloves?|discount|deal|cheaper|\$?15|fifteen)\b/i, 3]],
    reply: () => ({
      text: `${b.pricing.donationNote} That's ${money(b.pricing.trail)} down to ${money(b.pricing.withDonation)}. We take ${listJoin(b.community.accepts.map((a) => a.toLowerCase()))}. It goes to ${listJoin(b.community.partners)}. Cheapest scare in the west metro, and it keeps someone warm.`,
    }),
    next: ["tickets", "community", "dates"],
  },
  {
    id: "price",
    label: "How much is it?",
    patterns: [[/\b(prices?|costs?|how much|expensive|cheap|dollars?|admission|fee|pay)\b|\$/i, 2]],
    reply: () => ({
      text: `${money(b.pricing.trail)} for the Haunted Trail. ${money(b.pricing.withDonation)} if you bring a food-shelf donation or a winter clothing item. Kids Day is ${money(b.pricing.kidsDay)}, and that ticket is worth ${money(b.pricing.kidsDay)} off an evening haunt. No hidden fees — I hate those more than daylight.`,
    }),
    next: ["donation", "tickets", "kidsday"],
  },
  {
    id: "tickets",
    label: "Where do I get tickets?",
    patterns: [[/\b(tickets?|buy|purchase|book\w*|reserve|online|sold out|refund\w*|cash|card|entry)\b/i, 2]],
    reply: () => ({
      text: `Online, through the link below. ${money(b.pricing.trail)} a ticket, or ${money(b.pricing.withDonation)} with a donation at the gate. Buy for the night you want: ${listJoin(b.season.nights.map((n) => n.short))}.`,
      links: [{ label: "Get Tickets", href: b.ticketUrl, external: true }],
    }),
    next: ["dates", "donation", "directions"],
  },
  {
    id: "hours",
    label: "What time does it run?",
    patterns: [
      [/\b(hours|what time|time|o'?clock|closes?|closing|late|last entry|pm|start\w*|gates?)\b/i, 2],
      [/\bopen\b/i, 1],
    ],
    reply: () => ({
      text: `${b.season.hours}, last entry ${b.season.lastEntry}. After that the trail keeps whoever it already has.${fireworksLine}`,
    }),
    next: ["dates", "duration", "tickets"],
  },
  {
    id: "dates",
    label: "When are you open?",
    patterns: [[/\b(dates?|when|what days?|which (days?|nights?)|nights?|open(ing)?|schedule|october|oct|weekends?|this year|season)\b/i, 2]],
    reply: () => ({
      text: `Four nights in ${b.season.year}: ${b.season.nights.map((n) => n.label).join(" · ")}. ${b.season.hours}, last entry ${b.season.lastEntry}.${fireworksLine}`,
      links: [{ label: "Get Tickets", href: b.ticketUrl, external: true }],
    }),
    next: ["hours", "fireworks", "tickets"],
  },
  {
    id: "age",
    label: "What age is it for?",
    patterns: [[/\b(ages?|old|year[- ]olds?|teens?|teenagers?|minimum|13|too young|appropriate)\b/i, 3]],
    reply: () => ({ text: faqAnswer(/age/i) }),
    next: ["kidsday", "scary", "touching"],
  },
  {
    id: "scary",
    label: "How scary is it?",
    patterns: [[/\b(scar\w*|intens\w*|frighten\w*|terrif\w*|jump ?scares?|strobes?|fog|clowns?|gory|blood|nightmares?|creepy|afraid)\b/i, 2]],
    reply: () => ({ text: `${faqAnswer(/scary/i)} ${b.voice}` }),
    next: ["touching", "age", "duration"],
  },
  {
    id: "touching",
    label: "Will the actors touch me?",
    patterns: [[/\b(touch\w*|grab\w*|contact|chase\w*|hands on|physical)\b/i, 3]],
    reply: () => ({ text: `${faqAnswer(/touch/i)} Screaming is allowed. Encouraged, honestly.` }),
    next: ["scary", "age", "tickets"],
  },
  {
    id: "accessibility",
    label: "Is it wheelchair accessible?",
    patterns: [[/\b(wheelchairs?|accessib\w*|strollers?|disab\w*|mobility|walker|ada)\b/i, 4]],
    reply: () => ({ text: faqAnswer(/wheelchair/i) }),
    next: ["kidsday", "duration", "directions"],
  },
  {
    id: "parking",
    label: "Is there parking?",
    patterns: [[/\bpark\w*|\blot\b/i, 3]],
    reply: () => ({ text: faqAnswer(/parking/i) }),
    next: ["directions", "hours", "food"],
  },
  {
    id: "weather",
    label: "What if it rains?",
    patterns: [[/\b(rain\w*|weather|storm\w*|cold|snow\w*|cancel\w*|wet|mud\w*|forecast)\b/i, 3]],
    reply: () => ({
      text: `${faqAnswer(/rain/i)} Bring a coat — for you, or to donate.`,
      links: b.socials.map((s) => ({ label: s.label, href: s.href })),
    }),
    next: ["hours", "donation", "parking"],
  },
  {
    id: "food",
    label: "Is there food?",
    patterns: [[/\b(food|eat|hungry|snacks?|drinks?|concessions?|burgers?|trucks?|cider|cocoa|coffee)\b/i, 3]],
    reply: () => ({ text: `${faqAnswer(/food/i)} That's ${listJoin(b.foodTrucks)}. Eat before the corn. Trust me.` }),
    next: ["hours", "parking", "duration"],
  },
  {
    id: "duration",
    label: "How long does it take?",
    patterns: [[/\b(how long|long|minutes|hour|duration|length|takes?)\b/i, 2]],
    reply: () => ({ text: faqAnswer(/how long/i) }),
    next: ["hours", "food", "scary"],
  },
  {
    id: "crew",
    label: "How do I join the crew?",
    patterns: [[/\b(crew|volunteer\w*|actors?|acting|jobs?|work|hire|hiring|join|help out|auditions?|log ?in)\b/i, 3]],
    reply: () => ({
      text: `We run on neighbors who volunteer. ${b.crew.map((c) => `${c.name} — ${c.role}`).join(" ")} If you can scream, build, or sell shirts, there's a spot for you. Details are in the Join the Crew section below.`,
      links: [{ label: "Join the Crew", href: "#crew" }],
    }),
    next: ["community", "scenes", "dates"],
  },
  {
    id: "directions",
    label: "Where are you?",
    patterns: [[/\b(where|address|located?|location|directions?|maps?|far|drive|driving|minneapolis|greenfield|get there|find you|road)\b/i, 2]],
    reply: () => ({
      text: `${b.address.full}. Look for the crows, then the signs, then the volunteers with flashlights.`,
      links: [{ label: "Open in Maps", href: b.address.mapsUrl, external: true }],
    }),
    next: ["parking", "hours", "tickets"],
  },
  {
    id: "community",
    label: "Who runs this?",
    patterns: [[/\b(community|charity|give back|giv\w* back|fire ?department|hanover|neighbors?|who runs|owners?|founders?|started|story|history|origin|about)\b/i, 2]],
    reply: () => ({
      text: `${b.origin} ${b.community.headline}: every donation goes to ${listJoin(b.community.partners)}. That's the whole reason the lights come on.`,
    }),
    next: ["donation", "crew", "dates"],
  },
  {
    id: "scenes",
    label: "What's in the woods?",
    patterns: [
      [/\b(what'?s (out |in )?(there|inside)|attractions?|scenes?|expect|hayride|trail|tunnels?|buildings?|corn|maze|woods|witch|butcher|bridge|graveyard|saloon|beetlejuice|cage|bus|camp|rooms?)\b/i, 2],
    ],
    reply: () => ({
      text: `${listJoin(b.attractions.map((a) => a.title))}. ${b.scenes.map((z) => `${z.zone}: ${listJoin(z.names.slice(0, 3))}`).join(". ")}. And more I'm not allowed to say. Ask nicely for a secret.`,
    }),
    next: ["secret", "scary", "duration"],
  },
  {
    id: "thanks",
    label: "Thanks",
    patterns: [[/\b(thanks?|thank you|thx|ty|cheers|appreciate)\b/i, 3]],
    reply: () => ({ text: "Don't thank me yet. You still have to walk out." }),
    next: ["tickets", "dates", "secret"],
  },
  {
    id: "bye",
    label: "Bye",
    patterns: [[/\b(bye|goodbye|see you|later|good ?night|cya|leaving)\b/i, 3]],
    reply: () => ({ text: `Go on, then. ${b.season.nights[0].label}, ${b.season.nights[0].start}. I'll be on the fence.` }),
    next: ["tickets", "dates"],
  },
  {
    id: "hello",
    label: "Hello",
    patterns: [[/^\s*(hi|hello|hey|yo|sup|evening|good (morning|evening|afternoon)|howdy|greetings)\b/i, 2]],
    reply: () => ({ text: `Evening. Four nights, ${money(b.pricing.trail)} a ticket, ${money(b.pricing.withDonation)} with a donation. What do you want to know?` }),
    next: ["dates", "price", "scenes"],
  },
];

export const FALLBACK: Intent = {
  id: "fallback",
  label: "Help",
  patterns: [],
  reply: () => ({
    text: "I only know the trail. Try me on dates, hours, the price, Kids Day, parking, weather, food, or what's in the woods.",
  }),
  next: ["dates", "price", "kidsday", "scenes"],
};

const byId = new Map<string, Intent>([...INTENTS, FALLBACK].map((i) => [i.id, i]));
export const intentById = (id: string): Intent => byId.get(id) ?? FALLBACK;

/** Highest weighted-pattern score wins. Ties go to the earlier (more specific) intent. */
export function matchIntent(input: string): Intent {
  const text = input.trim();
  if (!text) return FALLBACK;
  let best: Intent = FALLBACK;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.patterns.reduce((sum, [re, w]) => (re.test(text) ? sum + w : sum), 0);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}
