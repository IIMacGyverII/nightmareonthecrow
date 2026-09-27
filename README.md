# Nightmare on the Crow — 10 Website Concepts

Concept mockups for nightmareonthecrow.com (haunted trail, 6470 Harff Road, Greenfield MN).

**Live demo:** https://iimacgyverii.github.io/nightmareonthecrow/ (GitHub Pages, deploys automatically from `main`).

## How to view
Use the live demo link above, or serve the repo root locally (see Running locally below). The ten static concepts also open straight from `index.html` on disk. It is the launcher/demo page: a gallery of all ten concepts with live, scaled previews of each actual page (same pattern as the CrowRiverSuspension launcher), a one-line "Try:" hint per concept, and an at-a-glance table.
Every page is a single self-contained HTML file (inline CSS/JS, Google Fonts only), so nothing needs a server. It also deploys as-is to Vercel, Netlify or GitHub Pages if you want a shareable URL.

## Files
| File | Concept |
|---|---|
| `sites/01-gazette.html` | The Greenfield Gazette — vintage newspaper, redaction reveal |
| `sites/02-blackout.html` | Blackout — flashlight cursor reveals the page |
| `sites/03-murder.html` | The Murder — live crow flock canvas, editorial brutalism |
| `sites/04-trailmap.html` | Survive the Trail — interactive SVG property map |
| `sites/05-vhs.html` | Tape 09 — VHS / analog horror |
| `sites/06-bonfire.html` | The Bonfire — premium on-brand countdown funnel |
| `sites/07-walkit.html` | Walk It — scrollytelling trail in 8 chapters |
| `sites/08-lightswitch.html` | Lights On / Lights Off — one switch, two audiences |
| `sites/09-almanac.html` | The Scarecrow's Almanac — folk-horror woodcut almanac |
| `sites/10-textadventure.html` | Harff Road — playable text-adventure homepage |

## Round two: React concepts (11–20)
Ten more concepts live in `react/` as a Vite + React 19 + TypeScript multi-page app, one entry per concept (`react/NN-slug.html` + `react/src/concepts/NN-slug/`). All facts come from `react/src/data/business.ts`; shared hooks live in `react/src/shared/`. Each concept has an interactive centerpiece that needs real state: a night planner, a fear quiz, a conditions dashboard, a tarot deck, a snap-scroll ride, a scripted chat concierge, an advent calendar, a Web Audio ambience mixer, a reaction wall, and a split-flap departures board.

| Entry | Concept |
|---|---|
| `react/11-planner.html` | Plan Your Night — live price and itinerary planner |
| `react/12-quiz.html` | How Scared Will You Be? — fear-profile quiz |
| `react/13-conditions.html` | Trail Conditions — status dashboard (simulated data) |
| `react/14-tarot.html` | The Crow's Deck — tarot draw from real scenes |
| `react/15-ride.html` | The Ride — horizontal snap-scroll wagon ride |
| `react/16-chat.html` | Ask the Crow — scripted chat concierge |
| `react/17-calendar.html` | 31 Doors — October advent calendar |
| `react/18-ambience.html` | The Sound of the Crow — Web Audio ambience mixer |
| `react/19-wall.html` | The Scream Wall — reaction wall with fear index |
| `react/20-departures.html` | Departures — split-flap board |

### Running locally
```
cd react
npm install
npm run dev        # dev server; open http://localhost:5173/11-planner.html etc.
npm run build      # typecheck + build all ten into react/dist/
```
The launcher links React concepts at `react/dist/NN-slug.html`, so after `npm run build` serve the repo root (for example `npx serve .`) and open the launcher from there. Vite output uses ES modules, so it needs a server; opening it straight from the file system will not run.

### Deployment
GitHub Pages is built by `.github/workflows/pages.yml` on every push to `main`: it builds the React app, copies it next to the static pages, and deploys. `react/dist` is not committed.

## Crew pages (volunteer portal redesign)
Each concept has a matching `sites/NN-<slug>-crew.html`, a redesign of the client's password-protected volunteer page in that concept's visual language. Each one has: a styled password gate (demo password `crow`; `?crew=open` skips it for previews), a dated message board, a per-night station board built from the real zone/station structure with open slots flagged, a one-step signup that folds in the waiver acknowledgment, a waiver summary, and a link back to the public page. Forms are client-side demos; nothing is sent. The real site password is not in this repo.

`BRIEF.md` holds the shared facts and requirements every concept was built against, including the crew-portal addendum.

## Notes
- All imagery is code-drawn (CSS/SVG/canvas). Labeled placeholder blocks mark where real photos/video go.
- Facts (dates Oct 9/10/16/17, 7:30–10:30 PM with last entry 10 PM, fireworks Oct 10 at 7:45 PM, $20 / $15 with donation, Kids Day Oct 10 noon–3 $5) reflect the live site and the owner's crew page as of Sept 26 2026.
- Every "Get Tickets" button links to the client's real HauntPay page.
