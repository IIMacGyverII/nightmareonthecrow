import { useCallback, useEffect, useMemo, useState } from "react";
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { Quiz } from "./Quiz";
import { Result } from "./Result";
import { Attractions, Community, CountdownBand, Crew, Directions, Faq, Footer, KidsDay, Nav, Nights, Pricing } from "./Sections";
import { QUESTIONS, dominantTrait, fearScore, groupOf, loadStored, persona, recommend, saveStored, tally } from "./quizData";
import "./styles.css";

type Phase = "quiz" | "result";

const EMPTY: (number | null)[] = QUESTIONS.map(() => null);

export function App() {
  const [answers, setAnswers] = useState<(number | null)[]>(EMPTY);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [retakes, setRetakes] = useState(0);
  const [stored, setStored] = useState<number[] | null>(null);

  // Offer "See your last result" only after we know storage holds a complete set of answers.
  useEffect(() => {
    const s = loadStored();
    if (s) setStored(s.answers);
  }, []);

  const onAnswer = useCallback(
    (choice: number) => {
      const next = answers.slice();
      next[index] = choice;
      setAnswers(next);
      setDirection(1);
      if (index + 1 < QUESTIONS.length) {
        setIndex(index + 1);
      } else {
        const complete = next.map((n) => n ?? 0);
        saveStored(complete);
        setStored(complete);
        setPhase("result");
      }
    },
    [answers, index],
  );

  const onBack = useCallback(() => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const retake = () => {
    setAnswers(EMPTY);
    setIndex(0);
    setDirection(1);
    setPhase("quiz");
    setRetakes((n) => n + 1);
  };

  const showStored = () => {
    if (!stored) return;
    setAnswers(stored);
    setIndex(QUESTIONS.length - 1);
    setPhase("result");
  };

  // Everything on the result screen derives from the answers; nothing is stored twice.
  const result = useMemo(() => {
    if (phase !== "result") return null;
    const totals = tally(answers);
    const score = fearScore(totals);
    const dominant = dominantTrait(totals);
    const group = groupOf(answers);
    return { totals, score, persona: persona(score, dominant), rec: recommend(score, dominant, group) };
  }, [phase, answers]);

  return (
    <div className="c12">
      <Nav />
      <main>
        <section id="quiz" className="c12-hero" aria-labelledby="c12-hero-h">
          <div className="c12-hero-head">
            <p className="c12-kicker">
              {business.name} · Haunted trail · {business.address.city}, {business.address.state}
            </p>
            <h1 id="c12-hero-h" className="c12-h1">
              How scared
              <br />
              will <span className="c12-lime">you</span> be?
            </h1>
            <p className="c12-hero-lede">
              Seven questions. One honest number. Then we tell you which night to come, which scene will get you, and what to bring.
            </p>
            <div className="c12-hero-actions">
              <a className="c12-btn c12-btn-lime" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
                Get Tickets
              </a>
              {phase === "quiz" && stored && (
                <button type="button" className="c12-btn c12-btn-ghost" onClick={showStored}>
                  See your last result
                </button>
              )}
            </div>
          </div>

          <div className="c12-hero-panel">
            {phase === "quiz" ? (
              <Quiz key={retakes} answers={answers} index={index} direction={direction} autoFocus={retakes > 0} onAnswer={onAnswer} onBack={onBack} />
            ) : (
              result && <Result score={result.score} totals={result.totals} persona={result.persona} rec={result.rec} onRetake={retake} />
            )}
          </div>
        </section>

        <Attractions />
        <Nights />
        <Pricing />
        <KidsDay />
        <Community />
        <Crew />
        <Faq />
        <Directions />
        <CountdownBand />
      </main>
      <Footer />
      <ConceptBadge number={12} name="How Scared Will You Be?" corner="bottom-right" />
    </div>
  );
}
