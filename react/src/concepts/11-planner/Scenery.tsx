/**
 * Code-drawn scenery: the fixed moon, the hero treeline and a crow mark.
 * All SVG, no image files.
 */

/** Fixed moon in the top-right sky. Decorative; glows unless motion is reduced (CSS). */
export function Moon() {
  return (
    <div className="c11-moon" aria-hidden="true">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="c11-moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd4b3" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#ffd4b3" stopOpacity="0.12" />
            <stop offset="1" stopColor="#ffd4b3" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="c11-moon-face" cx="40%" cy="38%" r="65%">
            <stop offset="0" stopColor="#fff3e6" />
            <stop offset="0.7" stopColor="#f2d7bf" />
            <stop offset="1" stopColor="#c9ab92" />
          </radialGradient>
        </defs>
        <circle className="c11-moon-halo" cx="100" cy="100" r="100" fill="url(#c11-moon-glow)" />
        <circle cx="100" cy="100" r="46" fill="url(#c11-moon-face)" />
        <circle cx="84" cy="88" r="7" fill="#d9bea6" opacity="0.6" />
        <circle cx="112" cy="112" r="10" fill="#d9bea6" opacity="0.5" />
        <circle cx="118" cy="84" r="4" fill="#d9bea6" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * A jagged pine treeline built from a short deterministic loop rather than a
 * stored path. Two layers (far and near) for a bit of depth.
 */
function treePath(width: number, baseline: number, count: number, seed: number, minH: number, maxH: number): string {
  const step = width / count;
  let d = `M0 ${baseline + 10} `;
  for (let i = 0; i <= count; i++) {
    const x = i * step;
    // cheap pseudo-random in [0,1): a couple of sines with irrational multipliers
    const r = (Math.sin(i * 12.9898 + seed) * 43758.5453) % 1;
    const h = minH + Math.abs(r) * (maxH - minH);
    const half = step * (0.35 + Math.abs(Math.sin(i * 0.7 + seed)) * 0.25);
    d += `L${(x - half).toFixed(1)} ${baseline} L${(x - half * 0.35).toFixed(1)} ${(baseline - h * 0.55).toFixed(1)} `;
    d += `L${x.toFixed(1)} ${(baseline - h).toFixed(1)} L${(x + half * 0.35).toFixed(1)} ${(baseline - h * 0.55).toFixed(1)} `;
    d += `L${(x + half).toFixed(1)} ${baseline} `;
  }
  d += `L${width} ${baseline + 10} Z`;
  return d;
}

export function Treeline() {
  const width = 1600;
  return (
    <svg className="c11-treeline" viewBox={`0 0 ${width} 220`} preserveAspectRatio="none" aria-hidden="true">
      <path d={treePath(width, 200, 44, 2.1, 70, 150)} fill="#0b1020" />
      <path d={treePath(width, 220, 36, 5.7, 60, 130)} fill="#05070c" />
    </svg>
  );
}

/** The brand's crow silhouette, used as the logo mark. */
export function CrowMark({ size = 28, label }: { size?: number; label?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="c11-crow"
    >
      <path
        fill="currentColor"
        d="M48 14c-3-4-9-6-14-4-3 1-5 3-7 6-4 5-9 8-16 10 4 1 8 0 11-1-1 3-1 6 0 9l-7 12 4-1 5-8c2 2 4 3 7 4l-3 9 4-1 3-8c6 0 11-3 14-8 2-3 3-7 3-11l7-3-7-1c0-2-1-3-4-4z"
      />
      <circle cx="42" cy="17" r="1.8" fill="#07090f" />
    </svg>
  );
}
