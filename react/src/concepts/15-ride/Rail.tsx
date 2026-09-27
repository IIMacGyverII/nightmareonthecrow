import type { RefObject } from "react";
import type { Stop } from "./stops";

interface RailProps {
  active: number;
  stops: readonly Stop[];
  wheelRef: RefObject<SVGGElement | null>;
  ticketUrl: string;
  onStep: (dir: 1 | -1) => void;
  onGo: (index: number) => void;
}

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <path d={dir === "left" ? "M12.5 4 L6.5 10 L12.5 16" : "M7.5 4 L13.5 10 L7.5 16"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Fixed bottom rail: prev/next, the turning wagon wheel, stop dots, skip-to-info and tickets. */
export function Rail({ active, stops, wheelRef, ticketUrl, onStep, onGo }: RailProps) {
  const last = stops.length - 1;
  return (
    <nav className="c15-rail" aria-label="Ride controls">
      <button type="button" className="c15-rail__btn" onClick={() => onStep(-1)} disabled={active === 0} aria-label="Previous stop">
        <Chevron dir="left" />
      </button>

      <div className="c15-rail__wheel" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="38" height="38" focusable="false">
          <g ref={wheelRef}>
            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="3" />
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="2" transform={`rotate(${a} 20 20)`} />
            ))}
            <circle cx="20" cy="20" r="4.5" fill="currentColor" />
          </g>
        </svg>
      </div>

      <span className="c15-rail__count">
        <span className="c15-rail__now">{active + 1}</span> / {stops.length}
      </span>

      <ol className="c15-rail__dots">
        {stops.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="c15-rail__dot"
              onClick={() => onGo(i)}
              aria-label={`Go to stop ${i + 1}: ${s.name}`}
              aria-current={i === active ? "true" : undefined}
            />
          </li>
        ))}
      </ol>

      <button type="button" className="c15-rail__btn" onClick={() => onStep(1)} disabled={active === last} aria-label="Next stop">
        <Chevron dir="right" />
      </button>

      <a
        className="c15-rail__skip"
        href={`#${stops[last].id}`}
        onClick={(e) => {
          e.preventDefault();
          onGo(last);
        }}
      >
        Skip to info
      </a>
      <a className="c15-rail__tix" href={ticketUrl} target="_blank" rel="noreferrer">
        Tickets
      </a>
    </nav>
  );
}
