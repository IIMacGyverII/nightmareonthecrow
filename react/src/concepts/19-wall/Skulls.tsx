import type { Fear } from "./notes";

/** A single skull glyph. Filled skulls carry the rating; empty ones are outlines. */
export function Skull({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className={filled ? "skull on" : "skull"} focusable="false">
      <path d="M12 2.5a8 8 0 0 0-8 8c0 2.9 1.4 5 3.5 6.4V21h9v-4.1C18.6 15.5 20 13.4 20 10.5a8 8 0 0 0-8-8z" />
      <circle className="eye" cx="9" cy="11" r="1.8" />
      <circle className="eye" cx="15" cy="11" r="1.8" />
      <path className="eye" d="M11 14.5h2l-1 2.2z" />
    </svg>
  );
}

/** Fear rating out of five, announced as text. */
export function Skulls({ fear, size = "sm" }: { fear: Fear; size?: "sm" | "lg" }) {
  return (
    <span className={`skulls ${size}`} role="img" aria-label={`${fear} of 5 skulls`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Skull key={n} filled={n <= fear} />
      ))}
    </span>
  );
}
