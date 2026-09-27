import { useEffect, useId, useState } from "react";
import { business } from "@/data/business";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { TRAITS, type Persona, type Recommendation, type Totals, type Trait } from "./quizData";

interface ResultProps {
  score: number;
  totals: Totals;
  persona: Persona;
  rec: Recommendation;
  onRetake: () => void;
}

const TRAIT_LABEL: Record<Trait, string> = { dread: "Dread", startle: "Startle", claustro: "Claustro", nerve: "Nerve" };

/** Eases 0→score over ~1.3s with rAF; jumps straight to the score under reduced motion. */
function useSweep(target: number, reduced: boolean): number {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1300;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return value;
}

/** Half-circle gauge. Track + lime fill arc + needle, all driven by one animated value. */
function FearOMeter({ score, reduced }: { score: number; reduced: boolean }) {
  const shown = useSweep(score, reduced);
  const R = 84;
  const cx = 110;
  const cy = 110;
  const len = Math.PI * R;
  const offset = len * (1 - shown / 100);
  const angle = -90 + (shown / 100) * 180;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <figure className="c12-gauge" aria-label={`Fear-o-meter reading ${score} out of 100`}>
      <svg viewBox="0 0 220 128" role="img" aria-hidden="true" focusable="false">
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} className="c12-gauge-track" />
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          className="c12-gauge-fill"
          style={{ strokeDasharray: len, strokeDashoffset: offset }}
        />
        {ticks.map((t) => {
          const a = Math.PI * (1 - t / 100);
          const x1 = cx + Math.cos(a) * (R + 10);
          const y1 = cy - Math.sin(a) * (R + 10);
          const x2 = cx + Math.cos(a) * (R + 16);
          const y2 = cy - Math.sin(a) * (R + 16);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className="c12-gauge-tick" />;
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <polygon points={`${cx - 5},${cy} ${cx + 5},${cy} ${cx},${cy - R + 6}`} className="c12-gauge-needle" />
        </g>
        <circle cx={cx} cy={cy} r={9} className="c12-gauge-hub" />
        <text x={cx - R} y={cy + 16} className="c12-gauge-end" textAnchor="middle">
          CALM
        </text>
        <text x={cx + R} y={cy + 16} className="c12-gauge-end" textAnchor="middle">
          GONE
        </text>
      </svg>
      <figcaption className="c12-gauge-num">
        <span className="c12-gauge-big">{Math.round(shown)}</span>
        <span className="c12-gauge-of">/100</span>
      </figcaption>
    </figure>
  );
}

export function Result({ score, totals, persona, rec, onRetake }: ResultProps) {
  const reduced = useReducedMotion();
  const [toast, setToast] = useState<string | null>(null);
  const headingId = useId();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const shareText = [
    `I'm ${persona.title.toUpperCase()} — ${score}/100 on the ${business.name} Fear-o-meter.`,
    `They say ${rec.scene} will get me. ${rec.kidsDay ? "Kids Day" : rec.night.label} it is.`,
    `Take the quiz: ${typeof window !== "undefined" ? window.location.href.split("#")[0] : ""}`,
  ].join("\n");

  const share = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setToast("Copied. Go scare your group chat.");
      } else {
        setToast("Clipboard isn't available here. Select the text below to copy it.");
      }
    } catch {
      setToast("Couldn't copy. Select the text below to copy it.");
    }
  };

  const maxTrait = Math.max(1, ...TRAITS.map((t) => totals[t]));

  return (
    <div className="c12-result" aria-labelledby={headingId}>
      <div className="c12-result-grid">
        <div className="c12-result-meter">
          <FearOMeter score={score} reduced={reduced} />
          <ul className="c12-traits" aria-label="Your trait breakdown">
            {TRAITS.map((t) => (
              <li key={t}>
                <span className="c12-trait-name">{TRAIT_LABEL[t]}</span>
                <span className="c12-trait-bar" aria-hidden="true">
                  <span style={{ width: `${(totals[t] / maxTrait) * 100}%` }} />
                </span>
                <span className="c12-trait-val">{totals[t]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="c12-result-copy">
          <p className="c12-kicker">Your result</p>
          <h2 id={headingId} className="c12-persona">
            {persona.title}
          </h2>
          <p className="c12-persona-tag">{persona.tagline}</p>

          <dl className="c12-plan">
            <div>
              <dt>{rec.kidsDay ? "Your day" : "Your night"}</dt>
              <dd>
                <b>
                  {rec.kidsDay ? `Kids Day · ${business.kidsDay.label} · ${business.kidsDay.time}` : `${rec.night.label} · ${rec.night.start} – ${rec.night.end}`}
                </b>
                <span>{rec.nightWhy}</span>
              </dd>
            </div>
            <div>
              <dt>The scene that gets you</dt>
              <dd>
                <b>{rec.scene}</b>
                <span>{rec.sceneWhy}</span>
              </dd>
            </div>
            <div>
              <dt>Bring a donation?</dt>
              <dd>
                <b>Yes. Obviously.</b>
                <span>{rec.donation}</span>
              </dd>
            </div>
            <div>
              <dt>Your group</dt>
              <dd>
                <span>{rec.groupNote}</span>
              </dd>
            </div>
          </dl>

          <div className="c12-result-actions">
            <a className="c12-btn c12-btn-lime" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get Tickets
            </a>
            <button type="button" className="c12-btn" onClick={share}>
              Share your result
            </button>
            <button type="button" className="c12-btn c12-btn-ghost" onClick={onRetake}>
              Retake
            </button>
          </div>
          <details className="c12-share-text">
            <summary>Show the text we copy</summary>
            <pre>{shareText}</pre>
          </details>
        </div>
      </div>

      <div className="c12-toast" role="status" aria-live="polite" data-show={toast ? "y" : "n"}>
        {toast}
      </div>
    </div>
  );
}
