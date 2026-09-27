# React Concepts Brief (concepts 11–20)

Read `../BRIEF.md` first for the client, the competitive landscape and the tone. This file covers the React round.
Facts (dates, hours, pricing, scenes, FAQ) live in `src/data/business.ts`. **Import them; never hardcode facts.**

## Stack
Vite 6 · React 19 · TypeScript (strict, `noUnusedLocals`) · plain CSS per concept (no Tailwind, no UI libraries, no npm additions).
Fonts: Google Fonts `<link>` in the concept's HTML entry only. No images, no CDN scripts, no external assets otherwise.
Visuals are code-drawn: CSS, inline SVG (as JSX), `<canvas>`. Where a real photo/video would go, render a labeled placeholder block ("PHOTO: …").

## Files each concept owns (and nothing else)
```
react/NN-slug.html                      # entry: <div id="root"> + <script type="module" src="/src/concepts/NN-slug/main.tsx">
react/src/concepts/NN-slug/main.tsx     # createRoot(...).render(<App />)
react/src/concepts/NN-slug/App.tsx      # the concept (split into more files in the same folder if you like)
react/src/concepts/NN-slug/styles.css   # imported by App.tsx; scope everything under a root class like `.c11`
```
Entry HTML: `<!doctype html>`, `lang="en"`, viewport meta, `<title>`, `<meta name="description">`, Google Fonts link, `<body><div id="root"></div>`. Give `<html>`/`<body>` a background color in styles.css so the page never flashes white (unless the concept is light).

Shared code (already written, use it, don't modify it):
- `@/data/business` — all facts. `business.season.nights` has the four nights (Oct 10 has `fireworks`), `business.pricing`, `business.kidsDay`, `business.scenes` (real scene names, approved), `business.faq` (8 Qs), `business.attractions`, `business.crew`, `business.community`, `business.ticketUrl`, `business.address.mapsUrl`.
- `@/shared/useCountdown` — `useCountdown(business.season.opensAt)` → `{days,hours,minutes,seconds,total,done}`; `pad2()`.
- `@/shared/useReducedMotion` — disable heavy animation when true.
- `@/shared/ConceptBadge` — render `<ConceptBadge number={NN} name="…" />` once.

## Every concept must include
Hero with a primary **Get Tickets** CTA (`business.ticketUrl`) · attractions/what-to-expect · the four nights with hours (7:30–10:30, last entry 10; Oct 10 fireworks 7:45, haunt 8:00) · pricing with the **$15 with a donation** offer prominent · Kids Day · community give-back · Join the Crew · FAQ (from data) · directions (address + maps link) · footer with socials · a live countdown to opening night · the ConceptBadge.
Responsive 390px → 1440px, no horizontal scroll. Semantic headings, focus styles, `aria-*` where state changes. `prefers-reduced-motion` respected. Keep each concept's JS/CSS footprint reasonable (no giant generated arrays; canvases capped at DPR 2 and paused when the tab is hidden).

## React expectations
This round exists to show what React buys the client: real state, real interaction. Each concept has an interactive centerpiece (spelled out in your task). Write idiomatic React 19: function components, hooks, typed props, no `any`, no class components, no direct DOM mutation outside effects, no `dangerouslySetInnerHTML`. Keep components small. Derive, don't duplicate, state. Use `useId` for form field ids. Persist little conveniences in `localStorage` inside try/catch only where it makes sense.

## Verify before you hand back (from `react/`)
1. `npm run typecheck` — zero errors in your folder (other concepts may be mid-build; ignore errors that are not in your files, but say so).
2. `ONLY=NN-slug npx vite build` — must succeed; output lands in `dist-only/NN-slug/` (do not commit it, do not delete other agents' output).
3. Serve and look: `npx vite preview --outDir dist-only/NN-slug --port 41NN --strictPort` then screenshot `http://localhost:41NN/NN-slug.html` with headless Chrome at 1440 wide and 390 wide (Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`; `--headless=new --screenshot=... --window-size=1440,2000`; for 390 use an iframe wrapper page because Windows Chrome ignores narrow window sizes). Stop the preview server when done. Zero console errors.
4. No hardcoded facts (grep your folder for "7:30", "$20", "Harff" — they should come from data, except inside copy that quotes a scene).

## Hand back
Reply with the files you created, a 2-line summary, and anything you couldn't verify.
