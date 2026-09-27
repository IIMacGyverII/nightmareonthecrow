/**
 * The hero status board: a grid of condition tiles.
 * Real tiles (TRAIL STATUS, TONIGHT, TICKETS) derive from business data.
 * Simulated tiles carry a SIM tag; the placeholder stat carries a SAMPLE tag.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { nextNight, trailState, useNow, useSimulation, type TrailCode } from "./sim";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** Tweens toward `value` on change (skipped under reduced motion) and flashes briefly. */
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    setFlash(true);
    const flashId = window.setTimeout(() => setFlash(false), 700);
    if (reduced) {
      setShown(value);
      return () => window.clearTimeout(flashId);
    }
    const t0 = performance.now();
    const duration = 650;
    let raf = 0;
    const frame = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(flashId);
    };
  }, [value, reduced]);

  return <span className={`num${flash ? " is-flash" : ""}`}>{shown.toFixed(decimals)}</span>;
}

/** Tiny single-series sparkline. Values are 0–100. */
export function Sparkline({ points, label }: { points: number[]; label: string }) {
  const w = 160;
  const h = 40;
  const inset = 3;
  const n = points.length;
  if (n < 2) return null;
  const coords = points.map((v, i): [number, number] => [
    inset + (i / (n - 1)) * (w - inset * 2),
    inset + (1 - v / 100) * (h - inset * 2),
  ]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const first = coords[0];
  const last = coords[n - 1];
  const area = `${path} L${last[0].toFixed(1)} ${h} L${first[0].toFixed(1)} ${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <path className="spark-area" d={area} />
      <path className="spark-line" d={path} />
      <circle className="spark-dot" cx={last[0]} cy={last[1]} r={3} />
    </svg>
  );
}

type Tag = "sim" | "sample" | "live";

interface TileProps {
  label: string;
  tag?: Tag;
  span?: 2;
  tone?: "accent" | "amber" | "ok";
  foot?: ReactNode;
  children: ReactNode;
}

const TAG_TEXT: Record<Tag, string> = { sim: "SIM", sample: "SAMPLE", live: "LIVE" };
const TAG_TITLE: Record<Tag, string> = {
  sim: "Simulated — replace with live data",
  sample: "Sample data — placeholder for the client",
  live: "Derived from the season schedule",
};

export function Tile({ label, tag, span, tone, foot, children }: TileProps) {
  return (
    <article className={`tile${span ? " span-2" : ""}${tone ? ` tone-${tone}` : ""}`}>
      <header className="tile-h">
        <span className="lbl">{label}</span>
        {tag && (
          <span className={`tag tag-${tag}`} title={TAG_TITLE[tag]}>
            {TAG_TEXT[tag]}
          </span>
        )}
      </header>
      <div className="tile-b">{children}</div>
      {foot && <footer className="tile-f">{foot}</footer>}
    </article>
  );
}

/** Five-segment "how busy" bar. Sample data. */
export function BusyBar({ level, label }: { level: number; label: string }) {
  const segs = [1, 2, 3, 4, 5];
  return (
    <div className="busy" role="img" aria-label={`${label}: ${level} of 5`}>
      {segs.map((s) => (
        <span key={s} className={`busy-seg${s <= level ? " on" : ""}${level >= 4 && s <= level ? " hot" : ""}`} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

const STATUS_WORD: Record<TrailCode, string> = {
  preseason: "CLOSED",
  open: "OPEN",
  between: "CLOSED",
  wrapped: "WRAPPED",
};

/** Placeholder for a stat the client would supply. Clearly marked SAMPLE in the UI. */
const SAMPLE_DONATION_ITEMS = 1204;

export function Board() {
  const now = useNow(1000);
  const countdown = useCountdown(business.season.opensAt);
  const sim = useSimulation(1313, 2200);
  const state = trailState(now);
  const tonight = nextNight(now);
  const { season, pricing, foodTrucks, ticketUrl } = business;
  const fogNow = sim.fog[sim.fog.length - 1] ?? 0;
  const clock = new Date(now).toLocaleTimeString([], { hour12: false });

  return (
    <section className="board" id="conditions" aria-labelledby="board-title">
      <div className="board-top">
        <div>
          <p className="eyebrow">
            <span className="led" aria-hidden="true" /> {business.name} · Conditions report · Season {season.year}
          </p>
          <h1 id="board-title">Trail Conditions</h1>
          <p className="lede">
            {business.voice} Check the board before you drive out: status, hours, fog and wait — the way a ski hill posts its
            snow.
          </p>
        </div>
        <p className="clock lbl" aria-live="off">
          Last updated <time dateTime={new Date(now).toISOString()}>{clock}</time>
        </p>
      </div>

      <div className="tiles">
        {/* TRAIL STATUS — real schedule logic */}
        <Tile
          label="Trail status"
          tag="live"
          span={2}
          tone={state.code === "open" ? "ok" : "amber"}
          foot={
            state.code === "preseason" || state.code === "between"
              ? `Next: ${state.night?.label} · ${state.night?.start} – ${state.night?.end} · last entry ${season.lastEntry}`
              : state.code === "open"
                ? `Last entry ${season.lastEntry} · gates close ${state.night?.end}`
                : `Season ${season.year} has wrapped. See you next October.`
          }
        >
          <div className="status-row">
            <span className="status-word" role="status">
              {STATUS_WORD[state.code]}
            </span>
            {state.code === "preseason" && (
              <div className="cd" aria-label="Countdown to opening night">
                <span className="lbl">Opens in</span>
                <span className="cd-digits">
                  <b>{countdown.days}</b>
                  <i>d</i> <b>{pad2(countdown.hours)}</b>
                  <i>h</i> <b>{pad2(countdown.minutes)}</b>
                  <i>m</i> <b>{pad2(countdown.seconds)}</b>
                  <i>s</i>
                </span>
              </div>
            )}
            {state.code === "open" && <span className="pill pill-ok">Wagon is running</span>}
          </div>
        </Tile>

        {/* TONIGHT — next night from data */}
        <Tile
          label="Tonight"
          tag="live"
          span={2}
          foot={`Food on site: ${foodTrucks.join(" · ")}`}
        >
          <div className="tonight">
            <span className="tonight-date">{tonight.label}</span>
            <span className="tonight-hours">
              {tonight.start} – {tonight.end}
            </span>
            <span className="tonight-meta">
              {tonight.note} · last entry {season.lastEntry}
            </span>
            {"fireworks" in tonight && <span className="pill pill-accent">Fireworks {tonight.fireworks}</span>}
          </div>
        </Tile>

        {/* Simulated tiles */}
        <Tile label="Fog" tag="sim" foot={`Last ${sim.fog.length} readings`}>
          <p className="big">
            <AnimatedNumber value={fogNow} />
            <span className="unit">%</span>
          </p>
          <Sparkline points={sim.fog} label={`Fog level, last ${sim.fog.length} readings, now ${Math.round(fogNow)} percent`} />
        </Tile>

        <Tile label="Wait time" tag="sim" foot="From the wagon line to the trail">
          <p className="big">
            <AnimatedNumber value={sim.wait} />
            <span className="unit">min</span>
          </p>
        </Tile>

        <Tile label="Temp" tag="sim" foot="Dress warmer than you think">
          <p className="big">
            <AnimatedNumber value={sim.temp} />
            <span className="unit">°F</span>
          </p>
        </Tile>

        <Tile label="Crows sighted" tag="sim" foot="Tonight, and counting">
          <p className="big">
            <AnimatedNumber value={sim.crows} />
          </p>
        </Tile>

        {/* Placeholder stat for the client */}
        <Tile label="Donations collected" tag="sample" span={2} foot="Placeholder until the owners supply a running total">
          <p className="big">
            {SAMPLE_DONATION_ITEMS.toLocaleString()}
            <span className="unit">items</span>
          </p>
          <p className="muted">
            {business.community.headline}: ${pricing.withDonation} entry with a food-shelf or winter-clothing donation.
          </p>
        </Tile>

        {/* Primary CTA */}
        <Tile label="Tickets" tag="live" span={2} tone="accent" foot={`$${pricing.trail} · $${pricing.withDonation} with a donation`}>
          <a className="btn btn-primary btn-block" href={ticketUrl} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </Tile>
      </div>

      <p className="legend" aria-label="Data legend">
        <span>
          <span className="tag tag-sim">SIM</span> Simulated — replace with live data
        </span>
        <span>
          <span className="tag tag-sample">SAMPLE</span> Placeholder numbers for the client
        </span>
        <span>
          <span className="tag tag-live">LIVE</span> From the season schedule
        </span>
      </p>
    </section>
  );
}
