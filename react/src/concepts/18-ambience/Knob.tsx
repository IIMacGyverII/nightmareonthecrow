import { useId, useRef, type KeyboardEvent, type PointerEvent } from "react";

interface KnobProps {
  label: string;
  value: number; // 0–100
  onChange(next: number): void;
  /** Short line under the readout. */
  caption?: string;
  disabled?: boolean;
}

const MIN = 0;
const MAX = 100;
const SWEEP = 270; // degrees of travel
const START = -135;
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, Math.round(n)));

/** Polar helper for the SVG arc, centred at (60,60) radius r. */
function polar(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [60 + r * Math.cos(a), 60 + r * Math.sin(a)];
}
function arcPath(from: number, to: number, r: number): string {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * A rotary knob drawn in SVG. Drag vertically with a pointer (2px per unit),
 * or focus it and use the arrow keys, PageUp/PageDown, Home/End.
 */
export function Knob({ label, value, onChange, caption, disabled = false }: KnobProps) {
  // Gradient ids live inside url(#…) so strip the punctuation React puts in useId.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const drag = useRef<{ y: number; start: number } | null>(null);
  const angle = START + (SWEEP * (value - MIN)) / (MAX - MIN);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, start: value };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const delta = (drag.current.y - e.clientY) / 2;
    const next = clamp(drag.current.start + delta);
    if (next !== value) onChange(next);
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* not captured */
    }
  };
  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    const step: Record<string, number | undefined> = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: 10,
      PageDown: -10,
    };
    let next: number | null = null;
    if (e.key in step) next = clamp(value + (step[e.key] ?? 0));
    else if (e.key === "Home") next = MIN;
    else if (e.key === "End") next = MAX;
    if (next === null) return;
    e.preventDefault();
    if (next !== value) onChange(next);
  };

  const ticks = Array.from({ length: 11 }, (_, i) => START + (SWEEP * i) / 10);

  return (
    <div className={`knob${disabled ? " is-disabled" : ""}`}>
      <span className="knob__label" id={`${id}-label`}>
        {label}
      </span>
      <svg
        className="knob__dial"
        viewBox="0 0 120 120"
        width="120"
        height="120"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={`${id}-label`}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={value}
        aria-valuetext={`${value} of ${MAX}`}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <defs>
          <radialGradient id={`${id}-cap`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#3a3d42" />
            <stop offset="1" stopColor="#141517" />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a5e66" />
            <stop offset="1" stopColor="#1b1d20" />
          </linearGradient>
        </defs>
        {/* tick marks */}
        {ticks.map((t) => {
          const [x1, y1] = polar(t, 52);
          const [x2, y2] = polar(t, 57);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className="knob__tick" />;
        })}
        {/* track + lit arc */}
        <path d={arcPath(START, START + SWEEP, 46)} className="knob__track" />
        {value > MIN && <path d={arcPath(START, angle, 46)} className="knob__arc" />}
        {/* cap */}
        <circle cx="60" cy="60" r="38" fill={`url(#${id}-rim)`} />
        <circle cx="60" cy="60" r="34" fill={`url(#${id}-cap)`} />
        {/* pointer */}
        <line x1="60" y1="60" x2={polar(angle, 30)[0]} y2={polar(angle, 30)[1]} className="knob__pointer" />
        <circle cx={polar(angle, 27)[0]} cy={polar(angle, 27)[1]} r="3.2" className="knob__led" />
      </svg>
      <output className="knob__value" aria-hidden="true">
        {String(value).padStart(3, "0")}
      </output>
      {caption && <span className="knob__caption">{caption}</span>}
    </div>
  );
}
