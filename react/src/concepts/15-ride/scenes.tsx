/**
 * Code-drawn scenery for each stop: layered SVG silhouettes. Every <Layer> gets a
 * depth (--d, px of parallax shift per viewport of scroll); the slide sets --p.
 * All scenes render once and are memoised, so the small deterministic generators
 * below never run per frame.
 */
import { memo, type CSSProperties, type ReactNode } from "react";
import { business } from "@/data/business";

const VB = "0 0 1600 900";
const INK = {
  far: "#0b0f17",
  mid: "#070a10",
  near: "#040507",
  fg: "#020304",
  moon: "#6d8fb3",
  lantern: "#ffb347",
  wood: "#1a1512",
};

/** Tiny deterministic PRNG so silhouettes are identical on every render. */
function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function Layer({ depth, children, className = "" }: { depth: number; children: ReactNode; className?: string }) {
  return (
    <svg
      className={`c15-layer ${className}`}
      style={{ "--d": depth } as CSSProperties}
      viewBox={VB}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ---------- reusable silhouettes ---------- */

function spruce(seed: number, n: number, base: number, hMin: number, hMax: number): string {
  const r = rng(seed);
  const step = 1600 / n;
  const pts = [`-60,${base + 80}`, `-60,${base}`];
  for (let i = 0; i <= n; i++) {
    const x = i * step + (r() - 0.5) * step * 0.4;
    const h = hMin + (hMax - hMin) * r();
    const w = step * (0.32 + 0.35 * r());
    pts.push(
      `${(x - w).toFixed(0)},${base}`,
      `${(x - w * 0.5).toFixed(0)},${(base - h * 0.55).toFixed(0)}`,
      `${x.toFixed(0)},${(base - h).toFixed(0)}`,
      `${(x + w * 0.5).toFixed(0)},${(base - h * 0.55).toFixed(0)}`,
      `${(x + w).toFixed(0)},${base}`,
    );
  }
  pts.push(`1660,${base}`, `1660,${base + 80}`);
  return pts.join(" ");
}

function Trees({ seed, n, base, hMin, hMax, fill }: { seed: number; n: number; base: number; hMin: number; hMax: number; fill: string }) {
  return <polygon points={spruce(seed, n, base, hMin, hMax)} fill={fill} />;
}

function grass(seed: number, n: number, base: number, hMin: number, hMax: number): string {
  const r = rng(seed);
  const step = 1700 / n;
  const pts = [`-60,${base + 40}`];
  for (let i = 0; i <= n; i++) {
    const x = -50 + i * step;
    const h = hMin + (hMax - hMin) * r();
    pts.push(`${(x - 6).toFixed(0)},${base}`, `${(x + (r() - 0.5) * 14).toFixed(0)},${(base - h).toFixed(0)}`, `${(x + 6).toFixed(0)},${base}`);
  }
  pts.push(`1660,${base + 40}`);
  return pts.join(" ");
}

function Grass({ seed, fill = INK.fg, base = 906, hMin = 20, hMax = 80 }: { seed: number; fill?: string; base?: number; hMin?: number; hMax?: number }) {
  return <polygon points={grass(seed, 70, base, hMin, hMax)} fill={fill} />;
}

function Stars({ seed, n = 50 }: { seed: number; n?: number }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={(r() * 1600).toFixed(0)} cy={(r() * 380).toFixed(0)} r={(0.6 + r() * 1.3).toFixed(1)} fill="#c9d6e6" opacity={(0.2 + r() * 0.5).toFixed(2)} />
      ))}
    </g>
  );
}

function Moon({ cx, cy, r, id }: { cx: number; cy: number; r: number; id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={INK.moon} stopOpacity="0.4" />
          <stop offset="1" stopColor={INK.moon} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 4.5} fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="#dbe5f1" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.15} r={r * 0.16} fill="#c3d0e0" />
      <circle cx={cx + r * 0.25} cy={cy + r * 0.3} r={r * 0.22} fill="#c3d0e0" />
    </g>
  );
}

/** Warm lantern glow. */
function Glow({ cx, cy, r, id, o = 0.55 }: { cx: number; cy: number; r: number; id: string; o?: number }) {
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={INK.lantern} stopOpacity={o} />
          <stop offset="0.45" stopColor={INK.lantern} stopOpacity={o * 0.25} />
          <stop offset="1" stopColor={INK.lantern} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </g>
  );
}

/** A hanging lantern: hook, body, lit glass. `y` is the hook point. */
function HangingLantern({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK.near}>
      <rect x="-1.5" y="0" width="3" height="18" />
      <rect x="-9" y="18" width="18" height="5" />
      <path d="M-11,23 h22 l3,36 h-28 z" />
      <rect x="-6" y="27" width="12" height="26" rx="2" fill={INK.lantern} className="c15-glass" />
      <rect x="-13" y="59" width="26" height="5" />
    </g>
  );
}

function Crow({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK.near}>
      <ellipse cx="0" cy="-12" rx="22" ry="11" transform="rotate(-8)" />
      <circle cx="18" cy="-24" r="7.5" />
      <polygon points="24,-25 38,-21 24,-19" />
      <polygon points="-16,-14 -44,-2 -20,-6" />
      <path d="M-4,-2 l-2,4 M4,-2 l2,4" stroke={INK.near} strokeWidth="2" />
    </g>
  );
}

function Reeds({ seed, n, x0, x1, base, hMin, hMax, fill }: { seed: number; n: number; x0: number; x1: number; base: number; hMin: number; hMax: number; fill: string }) {
  const r = rng(seed);
  const step = (x1 - x0) / n;
  return (
    <g fill={fill}>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * step + (r() - 0.5) * step;
        const h = hMin + (hMax - hMin) * r();
        const lean = (r() - 0.5) * 30;
        const cattail = r() > 0.55;
        return (
          <g key={i}>
            <polygon points={`${x - 3},${base} ${x + lean},${base - h} ${x + 3},${base}`} />
            {cattail && <ellipse cx={x + lean} cy={base - h + 8} rx="4" ry="16" />}
          </g>
        );
      })}
    </g>
  );
}

function Headstones({ seed, n, x0, x1, base, hMin, hMax, fill }: { seed: number; n: number; x0: number; x1: number; base: number; hMin: number; hMax: number; fill: string }) {
  const r = rng(seed);
  const step = (x1 - x0) / n;
  return (
    <g fill={fill}>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * step + (r() - 0.5) * step * 0.5;
        const h = hMin + (hMax - hMin) * r();
        const w = h * 0.62;
        const kind = Math.floor(r() * 3);
        const tilt = (r() - 0.5) * 12;
        const t = `translate(${x.toFixed(0)} ${base}) rotate(${tilt.toFixed(1)})`;
        if (kind === 0) return <path key={i} transform={t} d={`M${-w / 2},0 V${-(h - w / 2)} A${w / 2},${w / 2} 0 0 1 ${w / 2},${-(h - w / 2)} V0 Z`} />;
        if (kind === 1)
          return (
            <g key={i} transform={t}>
              <rect x={-w * 0.12} y={-h} width={w * 0.24} height={h} />
              <rect x={-w * 0.45} y={-h * 0.72} width={w * 0.9} height={w * 0.22} />
            </g>
          );
        return <polygon key={i} transform={t} points={`${-w / 2},0 ${-w / 2},${-h * 0.7} 0,${-h} ${w / 2},${-h * 0.7} ${w / 2},0`} />;
      })}
    </g>
  );
}

function CornRow({ seed, n, base, hMin, hMax, fill }: { seed: number; n: number; base: number; hMin: number; hMax: number; fill: string }) {
  const r = rng(seed);
  const step = 1700 / n;
  return (
    <g fill={fill} stroke={fill} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const x = -50 + i * step + (r() - 0.5) * step * 0.6;
        const h = hMin + (hMax - hMin) * r();
        const lean = (r() - 0.5) * 40;
        const top = base - h;
        const k = h / 300; // leaf scale
        return (
          <g key={i}>
            <path d={`M${x},${base} Q${x + lean / 2},${base - h / 2} ${x + lean},${top}`} strokeWidth={4 * k} fill="none" />
            <path d={`M${x + lean * 0.25},${base - h * 0.35} q${-45 * k},${-18 * k} ${-90 * k},${-4 * k} q${35 * k},${2 * k} ${90 * k},${24 * k} z`} />
            <path d={`M${x + lean * 0.5},${base - h * 0.55} q${50 * k},${-22 * k} ${95 * k},${-6 * k} q${-40 * k},${2 * k} ${-95 * k},${26 * k} z`} />
            <path d={`M${x + lean * 0.15},${base - h * 0.18} q${-55 * k},${-4 * k} ${-75 * k},${22 * k} q${45 * k},${-12 * k} ${75 * k},0 z`} />
            <path d={`M${x + lean * 0.75},${base - h * 0.75} q${40 * k},${-20 * k} ${70 * k},${-10 * k} q${-30 * k},${4 * k} ${-70 * k},${24 * k} z`} />
            <path d={`M${x + lean},${top} l${-9 * k},${-44 * k} l${9 * k},${16 * k} l${8 * k},${-32 * k} l${2 * k},${34 * k} l${13 * k},${-24 * k} l${-9 * k},${44 * k} z`} />
          </g>
        );
      })}
    </g>
  );
}

function Fog({ seed, y }: { seed: number; y: number }) {
  const r = rng(seed);
  return (
    <g className="c15-fog" fill={INK.moon}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={(200 + i * 330 + r() * 120).toFixed(0)} cy={y + (r() - 0.5) * 40} rx={(260 + r() * 140).toFixed(0)} ry={(28 + r() * 22).toFixed(0)} opacity="0.07" />
      ))}
    </g>
  );
}

/* ---------- Stop 1: Harff Road ---------- */

function Gravel() {
  const r = rng(41);
  return (
    <g fill="#2b2c33">
      {Array.from({ length: 70 }, (_, i) => {
        const t = r();
        const y = 585 + t * t * 340;
        const half = 40 + ((y - 560) / 400) * 640;
        const x = 800 + (r() * 2 - 1) * half * 0.9;
        return <circle key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} r={(1 + t * 2.5).toFixed(1)} />;
      })}
    </g>
  );
}

export const RoadScene = memo(function RoadScene() {
  const sign = business.address.street.toUpperCase();
  return (
    <>
      <Layer depth={-40}>
        <Stars seed={11} />
        <Trees seed={3} n={26} base={565} hMin={60} hMax={170} fill={INK.far} />
      </Layer>
      <Layer depth={-15}>
        <Trees seed={5} n={13} base={620} hMin={140} hMax={330} fill={INK.mid} />
      </Layer>
      <Layer depth={0}>
        <rect x="-60" y="600" width="1720" height="400" fill="#0a0b0f" />
        <polygon points="765,560 835,560 1520,960 80,960" fill="#17181d" />
        <Gravel />
      </Layer>
      <Layer depth={20} className="c15-headlights">
        <defs>
          <linearGradient id="c15-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={INK.lantern} stopOpacity="0.5" />
            <stop offset="0.6" stopColor={INK.lantern} stopOpacity="0.14" />
            <stop offset="1" stopColor={INK.lantern} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="220,960 740,570 860,570 1380,960" fill="url(#c15-beam)" />
      </Layer>
      <Layer depth={55}>
        <rect x="1188" y="520" width="12" height="400" fill={INK.wood} />
        <polygon points="1080,514 1290,514 1322,542 1290,570 1080,570" fill="#241d18" />
        <text x="1098" y="551" fontSize="21" fontWeight="700" fontFamily="'Work Sans', system-ui, sans-serif" fill={INK.lantern} letterSpacing="1">
          {sign}
        </text>
        <Crow x={1120} y={514} s={0.9} flip />
      </Layer>
      <Layer depth={90}>
        <Grass seed={7} hMin={20} hMax={90} />
      </Layer>
    </>
  );
});

/* ---------- Stop 2: The Wagon ---------- */

function Wheel({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#10131a" />
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <line key={a} x1={cx} y1={cy - r * 0.62} x2={cx} y2={cy + r * 0.62} stroke={fill} strokeWidth={r * 0.12} transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.18} fill={fill} />
    </g>
  );
}

const RIDERS: ReadonlyArray<readonly [number, number]> = [
  [648, 592],
  [722, 586],
  [802, 590],
  [884, 582],
  [962, 588],
  [1044, 584],
];

export const WagonScene = memo(function WagonScene() {
  const c = INK.near;
  return (
    <>
      <Layer depth={-45}>
        <Stars seed={23} n={60} />
        <Moon cx={1260} cy={280} r={44} id="c15-moon-wagon" />
        <Trees seed={9} n={24} base={640} hMin={80} hMax={240} fill={INK.far} />
      </Layer>
      <Layer depth={-18}>
        <Trees seed={13} n={9} base={700} hMin={200} hMax={420} fill={INK.mid} />
      </Layer>
      <Layer depth={0}>
        <path d="M-60,740 Q800,690 1660,740 V960 H-60 Z" fill="#07090d" />
        <Glow cx={1185} cy={575} r={190} id="c15-glow-wagon" />
        {/* tractor */}
        <g fill={c}>
          <rect x="300" y="600" width="140" height="56" rx="6" />
          <rect x="430" y="540" width="100" height="116" rx="8" />
          <rect x="446" y="552" width="68" height="40" fill="#10131a" />
          <rect x="322" y="548" width="12" height="56" />
          <circle cx="480" cy="560" r="12" />
          <rect x="466" y="572" width="28" height="30" rx="6" />
          <rect x="520" y="640" width="46" height="10" />
        </g>
        <Wheel cx={470} cy={670} r={62} fill={c} />
        <Wheel cx={332} cy={692} r={36} fill={c} />
        {/* wagon */}
        <g fill={c}>
          <rect x="560" y="636" width="600" height="34" rx="3" />
          <rect x="556" y="608" width="8" height="40" />
          <rect x="1156" y="608" width="8" height="40" />
          <rect x="560" y="614" width="600" height="5" />
          <ellipse cx="620" cy="636" rx="52" ry="22" />
          <ellipse cx="710" cy="628" rx="62" ry="27" />
          <ellipse cx="800" cy="632" rx="56" ry="24" />
          <ellipse cx="890" cy="626" rx="62" ry="29" />
          <ellipse cx="980" cy="632" rx="56" ry="24" />
          <ellipse cx="1080" cy="630" rx="60" ry="26" />
          {RIDERS.map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="15" />
              <rect x={x - 24} y={y + 10} width="48" height="34" rx="12" />
            </g>
          ))}
        </g>
        <Wheel cx={640} cy={690} r={32} fill={c} />
        <Wheel cx={1085} cy={690} r={32} fill={c} />
        <g fill={c}>
          <rect x="1150" y="520" width="8" height="120" />
          <rect x="1150" y="518" width="40" height="6" />
        </g>
        <HangingLantern x={1186} y={520} s={0.95} />
      </Layer>
      <Layer depth={40}>
        <Grass seed={17} fill={INK.near} base={906} hMin={30} hMax={110} />
      </Layer>
      <Layer depth={85}>
        <Grass seed={19} hMin={10} hMax={60} />
      </Layer>
    </>
  );
});

/* ---------- Stop 3: The Bridge ---------- */

export const BridgeScene = memo(function BridgeScene() {
  const c = "#0b0908";
  return (
    <>
      <Layer depth={-45}>
        <Stars seed={31} n={45} />
        <Moon cx={430} cy={300} r={52} id="c15-moon-bridge" />
        <Trees seed={21} n={26} base={580} hMin={80} hMax={230} fill={INK.far} />
      </Layer>
      <Layer depth={-20}>
        <rect x="-60" y="620" width="1720" height="400" fill="#08101c" />
        <ellipse cx="430" cy="760" rx="60" ry="170" fill={INK.moon} opacity="0.08" />
        <g stroke={INK.moon} strokeWidth="2" opacity="0.18" fill="none">
          <path d="M120,700 q60,-8 120,0 t120,0" />
          <path d="M520,760 q60,-8 120,0 t120,0" />
          <path d="M900,720 q60,-8 120,0 t120,0" />
          <path d="M1250,800 q60,-8 120,0 t120,0" />
          <path d="M300,840 q60,-8 120,0 t120,0" />
        </g>
      </Layer>
      <Layer depth={0}>
        <Glow cx={806} cy={480} r={200} id="c15-glow-bridge" o={0.45} />
        <g fill={c}>
          <rect x="120" y="540" width="1360" height="28" />
          {[300, 640, 960, 1300].map((x) => (
            <rect key={x} x={x - 12} y="568" width="24" height="200" />
          ))}
          {[300, 640, 960].map((x) => (
            <polygon key={x} points={`${x},580 ${x + 340},580 ${x + 330},590 ${x + 10},590`} opacity="0.9" />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x={140 + i * 78} y="484" width="9" height="56" />
          ))}
          <rect x="120" y="492" width="1360" height="6" />
          <rect x="120" y="516" width="1360" height="5" />
          <rect x="776" y="440" width="8" height="52" />
          <rect x="776" y="438" width="34" height="6" />
        </g>
        <HangingLantern x={806} y={440} s={0.8} />
        <Crow x={1240} y={484} s={0.95} />
      </Layer>
      <Layer depth={40}>
        <polygon points="-60,640 260,700 400,820 -60,900" fill={INK.near} />
        <Reeds seed={25} n={14} x0={1150} x1={1660} base={720} hMin={110} hMax={220} fill={INK.near} />
        <rect x="1100" y="700" width="600" height="300" fill={INK.near} />
      </Layer>
      <Layer depth={85}>
        <Reeds seed={27} n={12} x0={-60} x1={460} base={906} hMin={140} hMax={300} fill={INK.fg} />
        <Reeds seed={29} n={10} x0={1200} x1={1660} base={906} hMin={120} hMax={260} fill={INK.fg} />
        <Grass seed={30} hMin={10} hMax={40} />
      </Layer>
    </>
  );
});

/* ---------- Stop 4: The Tunnel ---------- */

const RINGS = [
  { s: 1, fill: "#040507", d: 95 },
  { s: 0.8, fill: "#07090d", d: 65 },
  { s: 0.63, fill: "#0b0e14", d: 42 },
  { s: 0.49, fill: "#10141c", d: 26 },
  { s: 0.38, fill: "#151a24", d: 14 },
  { s: 0.29, fill: "#1a2030", d: 6 },
];

/** A full-frame wall with an arch cut out of it, scaled toward the vanishing point. */
function archWall(s: number): string {
  const cx = 800;
  const w = 480 * s;
  const yb = 520 + 240 * s;
  const yt = yb - 220 * s;
  return `M-60,-60 H1660 V960 H-60 Z M${cx - w},${yb} V${yt} A${w},${w} 0 0 1 ${cx + w},${yt} V${yb} Z`;
}

export const TunnelScene = memo(function TunnelScene() {
  return (
    <>
      <Layer depth={0}>
        <rect x="-60" y="-60" width="1720" height="1020" fill="#1e2536" />
        <Glow cx={800} cy={560} r={220} id="c15-glow-tunnel" o={0.7} />
        <g fill={INK.near}>
          <circle cx="800" cy="548" r="9" />
          <path d="M792,556 L787,592 H813 L808,556 Z" />
          <path d="M788,562 l-8,18 M812,562 l8,18" stroke={INK.near} strokeWidth="3" />
        </g>
      </Layer>
      {[...RINGS].reverse().map((ring) => (
        <Layer key={ring.s} depth={ring.d}>
          <path d={archWall(ring.s)} fill={ring.fill} fillRule="evenodd" stroke={INK.wood} strokeWidth={8 * ring.s} />
        </Layer>
      ))}
    </>
  );
});

/* ---------- Stop 5: The Corn Field ---------- */

function Scarecrow({ x, base }: { x: number; base: number }) {
  const c = INK.mid;
  return (
    <g fill={c}>
      <rect x={x - 7} y={base - 340} width="14" height="340" />
      <rect x={x - 95} y={base - 265} width="190" height="10" />
      <polygon
        points={`${x - 48},${base - 250} ${x + 48},${base - 250} ${x + 64},${base - 110} ${x + 44},${base - 118} ${x + 24},${base - 100} ${x},${base - 116} ${x - 24},${base - 100} ${x - 44},${base - 118} ${x - 64},${base - 110}`}
      />
      <rect x={x - 100} y={base - 274} width="60" height="22" rx="8" />
      <rect x={x + 40} y={base - 274} width="60" height="22" rx="8" />
      <circle cx={x} cy={base - 290} r="27" />
      <rect x={x - 46} y={base - 312} width="92" height="8" rx="3" />
      <polygon points={`${x - 26},${base - 310} ${x - 20},${base - 356} ${x + 20},${base - 356} ${x + 26},${base - 310}`} />
      <line x1={x - 92} y1={base - 262} x2={x - 92} y2={base - 220} stroke={c} strokeWidth="2" />
      <HangingLantern x={x - 92} y={base - 222} s={0.8} />
      <Crow x={x + 86} y={base - 265} s={0.85} />
    </g>
  );
}

export const CornScene = memo(function CornScene() {
  return (
    <>
      <Layer depth={-45}>
        <Stars seed={37} n={40} />
        <Moon cx={1280} cy={250} r={48} id="c15-moon-corn" />
        <Trees seed={39} n={30} base={600} hMin={60} hMax={200} fill={INK.far} />
      </Layer>
      <Layer depth={-20}>
        <rect x="-60" y="600" width="1720" height="400" fill="#07080b" />
        <CornRow seed={43} n={44} base={650} hMin={190} hMax={260} fill="#0b0d12" />
      </Layer>
      <Layer depth={12}>
        <Glow cx={908} cy={578} r={170} id="c15-glow-corn" o={0.5} />
        <Scarecrow x={1000} base={780} />
        <CornRow seed={47} n={32} base={770} hMin={280} hMax={380} fill="#07080c" />
        <Fog seed={49} y={760} />
      </Layer>
      <Layer depth={70}>
        <CornRow seed={53} n={20} base={940} hMin={440} hMax={560} fill={INK.fg} />
      </Layer>
    </>
  );
});

/* ---------- Stop 6: The Graveyard ---------- */

function Fence() {
  return (
    <g fill="#0c0e13">
      <rect x="80" y="590" width="1440" height="6" />
      <rect x="80" y="628" width="1440" height="6" />
      {Array.from({ length: 37 }, (_, i) => {
        const x = 80 + i * 40;
        return (
          <g key={i}>
            <rect x={x - 2.5} y="574" width="5" height="80" />
            <polygon points={`${x - 5},576 ${x},562 ${x + 5},576`} />
          </g>
        );
      })}
    </g>
  );
}

function Cage({ x, y }: { x: number; y: number }) {
  const c = INK.near;
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="50" stroke={c} strokeWidth="3" />
      <ellipse cx="0" cy="50" rx="34" ry="8" fill={c} />
      <rect x="-32" y="52" width="64" height="100" rx="18" fill="none" stroke={c} strokeWidth="5" />
      {[-20, -7, 7, 20].map((bx) => (
        <line key={bx} x1={bx} y1="54" x2={bx} y2="150" stroke={c} strokeWidth="4" />
      ))}
      <ellipse cx="0" cy="152" rx="34" ry="8" fill={c} />
      <g fill={INK.moon} opacity="0.55">
        <circle cx="0" cy="84" r="12" />
        <rect x="-8" y="98" width="16" height="30" rx="3" />
        <rect x="-16" y="102" width="32" height="3" />
        <rect x="-14" y="110" width="28" height="3" />
        <rect x="-12" y="118" width="24" height="3" />
      </g>
      <g fill={c}>
        <circle cx="-4" cy="82" r="3" />
        <circle cx="4" cy="82" r="3" />
      </g>
    </g>
  );
}

export const GraveyardScene = memo(function GraveyardScene() {
  return (
    <>
      <Layer depth={-45}>
        <Stars seed={57} n={55} />
        <Moon cx={880} cy={250} r={64} id="c15-moon-grave" />
        <Trees seed={59} n={28} base={610} hMin={70} hMax={220} fill={INK.far} />
      </Layer>
      <Layer depth={-15}>
        <path d="M-60,650 C300,620 700,690 1000,650 S1400,640 1660,660 V960 H-60 Z" fill="#07090d" />
        <Fence />
      </Layer>
      <Layer depth={0}>
        <Headstones seed={61} n={9} x0={120} x1={1500} base={664} hMin={50} hMax={92} fill="#0c0f15" />
      </Layer>
      <Layer depth={22}>
        <path
          d="M318,740 C336,650 312,570 340,480 C350,440 318,420 306,380 L280,330 L296,346 L322,400 C336,430 362,420 372,380 C382,340 424,320 474,300 L528,288 L484,312 C444,332 412,362 402,402 C396,442 432,470 482,480 L556,486 L492,500 C432,512 402,544 396,604 C390,644 402,694 414,740 Z"
          fill={INK.near}
        />
        <Cage x={550} y={486} />
        <Crow x={474} y={300} s={0.8} />
        <Crow x={296} y={340} s={0.7} flip />
      </Layer>
      <Layer depth={35}>
        <Fog seed={63} y={720} />
      </Layer>
      <Layer depth={55}>
        <Headstones seed={65} n={6} x0={80} x1={1560} base={800} hMin={90} hMax={160} fill={INK.near} />
        <polygon points="1160,800 1162,742 1170,744 1172,712 1181,714 1182,700 1190,702 1189,718 1197,712 1201,746 1208,738 1212,800" fill={INK.near} />
      </Layer>
      <Layer depth={90}>
        <Grass seed={67} hMin={20} hMax={90} />
      </Layer>
    </>
  );
});

/* ---------- Stop 7: Dawn (horizon strip under the info) ---------- */

export function DawnHorizon() {
  return (
    <svg className="c15-dawn-sky__trees" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path transform="translate(1080 90) scale(1.3)" d="M0,0 c-20,-15 -50,-30 -90,-25 c30,-5 60,10 84,30 c20,-20 50,-35 84,-30 c-40,-5 -70,10 -78,25 z" fill="#050608" />
      <Trees seed={71} n={30} base={300} hMin={50} hMax={180} fill="#050608" />
    </svg>
  );
}
