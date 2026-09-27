import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { Board } from "./Board";
import { FlapMotion } from "./SplitFlap";
import { CrowMark, Kiosk, Summary } from "./Summary";
import "./styles.css";

const NAV = [
  { href: "#board", label: "Board" },
  { href: "#nights", label: "Nights" },
  { href: "#fares", label: "Fares" },
  { href: "#kids", label: "Kids Day" },
  { href: "#crew", label: "Crew" },
  { href: "#faq", label: "FAQ" },
  { href: "#directions", label: "Directions" },
];

export function App() {
  const reduced = useReducedMotion();
  const { address, season } = business;
  return (
    <FlapMotion.Provider value={reduced}>
      <div className="c20">
        <a className="skip" href="#board">
          Skip to the board
        </a>

        <header className="top">
          <a className="brand" href="#board">
            <CrowMark />
            <span>{business.name}</span>
          </a>
          <nav className="nav" aria-label="Sections">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className="top-cta" href={business.ticketUrl} target="_blank" rel="noreferrer">
            Get Tickets
          </a>
        </header>

        <main>
          <section id="board" className="hero" aria-labelledby="hero-h">
            <div className="hero-text">
              <p className="eyebrow">
                {address.city}, {address.state} · Haunted trail · Season {season.year}
              </p>
              <h1 id="hero-h">{business.name}</h1>
              <p className="lede">{business.tagline} Check the board, buy a ticket, don't miss the last wagon.</p>
            </div>
            <Kiosk />
          </section>

          <Board />
          <Summary />
        </main>

        <footer className="foot">
          <div className="foot-row">
            <p className="foot-brand">
              <CrowMark /> {business.name}
            </p>
            <p>{address.full}</p>
            <ul className="socials" aria-label="Social links">
              {business.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <p className="foot-fine">Board statuses are illustrative. Tickets via HauntPay. Placeholders mark where photos would go.</p>
        </footer>

        <ConceptBadge number={20} name="Departures" />
      </div>
    </FlapMotion.Provider>
  );
}
