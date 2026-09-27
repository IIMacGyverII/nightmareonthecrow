/**
 * CONCEPT #14 — THE CROW'S DECK
 * A tarot reading for a haunted trail: draw three cards, read your fate,
 * then everything a visitor needs (nights, pricing, Kids Day, crew, FAQ).
 */
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { StarField, Divider } from "./Art";
import { Deck } from "./Deck";
import { Attractions, Community, CountdownStrip, Crew, Directions, Faq, Footer, KidsDay, Nav, Nights, Pricing } from "./Sections";
import "./styles.css";

export function App() {
  const reduced = useReducedMotion();
  return (
    <div className="c14" id="top">
      <StarField still={reduced} />
      <Nav />
      <main className="c14-main">
        <section className="c14-hero" id="deck">
          <p className="c14-eyebrow">{business.name} · {business.address.city}, {business.address.state}</p>
          <h1>The Crow's Deck</h1>
          <Divider className="c14-divider" />
          <p className="c14-hero-sub">
            Draw three cards. <em>Past</em>, <em>Present</em>, <em>Your Night</em>. The trail already knows how it ends.
          </p>
          <div className="c14-hero-ctas">
            <a className="c14-btn" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get Tickets
            </a>
            <a className="c14-btn ghost" href="#nights">
              Four nights in October
            </a>
          </div>
          <Deck />
        </section>
        <CountdownStrip />
        <Attractions />
        <Nights />
        <Pricing />
        <KidsDay />
        <Community />
        <Crew />
        <Faq />
        <Directions />
      </main>
      <Footer />
      <ConceptBadge number={14} name="The Crow's Deck" />
    </div>
  );
}
