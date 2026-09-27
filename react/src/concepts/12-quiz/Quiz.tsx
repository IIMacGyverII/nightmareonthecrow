import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { QUESTIONS } from "./quizData";

interface QuizProps {
  answers: readonly (number | null)[];
  index: number;
  /** Focus the first answer on mount (used after Retake so keyboard users land in the quiz). */
  autoFocus?: boolean;
  /** Which way the card should slide in: 1 = forward, -1 = back. */
  direction: 1 | -1;
  onAnswer: (choice: number) => void;
  onBack: () => void;
}

/** One question at a time, big tappable answer cards, roving-tabindex keyboard nav. */
export function Quiz({ answers, index, direction, autoFocus = false, onAnswer, onBack }: QuizProps) {
  const q = QUESTIONS[index];
  const total = QUESTIONS.length;
  const headingId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<number>(() => answers[index] ?? 0);
  // True once the visitor has clicked/keyed inside the quiz; only then do we move focus
  // between questions (never steal focus on first paint).
  const interacted = useRef(autoFocus);

  // When the question changes, reset the roving focus to the previous choice (or the first card)
  // and move keyboard focus into the new list so arrow keys keep working.
  useEffect(() => {
    const start = answers[index] ?? 0;
    setFocused(start);
    if (!interacted.current) return;
    listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-answer]")[start]?.focus();
  }, [index, answers]);

  const choose = (i: number) => {
    interacted.current = true;
    onAnswer(i);
  };
  const back = () => {
    interacted.current = true;
    onBack();
  };

  const focusAt = (i: number) => {
    const n = q.answers.length;
    const next = ((i % n) + n) % n;
    setFocused(next);
    listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-answer]")[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        focusAt(focused + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        focusAt(focused - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(q.answers.length - 1);
        break;
      default: {
        // 1–4 pick an answer directly. Enter/Space are handled natively by the focused <button>.
        const n = Number(e.key);
        if (Number.isInteger(n) && n >= 1 && n <= q.answers.length) {
          e.preventDefault();
          choose(n - 1);
        }
      }
    }
  };

  const pct = Math.round((index / total) * 100);

  return (
    <div className="c12-quiz" aria-labelledby={headingId}>
      <div className="c12-quiz-top">
        <span className="c12-quiz-step">
          <b>{index + 1}</b>
          <span aria-hidden="true">/</span>
          <span className="c12-sr">of </span>
          {total}
        </span>
        <div
          className="c12-progress"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
          aria-valuetext={`Question ${index + 1} of ${total}`}
        >
          <span className="c12-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* key={index} remounts the card so the slide-in animation replays per question */}
      <div key={index} className="c12-qcard" data-dir={direction > 0 ? "fwd" : "back"}>
        <h2 id={headingId} className="c12-qprompt">
          {q.prompt}
        </h2>
        <div
          ref={listRef}
          className="c12-answers"
          role="group"
          aria-label={`Answers for: ${q.prompt}. Use arrow keys to move, Enter to choose.`}
          onKeyDown={onKeyDown}
        >
          {q.answers.map((a, i) => {
            const chosen = answers[index] === i;
            return (
              <button
                key={a.label}
                type="button"
                data-answer={i}
                className="c12-answer"
                tabIndex={i === focused ? 0 : -1}
                aria-pressed={chosen}
                onFocus={() => setFocused(i)}
                onClick={() => choose(i)}
              >
                <span className="c12-answer-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="c12-answer-text">
                  <span className="c12-answer-label">{a.label}</span>
                  {a.sub && <span className="c12-answer-sub">{a.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="c12-quiz-foot">
        <button type="button" className="c12-btn c12-btn-ghost" onClick={back} disabled={index === 0}>
          ← Back
        </button>
        <span className="c12-quiz-hint">Arrow keys move · Enter picks · 1–4 jump</span>
      </div>
    </div>
  );
}
