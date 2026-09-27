/**
 * Code-drawn art for the Crow's Deck: woodcut emblems (one per scene), the crow
 * sigil, the ornate card back, section dividers and the star field. No images.
 */
import type { ReactNode } from "react";
import type { EmblemKey } from "./cards";

/* ---------- crow sigil (nav, card back, footer) ---------- */

export function Crow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M30 74c-8-3-14-11-13-21 1-9 8-15 17-16 7-1 12-4 17-9l7-10 11 4-8 3c4 5 4 13 2 19l19-9-14 16 12 5-16 2c-6 8-16 12-26 10l-15 11 8-11-1-3z"
      />
      <circle cx="61" cy="26" r="1.8" fill="#0d0a14" />
    </svg>
  );
}

/* ---------- woodcut emblems: bold black shapes on bone ---------- */

const bone = "#efe6d0";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const SHAPES: Record<EmblemKey, ReactNode> = {
  moon: <path fill="currentColor" d="M62 12A38 38 0 1 0 62 88 30 30 0 1 1 62 12Z" />,
  bridge: (
    <g>
      <path {...stroke} strokeWidth={7} d="M8 62Q50 28 92 62" />
      <path {...stroke} strokeWidth={4} d="M20 55V72M35 46V64M50 42V60M65 46V64M80 55V72" />
      <path {...stroke} strokeWidth={4} d="M8 84q10-7 21 0t21 0 21 0 21 0" />
      <rect x="6" y="60" width="8" height="26" fill="currentColor" />
      <rect x="86" y="60" width="8" height="26" fill="currentColor" />
    </g>
  ),
  beetle: (
    <g>
      <ellipse cx="50" cy="58" rx="22" ry="28" fill="currentColor" />
      <circle cx="50" cy="24" r="10" fill="currentColor" />
      <path {...stroke} strokeWidth={4} d="M28 40 10 30M28 58H8M30 76 12 88M72 40 90 30M72 58h20M70 76l18 12M45 16 38 6M55 16l7-10" />
      <path stroke={bone} strokeWidth={4} fill="none" d="M31 48h38M28 60h44M32 72h36" />
      <circle cx="46" cy="22" r="2" fill={bone} />
      <circle cx="54" cy="22" r="2" fill={bone} />
    </g>
  ),
  cleaver: (
    <g>
      <path fill="currentColor" d="M14 24h58v46H26q-12 0-12-12z" />
      <path fill="currentColor" d="M72 40h20q4 0 4 4v8q0 4-4 4H72z" />
      <circle cx="30" cy="58" r="4" fill={bone} />
      <path stroke={bone} strokeWidth={2} fill="none" d="M20 30h46" />
    </g>
  ),
  sheets: (
    <g>
      <path {...stroke} strokeWidth={4} d="M6 22h88" />
      <path fill="currentColor" d="M16 22h30v48q-7 9-15 0-8 9-15 0z" />
      <path fill="currentColor" d="M54 22h30v48q-7 9-15 0-8 9-15 0z" />
      <rect x="20" y="16" width="5" height="12" fill="currentColor" />
      <rect x="75" y="16" width="5" height="12" fill="currentColor" />
      <circle cx="48" cy="46" r="1.8" fill="currentColor" />
      <circle cx="52" cy="46" r="1.8" fill="currentColor" />
      <path {...stroke} strokeWidth={3} d="M10 88h80" />
    </g>
  ),
  eclipse: (
    <g>
      <circle cx="50" cy="50" r="30" fill="currentColor" />
      <path {...stroke} strokeWidth={3} d="M50 8v8M50 84v8M8 50h8M84 50h8M20 20l6 6M74 74l6 6M80 20l-6 6M26 74l-6 6" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="2 5" />
    </g>
  ),
  hat: (
    <g>
      <path fill="currentColor" d="M52 8 70 60H92l2 8H6l2-8h24z" />
      <path stroke={bone} strokeWidth={4} fill="none" d="M31 56h40" />
      <path {...stroke} strokeWidth={3} d="M20 84q30 10 60 0" />
    </g>
  ),
  scythe: (
    <g>
      <path fill="currentColor" d="M18 22q46-14 68 22-24-14-58 0z" />
      <path {...stroke} strokeWidth={6} d="M30 34 56 92" />
      <path {...stroke} strokeWidth={3} d="M12 90V66M12 72l-6-6M12 72l6-6M12 82l-6-6M12 82l6-6" />
    </g>
  ),
  bus: (
    <g>
      <rect x="8" y="26" width="84" height="46" rx="6" fill="currentColor" />
      <rect x="16" y="34" width="14" height="14" fill={bone} />
      <rect x="35" y="34" width="14" height="14" fill={bone} />
      <rect x="54" y="34" width="14" height="14" fill={bone} />
      <rect x="73" y="34" width="12" height="14" fill={bone} />
      <circle cx="28" cy="76" r="9" fill="currentColor" />
      <circle cx="72" cy="76" r="9" fill="currentColor" />
      <circle cx="28" cy="76" r="3" fill={bone} />
      <circle cx="72" cy="76" r="3" fill={bone} />
      <path stroke={bone} strokeWidth={2} fill="none" d="M14 60h72" />
    </g>
  ),
  barn: (
    <g>
      <path fill="currentColor" d="M14 46 50 12l36 34v42H14z" />
      <path fill={bone} d="M40 62h20v26H40z" />
      <path stroke={bone} strokeWidth={2} fill="none" d="M40 62l20 26M60 62 40 88" />
      <path stroke={bone} strokeWidth={3} fill="none" d="M50 22v14" />
      <circle cx="50" cy="42" r="5" fill="none" stroke={bone} strokeWidth={3} />
    </g>
  ),
  tunnel: (
    <g>
      <path fill="currentColor" d="M8 92V52a42 42 0 0 1 84 0v40z" />
      <path fill={bone} d="M24 92V56a26 26 0 0 1 52 0v36z" />
      <path fill="currentColor" d="M38 92V64a12 12 0 0 1 24 0v28z" />
      <path {...stroke} strokeWidth={3} d="M4 92h92" />
    </g>
  ),
  cage: (
    <g>
      <path {...stroke} strokeWidth={5} d="M18 84V46a32 32 0 0 1 64 0v38" />
      <path {...stroke} strokeWidth={4} d="M32 32v52M44 24v60M56 24v60M68 32v52" />
      <rect x="12" y="84" width="76" height="8" fill="currentColor" />
      <circle cx="50" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth={3} />
      <circle cx="50" cy="52" r="8" fill="currentColor" />
      <circle cx="47" cy="50" r="1.8" fill={bone} />
      <circle cx="53" cy="50" r="1.8" fill={bone} />
    </g>
  ),
  trees: (
    <g>
      <path fill="currentColor" d="M50 8 70 42h-10l16 26H24l16-26H30z" />
      <rect x="45" y="68" width="10" height="22" fill="currentColor" />
      <path fill="currentColor" d="M18 40 30 60h-6l10 16H2l10-16H6z" />
      <path fill="currentColor" d="M82 40 94 60h-6l10 16H66l10-16h-6z" />
      <path {...stroke} strokeWidth={3} d="M4 92h92" />
    </g>
  ),
  van: (
    <g>
      <path fill="currentColor" d="M10 44h20l12-18h48v46H10z" />
      <path fill={bone} d="M34 32h14v12H34zM54 32h30v12H54z" />
      <circle cx="30" cy="74" r="9" fill="currentColor" />
      <circle cx="72" cy="74" r="9" fill="currentColor" />
      <circle cx="30" cy="74" r="3" fill={bone} />
      <circle cx="72" cy="74" r="3" fill={bone} />
      <path fill={bone} d="M56 54q6-5 12 0-6 5-12 0zM50 50l6 4-6 4zM74 50l-6 4 6 4z" />
    </g>
  ),
  corn: (
    <g>
      <ellipse cx="50" cy="46" rx="13" ry="28" fill="currentColor" />
      <path {...stroke} strokeWidth={6} d="M40 62Q18 54 14 30M60 62q22-8 26-32M50 74v18" />
      <g fill={bone}>
        <circle cx="45" cy="30" r="2" /><circle cx="55" cy="30" r="2" /><circle cx="50" cy="40" r="2" />
        <circle cx="43" cy="48" r="2" /><circle cx="57" cy="48" r="2" /><circle cx="50" cy="58" r="2" />
      </g>
    </g>
  ),
  grave: (
    <g>
      <path fill="currentColor" d="M26 86V42a24 24 0 0 1 48 0v44z" />
      <path stroke={bone} strokeWidth={4} fill="none" d="M50 34v26M40 46h20" />
      <path {...stroke} strokeWidth={4} d="M6 90h88M12 90v-8M18 90v-12M82 90v-10M88 90v-6" />
    </g>
  ),
  tent: (
    <g>
      <path fill="currentColor" d="M50 18 92 88H8z" />
      <path fill={bone} d="M50 44 64 88H36z" />
      <path {...stroke} strokeWidth={3} d="M50 18 44 8M50 18l6-10" />
      <path fill="currentColor" d="M14 62q4-10 6-2 2-8 6 2 2 6-6 10-8-4-6-10z" />
    </g>
  ),
  crossbuck: (
    <g>
      <rect x="46" y="36" width="8" height="56" fill="currentColor" />
      <rect x="8" y="33" width="84" height="14" fill="currentColor" transform="rotate(30 50 40)" />
      <rect x="8" y="33" width="84" height="14" fill="currentColor" transform="rotate(-30 50 40)" />
      <circle cx="50" cy="40" r="6" fill={bone} />
      <circle cx="50" cy="40" r="2.5" fill="currentColor" />
    </g>
  ),
  saloon: (
    <g>
      <rect x="10" y="20" width="6" height="66" fill="currentColor" />
      <rect x="84" y="20" width="6" height="66" fill="currentColor" />
      <path fill="currentColor" d="M22 36a12 12 0 0 1 24 0v40H22z" />
      <path fill="currentColor" d="M54 36a12 12 0 0 1 24 0v40H54z" />
      <path stroke={bone} strokeWidth={2.5} fill="none" d="M26 46h16M26 54h16M26 62h16M26 70h16M58 46h16M58 54h16M58 62h16M58 70h16" />
      <path {...stroke} strokeWidth={3} d="M6 92h88" />
    </g>
  ),
};

export function Emblem({ kind, className }: { kind: EmblemKey; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {SHAPES[kind]}
    </svg>
  );
}

/* ---------- the ornate card back ---------- */

export function CardBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 190" className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="117" height="187" rx="9" fill="#1a1330" stroke="#d4af37" strokeWidth="2" />
      <rect x="8" y="8" width="104" height="174" rx="5" fill="none" stroke="#d4af37" strokeWidth="1" />
      <rect x="12" y="12" width="96" height="166" rx="3" fill="none" stroke="#d4af37" strokeWidth=".8" strokeDasharray="1.5 3" />
      {/* corner flourishes */}
      <g fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round">
        <path d="M16 26q0-10 10-10M104 26q0-10-10-10M16 164q0 10 10 10M104 164q0 10-10 10" />
        <path d="M14 34l6-6M106 34l-6-6M14 156l6 6M106 156l-6 6" />
      </g>
      {/* halo and sigil */}
      <circle cx="60" cy="95" r="36" fill="none" stroke="#d4af37" strokeWidth="1.2" />
      <circle cx="60" cy="95" r="31" fill="none" stroke="#d4af37" strokeWidth=".6" strokeDasharray="1 2.5" />
      <g transform="translate(34 69) scale(.52)" color="#d4af37">
        <Crow />
      </g>
      {/* crescents top and bottom */}
      <path d="M60 30a7 7 0 1 0 0 14 5.5 5.5 0 1 1 0-14z" fill="#d4af37" />
      <path d="M60 146a7 7 0 1 1 0 14 5.5 5.5 0 1 0 0-14z" fill="#d4af37" />
      {/* scattered stars */}
      <g fill="#efe6d0">
        <circle cx="26" cy="52" r="1" /><circle cx="94" cy="60" r=".8" /><circle cx="30" cy="140" r=".8" />
        <circle cx="92" cy="130" r="1" /><circle cx="22" cy="96" r=".7" /><circle cx="98" cy="96" r=".7" />
      </g>
    </svg>
  );
}

/* ---------- ornamental divider ---------- */

export function Divider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 24" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20 12h150M230 12h150" />
        <path d="M170 12l8-8 8 8-8 8z" />
        <path d="M214 12l8-8 8 8-8 8z" />
      </g>
      <path d="M200 3a9 9 0 1 0 0 18 7 7 0 1 1 0-18z" fill="currentColor" />
      <circle cx="20" cy="12" r="2" fill="currentColor" />
      <circle cx="380" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/* ---------- star field: seeded, fixed behind the page ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = mulberry32(14);
  return Array.from({ length: 110 }, (_, i) => ({
    i,
    x: (rand() * 100).toFixed(2),
    y: (rand() * 100).toFixed(2),
    r: (0.5 + rand() * 1.1).toFixed(2),
    delay: (rand() * 6).toFixed(2),
  }));
})();

export function StarField({ still }: { still: boolean }) {
  return (
    <svg className={`c14-stars${still ? " is-still" : ""}`} aria-hidden="true" focusable="false">
      {STARS.map((s) => (
        <circle key={s.i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} style={{ animationDelay: `${s.delay}s` }} />
      ))}
    </svg>
  );
}
