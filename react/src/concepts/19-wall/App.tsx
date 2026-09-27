import { ConceptBadge } from "@/shared/ConceptBadge";
import { Attractions, Community, Crew, Directions, Faq, Footer, Hero, KidsDay, Nav, Nights, Pricing } from "./sections";
import { Wall } from "./Wall";
import "./styles.css";

/** Concept #19 — The Scream Wall: a social-proof homepage built around a live reaction wall. */
export function App() {
  return (
    <div className="c19">
      <Nav />
      <main>
        <Hero />
        <Wall />
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
      <ConceptBadge number={19} name="The Scream Wall" />
    </div>
  );
}
