# CLAUDE.md

Website concept pitch for Nightmare on the Crow, a volunteer-run haunted
trail at 6470 Harff Road, Greenfield, MN (nightmareonthecrow.com, currently
Squarespace). Prospective client. Currently in the design-selection phase:
the repo is a gallery of twenty complete homepage concepts for the owners to
choose from. Once one is picked, it gets promoted and the rest are removed.

Live demo (shared with the owners): https://iimacgyverii.github.io/nightmareonthecrow/

## Structure

Two rounds, one launcher.

- `index.html` — the launcher. Static page with live scaled `<iframe>`
  previews of every concept, a "Try:" hint per card, a Crew page link on
  rounds-one cards, and an at-a-glance table. Card numbers must match
  file numbers.
- `sites/NN-<slug>.html` — round one (01–10). Each concept is ONE
  self-contained HTML file: inline CSS/JS, Google Fonts only, no images,
  no CDNs. Opens straight from disk.
- `sites/NN-<slug>-crew.html` — a matching crew/volunteer portal for each
  round-one concept, in the same visual language. Demo gate password is
  `crow` (printed on the gate); `?crew=open` skips the gate for previews.
- `react/` — round two (11–20). Vite 6 + React 19 + TypeScript, plain CSS,
  no UI libraries. Multi-page: `react/NN-<slug>.html` is the entry and
  `react/src/concepts/NN-<slug>/` holds that concept's code, scoped under a
  root class like `.c11`. No shared components between concepts; they
  compete, they don't cooperate.
- `react/src/data/business.ts` — single source of truth for ALL facts
  (dates, hours, pricing, scenes, FAQ, crew, address). React concepts
  import it; never hardcode facts. Round-one files predate it and carry
  the same facts inline; `BRIEF.md` is their source.
- `react/src/shared/` — `useCountdown`, `useReducedMotion`, `ConceptBadge`.
  Every concept renders the badge so the client can tell them apart.
- `BRIEF.md` — client facts, competitor research, hard requirements for
  round one, plus the crew-portal addendum. `react/REACT-BRIEF.md` — the
  round-two rules. Read both before building or editing a concept.
- `research/` — gitignored. Notes from the owner's password-protected
  volunteer page. Never commit it; the repo is public.

## Facts to keep straight (as of Sept 26 2026)

- Nights: Oct 9, 10, 16, 17 2026 · 7:30–10:30 PM · last entry 10:00 PM.
- Oct 10: fireworks 7:45 PM, haunt 8:00–10:30. Kids Day same day, noon–3, $5.
- Pricing: $20, or $15 with a food-shelf or winter-clothing donation.
  Make this loud; every competitor hides pricing.
- Real scene names and the three neighbors' names are approved for
  public use by the owner (confirmed Sept 26 2026).
- Tickets go to the HauntPay URL in `business.ts`. Socials are `#`
  placeholders.

## Rules

- No real volunteer names or emails anywhere. Evan and Ben are public
  (About page); nobody else.
- The real site password must never appear in any file. Only the demo
  word `crow`.
- Photos are labeled placeholder blocks until the owners supply real
  shots. No stock imagery, no external image files.
- Simulated numbers (conditions dashboard, reaction wall, donations
  count) stay visibly labeled as sample data.
- Every concept: responsive 390→1440, no horizontal scroll, FAQ from
  data, countdown to opening night, `prefers-reduced-motion` respected.

## Workflow

```
cd react
npm install
npm run dev          # http://localhost:5173/11-planner.html etc.
npm run build        # typecheck + build all ten into react/dist/
ONLY=13-conditions npx vite build   # one concept → react/dist-only/
```

- The launcher links React concepts at `react/dist/NN-slug.html`. Vite
  output needs a server: after building, serve the repo root
  (`npx serve .` or `python -m http.server`) to view the launcher locally.
  Round-one pages open from disk fine.
- Deploys are automatic: push to `main` → `.github/workflows/pages.yml`
  builds the React app, copies it next to `sites/` and `index.html`, and
  deploys to GitHub Pages in about a minute. `react/dist` is gitignored.
  Run `npm run build` before pushing; the live URL is in the owners' hands.
- Git identity is repo-local (set already). Commits are pushed over gh's
  cached HTTPS credentials.

## Verification gotchas

- Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
  Headless screenshots work, but Windows Chrome ignores narrow
  `--window-size`, so test phone widths by framing the page in a 390px
  `<iframe>` served from the same origin.
- `--virtual-time-budget` fast-forwards timers. It exposes unclamped
  tweens and runaway intervals (it found two real bugs), so treat
  exploding numbers in a headless shot as a bug, not an artifact.
- Kill any `http.server` / `vite preview` you start; parallel agents have
  left them running on ports 41xx, 43xx and 8765 before.
