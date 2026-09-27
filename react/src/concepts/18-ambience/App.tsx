import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { Mixer } from "./Mixer";
import { Attractions, Community, Countdown, Crew, CrowMark, Directions, Faq, Footer, KidsDay, Nights, Pricing } from "./sections";
import "./styles.css";

const NAV = [
  ["#attractions", "Trail"],
  ["#nights", "Nights"],
  ["#pricing", "Tickets"],
  ["#kids", "Kids Day"],
  ["#community", "Give back"],
  ["#crew", "Crew"],
  ["#faq", "FAQ"],
  ["#directions", "Directions"],
] as const;

export function App() {
  return (
    <div className="c18">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="top">
        <a className="top__brand" href="#top">
          <CrowMark />
          <span>{business.name}</span>
        </a>
        <nav className="top__nav" aria-label="Sections">
          {NAV.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn--primary btn--small" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <p className="eyebrow">
            {business.address.city}, {business.address.state} · {business.tagline}
          </p>
          <h1 id="hero-title" className="hero__title">
            The Sound <span className="hero__of">of the</span> Crow
          </h1>
          <p className="hero__lede">A haunted trail through real woods, built by three neighbors. Below is what it sounds like. Press play, turn up the fear, then come hear it for real.</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get Tickets
            </a>
            <Countdown compact />
          </div>
        </section>

        <Mixer />

        <div className="rack">
          <Attractions />
          <Nights />
          <Pricing />
          <KidsDay />
          <Community />
          <Crew />
          <Faq />
          <Directions />
          <Countdown />
        </div>
      </main>

      <Footer />
      <ConceptBadge number={18} name="The Sound of the Crow" corner="bottom-right" />
    </div>
  );
}
