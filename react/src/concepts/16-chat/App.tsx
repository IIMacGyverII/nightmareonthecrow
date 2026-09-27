/**
 * CONCEPT #16 — ASK THE CROW
 * The hero is a chat with a scripted, in-character concierge. Everything the
 * Crow says is assembled from `business` data; the rest of the page is a compact
 * site whose sections can hand questions to the chat.
 */
import { useCallback, useRef } from "react";
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useCountdown } from "@/shared/useCountdown";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { Chat } from "./Chat";
import { useCrowChat } from "./useCrowChat";
import { Attractions, Community, CountdownStrip, Crew, Directions, Faq, Footer, HeroCopy, KidsDay, Nav, Nights, Pricing } from "./Sections";
import "./styles.css";

export function App() {
  const reducedMotion = useReducedMotion();
  const cd = useCountdown(business.season.opensAt);
  const chat = useCrowChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  /** Sections call this: send the question, bring the chat into view, move focus to the input. */
  const ask = useCallback(
    (question: string) => {
      chat.send(question);
      chatRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      inputRef.current?.focus({ preventScroll: true });
    },
    [chat.send, reducedMotion],
  );

  return (
    <div className={`c16${reducedMotion ? " c16--still" : ""}`} id="top">
      <Nav />
      <header className="c16-hero">
        <div className="c16-fog" aria-hidden="true" />
        <HeroCopy cd={cd} />
        <div className="c16-chat-wrap" ref={chatRef}>
          <Chat chat={chat} inputRef={inputRef} reducedMotion={reducedMotion} />
        </div>
      </header>
      <main>
        <Attractions ask={ask} />
        <Nights ask={ask} />
        <Pricing ask={ask} />
        <KidsDay ask={ask} />
        <Community ask={ask} />
        <Crew ask={ask} />
        <Faq ask={ask} />
        <Directions ask={ask} />
        <CountdownStrip cd={cd} />
      </main>
      <Footer />
      <ConceptBadge number={16} name="Ask the Crow" />
    </div>
  );
}
