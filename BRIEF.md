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
