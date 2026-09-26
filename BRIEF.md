# Nightmare on the Crow — Website Concept Brief (shared by all 10 concepts)

## The client (all facts verified from nightmareonthecrow.com, Sept 2026)
- Name: **Nightmare on the Crow** (haunted trail attraction). Logo motif: crow silhouette. Current brand colors: orange + black.
- Address: **6470 Harff Road, Greenfield, MN 55373** (west metro, ~35 min from Minneapolis, near the Crow River).
- Origin: **three neighbors** who loved Halloween and giving back. Tagline on their site: **"It All Begins with a Hayride!"**
- What guests do: haunted trail winding through the forest, tunnels and winding paths, haunted buildings full of live actors and displays, an eerie corn maze, interactive scares. Copy voice: *"This isn't just a haunt. It's an experience designed to crawl under your skin."*
- 2026 season nights: **Oct 9, 10, 16, 17** — **7:30 PM to 10:00 PM** (last entry 10 PM).
- Pricing: **Haunted Trail $20** — **$15 if you bring a food-shelf donation or winter clothing item** (hats, gloves, coats).
- **Kids Day**: **Sat Oct 10, Noon–3 PM, $5** — lights-on trail, trick-or-treating, family activities. Kids Day ticket is redeemable for **$5 off** an evening haunt ticket.
- Community give-back: food shelf drive, winter clothing drive, partnership with **Hanover Fire Department**.
- Food trucks on site: **Just in Time Concessions**, **Burger Box**.
- Crew highlights: **Evan** (plays "Beetlejuice", also runs social/tech), **Ben** (set designer; "skeleton trapped in the cage", zombie graveyard). They recruit volunteer actors ("Join the Crew"), and have an actor login.
- Socials: Facebook, Instagram, TikTok (use `#` placeholder links).
- Ticket link (use for every "Get Tickets" CTA): https://app.hauntpay.com/events/nightmare-on-the-crow-haunted-trail

## Competitive landscape (Twin Cities)
The Abandoned Hayride (Chaska), Scream Town (Chaska), The Dead End Hayride (Wyoming MN), The Haunting Experience (Cottage Grove). All have dark generic templates, **hide pricing** behind ticket vendors, have thin lore, no countdowns, no real storytelling. Our advantage: small, local, neighbor-built, charitable, cheap ($20 vs $30–50), transparent. Every concept should make pricing loud and proud and lean into local folklore + community.

## Hard requirements for every concept page
1. **One self-contained HTML file** (inline CSS + JS). May load Google Fonts via `<link>`. NO other external assets, NO image files, NO CDN libraries. Must work when opened directly via `file://`.
2. **No `<img>` tags pointing at real files.** Build all visuals with CSS (gradients, shapes, text), inline SVG (crows, moons, trees, corn, scarecrows, etc.), and/or `<canvas>` animations. Where a real photo/video would go in production, render a clearly-styled placeholder block labeled e.g. "PHOTO: trail entrance at dusk" so the client understands the intent.
3. **Fully responsive** (looks great at 390px phone width and 1440px desktop). Sticky/mobile-friendly nav. No horizontal scroll.
4. **Sections every page must include** (in whatever form fits the concept): hero with primary "Get Tickets" CTA · attractions/what-to-expect (trail, tunnels, haunted buildings, corn maze, live actors) · dates & hours (4 nights) · pricing (with the $15 donation discount made prominent) · Kids Day · Community give-back (food shelf, winter clothing, Hanover FD) · Join the Crew · FAQ (6–8 real questions: how scary, age recommendation, weather, parking, how long, touching policy, wheelchair/accessibility, food) · directions/location · footer with socials.
5. **A live countdown** to Oct 9, 2026 7:30 PM (America/Chicago) somewhere on the page.
6. Respect `prefers-reduced-motion` (disable heavy animations). Accessible: semantic headings, alt text on SVGs via `aria-label`, focus styles, sufficient contrast for body text.
7. Keep file under ~150 KB. Clean, well-commented code. Include a `<title>` and a `<meta name="description">`.
8. Small fixed badge in a corner: "CONCEPT #N — <concept name>" so the client can tell them apart.
9. Write real, punchy copy in the concept's voice. No lorem ipsum. Do not invent new facts about the business (no fake awards, no fake reviews with names — a "what guests say" block may use anonymous single-line quotes marked as sample).
10. Zero JS console errors. Test the logic mentally: countdown must not show NaN.

---

# ADDENDUM (Sept 26 2026): Crew Portal + corrected facts

## Corrected / new public facts (apply to the public concept page)
- Haunt nights run **7:30 PM – 10:30 PM, last entry 10:00 PM** (not 10:00 close). Update every place the hours appear.
- **Saturday Oct 10: fireworks at 7:45 PM**, then the haunt runs **8:00 – 10:30 PM** (last entry 10 PM). Call this out on the dates/schedule and Kids Day sections ("Come back at dark for fireworks").
- The owner has approved using the real scene names publicly. Where the concept lists attractions, you may name real scenes: the Bridge, Beetlejuice, the Butcher, the Black Sheets, Blackout, the Witch, Dark Harvest, the Bus, the Barn Hang, the Tunnel, the Cage, the Last Woods, the Junk & Candy Van, the Corn Field, the Graveyard, the Camp, the Crossing, the Saloon. Keep the existing four-part structure (trail / tunnels / buildings / corn) and sprinkle names in; don't rewrite the whole section.
- The three neighbors may be named: **Jason Michaud, David Jubert, Benjamin Hannay**. Use sparingly (e.g., the origin/community section), never in a way that reads like a legal notice.

## The current crew portal (what we're replacing)
The live site has a Squarespace page-password "Log-in" page for volunteers ("Welcome to the Volunteer Page!"). It contains: (1) a hand-typed Message Board with dated updates; (2) a "Walkthrough Signup" that is just a link to, and a tiny embed of, a Google Sheet volunteers edit themselves (name, dates attending, preferred zone, preferred station); (3) "Haunter and Help Zones" — a second embedded Google Sheet, one tab per night, a grid of zones/stations with open slots shown in red as "Need Actor" / "Need Help"; (4) the full Volunteer Agreement & Liability Waiver followed by a form (I AGREE, first name, last name, email, newsletter checkbox). Problems: embedded spreadsheets are unusable on phones, the sheet is free-for-all editable, the waiver form and the signup sheet aren't connected, no per-night roster, no confirmation. Volunteers are unpaid. There are monthly mid-month, mid-week evening meetups for set design and ideas.

## Zones and stations (real, from the crew sheet; slot counts for Opening Night Oct 9)
Format: station — filled/total. "Need" means open slots.
**Zone I · Front & Operations:** Tickets 4/4 · In Charge 1/1 · Front Entertainer 0/2 · Set Design 4/6 · Shirt Sales 1/1 · Security 3/4
**Zone II · The Yard:** Ben's Shed 0/4 · Bridge 0/1 · Beetlejuice 1/1 · Kids Shack 8/8 · Butcher 0/1 · Black Sheets 0/2 · Blackout 0/1
**Zone III · The Woods:** Witch 0/1 · Dark Harvest 2/5 · Bus 0/1 · Barn Hang 0/4 · Tunnel 0/2 · Cage 0/1 · Last Woods 0/1
**Zone IV · The Back Forty:** Garage/Shed 0/3 · Junk & Candy Van 0/3 · Corn Field 0/3 · Graveyard 0/2 · Camp 0/2 · Crossing Camp 0/3 · Saloon 0/2
For the other three nights, vary the filled counts a little (deterministically, e.g. +1 on a few stations for Oct 10, −1 on a couple for Oct 16/17) so the night tabs visibly differ. Never invent volunteer names; show filled slots as anonymous avatars/initials like "—" or "✓", not names. (Evan plays Beetlejuice and Ben builds sets — those two are public on the About page and may be shown.)

## Waiver — key points to summarize on the crew page (don't reproduce the whole legal text)
Unpaid volunteer, not employment · arrive on time, stay in your assigned area · **no physical contact** with guests, no chasing that could cause harm · no alcohol/substances · follow fire, emergency and first-aid procedures · hazards: strobes, fog, darkness, confined spaces, uneven ground, weather, mud, wildlife · keep layouts and scare tactics confidential · costumes/props are company property · photo/video release · assumption of risk and release of liability · Minnesota law. Offer a "Read the full agreement" expandable (`<details>`) with placeholder paragraphs labeled "FULL WAIVER TEXT — supplied by owner".

## Crew page requirements (one new file per concept: `sites/NN-<slug>-crew.html`)
Build a second page in the SAME visual language as the concept (same fonts, palette, motifs, nav treatment, concept badge reading "CONCEPT #N — <name> · CREW"). It must include, in this order (styled however the concept dictates):
1. **Gate.** A password screen styled to the concept. This is a DEMO gate: the password is `crow` and the gate says so in small print ("Demo password: crow"). On correct entry, reveal the portal (hide gate, show content; remember in sessionStorage in try/catch). Wrong entry: an in-character error. NEVER put the real site password anywhere in code or copy. Also accept `?crew=open` in the URL to skip the gate (for the launcher preview).
2. **Message board.** Dated posts, newest first: (a) Sept 26 2026 — hours 7:30–10:30, last entry 10; fireworks Oct 10 7:45 then haunt 8–10:30; (b) Aug 25 2026 — "Dates we need help" listing all four nights; (c) Mar 16 2026 — monthly mid-month mid-week meetups for set design and ideas. Plus a pinned "Walkthrough" note: pick a walkthrough date when you sign up.
3. **Station board.** Four night tabs (Fri Oct 9 · Sat Oct 10 · Fri Oct 16 · Sat Oct 17). For the selected night, show Zones I–IV, each station as a card/row with filled vs open slot pips and a loud "NEED ACTOR" / "NEED HELP" state on open slots. A summary line: "N open spots tonight". Clicking an open slot pre-fills the signup form's zone/station fields and scrolls to it. Must be readable and tappable on a phone (no tables that need horizontal scrolling on 390px; stack instead).
4. **One-step signup.** A single form: first name, last name, email, phone (optional), nights you can work (4 checkboxes), preferred zone (select), preferred station (select, filtered by zone), walkthrough date (select of 3–4 September/October evenings, invented as "TBD by owner" placeholders is fine), a required "I have read and agree to the Volunteer Agreement" checkbox, a newsletter checkbox, and a Submit button. No backend: on submit, validate required fields client-side and show a confirmation state in-character ("You're on the list for 2 nights…"). Note under the button: "Demo — nothing is sent."
5. **Waiver summary** (bullets above) with the `<details>` full-text placeholder.
6. **Crew footer**: address, "Questions? Contact us", back to the public site (link to `NN-<slug>.html`), socials.
Also: countdown to opening night is optional here. Respect prefers-reduced-motion. Same self-contained, no-image, no-CDN rules as the public pages. Keep under ~120 KB.

## Changes to the existing public concept page
- Fix the hours everywhere (7:30–10:30, last entry 10 PM) and add the Oct 10 fireworks callout.
- Add a "Crew Log-in" link in the nav (or nav utility area) and a clear "Already on the crew? Log in" link/button in the Join the Crew section, both pointing to `NN-<slug>-crew.html`.
- Optionally weave 4–8 real scene names into the attractions copy.
- Do not otherwise restyle or restructure the page.
