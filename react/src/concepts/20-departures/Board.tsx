/**
 * The departures board: tabs → a grid of FlapRows that re-flap to each view,
 * a live countdown row, and a ticker cycling through scene names.
 *
 * Every row is always TOTAL slots wide. Column gaps are blank "gap" cells, so
 * a cell keeps its identity (and flips from old char to new) across views.
 */
import { useEffect, useId, useMemo, useState } from "react";
import { business, type Night } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";
import { FlapRow, toFlapText, wrapWords, type Tone } from "./SplitFlap";

type ViewId = "departures" | "fares" | "kids" | "crew" | "faq" | "info";

const TABS: { id: ViewId; label: string }[] = [
  { id: "departures", label: "Departures" },
  { id: "fares", label: "Fares" },
  { id: "kids", label: "Kids Day" },
  { id: "crew", label: "Crew" },
  { id: "faq", label: "FAQ" },
  { id: "info", label: "Info" },
];

interface Column {
  label: string;
  w: number;
}
const DEP_COLS: Column[] = [
  { label: "Date", w: 10 },
  { label: "Wagon", w: 6 },
  { label: "Departs", w: 8 },
  { label: "Last brd", w: 8 },
  { label: "Status", w: 14 },
  { label: "Remarks", w: 17 },
];
const TWO_COLS: Column[] = [
  { label: "Item", w: 16 },
  { label: "Detail", w: 51 },
];
/** Sum of DEP_COLS widths + one gap slot between columns. TWO_COLS matches. */
const TOTAL = DEP_COLS.reduce((a, c) => a + c.w, 0) + DEP_COLS.length - 1;
const VALUE_W = TWO_COLS[1].w;
const MIN_ROWS = 9;
const STORAGE_KEY = "c20-board-view";

interface Row {
  cells: string[];
  /** Columns each cell spans; the last cell absorbs the remainder by default. */
  spans?: number[];
  tones?: (Tone | undefined)[];
  /** Cells that change every second: no sweep delay. */
  live?: boolean;
  href?: string;
  onSelect?: () => void;
  selected?: boolean;
}
interface Laid {
  text: string;
  tones: (Tone | undefined)[];
}

/** Places cells into TOTAL slots with a blank gap slot between columns. */
function layoutRow(cols: Column[], row: Row): Laid {
  let text = "";
  const tones: (Tone | undefined)[] = [];
  let col = 0;
  row.cells.forEach((cell, ci) => {
    const isLast = ci === row.cells.length - 1;
    const span = row.spans?.[ci] ?? (isLast ? cols.length - col : 1);
    const w = cols.slice(col, col + span).reduce((a, c) => a + c.w, 0) + (span - 1);
    if (ci > 0) {
      text += " ";
      tones.push("gap");
    }
    text += toFlapText(cell).padEnd(w).slice(0, w);
    for (let k = 0; k < w; k++) tones.push(row.tones?.[ci]);
    col += span;
  });
  text = text.padEnd(TOTAL).slice(0, TOTAL);
  tones.length = TOTAL;
  return { text, tones };
}

/* ---------- time helpers (derived from data, nothing hardcoded) ---------- */

const TZ_OFFSET = business.season.opensAt.slice(-6); // e.g. "-05:00"

function to24h(t: string): string | null {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${pad2(h)}:${m[2]}`;
}
function atNight(night: Night, time: string): number {
  const hm = to24h(time);
  return hm ? Date.parse(`${night.date}T${hm}:00${TZ_OFFSET}`) : Number.NaN;
}
function nightStatus(night: Night, now: number, fogged: boolean): string {
  const start = atNight(night, night.start);
  const end = atNight(night, night.end);
  if (Number.isFinite(end) && now >= end) return "DEPARTED";
  if (Number.isFinite(start) && now >= start) return "BOARDING";
  return fogged ? "DELAYED BY FOG" : "ON TIME";
}
const stripComma = (s: string) => s.replace(",", "");
const fireworksOf = (n: Night) => ("fireworks" in n ? n.fireworks : undefined);

/** A label + wrapped multi-line value for the two-column views. */
function pair(label: string, value: string, extra: Partial<Row> = {}): Row[] {
  return wrapWords(toFlapText(value), VALUE_W).map((line, i) => ({
    cells: [i === 0 ? label : "", line],
    tones: ["amber", undefined],
    ...extra,
  }));
}
const BLANK: Row = { cells: [""] };

/* ---------- the board ---------- */

export function Board() {
  const [view, setView] = useState<ViewId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (TABS.some((t) => t.id === saved)) return saved as ViewId;
    } catch {
      /* private mode */
    }
    return "departures";
  });
  const [faqIndex, setFaqIndex] = useState(0);
  const [beat, setBeat] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const cd = useCountdown(business.season.opensAt);
  const tabsId = useId();

  const pickView = (id: ViewId) => {
    setView(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  // Status sample: every 5s beat; one night reads DELAYED BY FOG for one beat in three.
  useEffect(() => {
    const id = window.setInterval(() => setBeat((b) => b + 1), 5000);
    return () => window.clearInterval(id);
  }, []);
  // Ticker: next scene every 4s.
  const scenes = useMemo(() => business.scenes.flatMap((z) => z.names), []);
  useEffect(() => {
    const id = window.setInterval(() => setSceneIndex((i) => (i + 1) % scenes.length), 4000);
    return () => window.clearInterval(id);
  }, [scenes.length]);

  const now = Date.now();
  const countdownText = cd.done
    ? "BOARDING NOW"
    : `${cd.days > 0 ? `${cd.days} DAYS ` : ""}${pad2(cd.hours)}:${pad2(cd.minutes)}:${pad2(cd.seconds)}`;

  // Rows that don't tick every second are memoized by (view, beat, faqIndex, minute).
  const nowMinute = Math.floor(now / 60000);
  const staticRows = useMemo<Row[]>(() => {
    const { season, pricing, kidsDay, community, crew, faq, address, foodTrucks, socials } = business;
    switch (view) {
      case "departures": {
        const fogNight = beat % 3 === 2 ? Math.floor(beat / 3) % season.nights.length : -1;
        const nights = season.nights.map((n, i): Row => {
          const status = nightStatus(n, nowMinute * 60000, i === fogNight);
          const fw = fireworksOf(n);
          const tone: Tone | undefined = status === "ON TIME" ? undefined : "amber";
          return {
            cells: [stripComma(n.label), `HAY ${n.date.slice(-2)}`, n.start, season.lastEntry, status, fw ? `FIREWORKS ${fw}` : n.note],
            tones: [undefined, "dim", undefined, undefined, tone, fw ? "amber" : "dim"],
          };
        });
        return [
          ...nights,
          BLANK,
          {
            cells: ["KIDS DAY", `${stripComma(kidsDay.label)} · ${kidsDay.time} · $${pricing.kidsDay} · LIGHTS ON`],
            spans: [2, 4],
            tones: ["amber", undefined],
          },
          {
            cells: ["FARE", `$${pricing.trail} · $${pricing.withDonation} WITH A DONATION · KIDS DAY $${pricing.kidsDay}`],
            spans: [2, 4],
            tones: ["amber", undefined],
          },
        ];
      }
      case "fares":
        return [
          ...pair("HAUNTED TRAIL", `$${pricing.trail} PER PERSON`),
          ...pair("WITH DONATION", `$${pricing.withDonation} · ${pricing.donationNote}`),
          ...pair("KIDS DAY", `$${pricing.kidsDay} · ${kidsDay.label} · ${kidsDay.time}`),
          ...pair("KIDS CREDIT", pricing.kidsDayCredit),
          ...pair("WE ACCEPT", community.accepts.join(" · ")),
          ...pair("TICKETS", "ONLINE VIA HAUNTPAY · USE THE KIOSK BELOW", { href: business.ticketUrl }),
        ];
      case "kids": {
        const fwNight = season.nights.find((n) => fireworksOf(n));
        return [
          ...pair("KIDS DAY", `${kidsDay.label} · ${kidsDay.time}`),
          ...pair("FARE", `$${pricing.kidsDay} · ${pricing.kidsDayCredit}`),
          ...pair("WHAT", kidsDay.blurb),
          ...(fwNight ? pair("THAT NIGHT", `FIREWORKS ${fireworksOf(fwNight)} · HAUNT ${fwNight.start} - ${fwNight.end}`) : []),
          ...pair("ON SITE", community.partners.join(" · ")),
        ];
      }
      case "crew":
        return [
          ...crew.flatMap((c) => pair(c.name, c.role)),
          BLANK,
          ...pair("THE FOUNDERS", business.origin),
          BLANK,
          ...pair("JOIN THE CREW", "VOLUNTEER ACTORS, BUILDERS AND HELPERS WANTED · DETAILS BELOW", { href: "#crew" }),
        ];
      case "faq": {
        const answer = wrapWords(toFlapText(faq[faqIndex].a), VALUE_W);
        while (answer.length < 4) answer.push("");
        return [
          ...faq.map((f, i): Row => ({
            cells: [`Q${i + 1}`, f.q],
            tones: [i === faqIndex ? "amber" : "dim", i === faqIndex ? "amber" : undefined],
            onSelect: () => setFaqIndex(i),
            selected: i === faqIndex,
          })),
          BLANK,
          ...answer.map((line, i): Row => ({ cells: [i === 0 ? "ANSWER" : "", line], tones: ["amber", undefined] })),
        ];
      }
      case "info":
        return [
          ...pair("ADDRESS", address.full, { href: address.mapsUrl }),
          ...pair("MAP", "OPEN IN GOOGLE MAPS", { href: address.mapsUrl, tones: ["amber", "amber"] }),
          ...pair("HOURS", `${season.hours} · LAST ENTRY ${season.lastEntry}`),
          ...pair("FOOD", foodTrucks.join(" · ")),
          ...pair("GIVE BACK", `${community.headline} · ${community.partners.join(" · ")}`),
          ...pair("SOCIAL", socials.map((s) => s.label).join(" · ")),
        ];
    }
  }, [view, beat, faqIndex, nowMinute]);

  const rows: Row[] = [...staticRows];
  if (view === "departures") {
    rows.push({ cells: ["NEXT DEPARTURE IN", countdownText], spans: [2, 4], tones: ["amber", "amber"], live: true });
  }
  while (rows.length < MIN_ROWS) rows.push(BLANK);

  const cols = view === "departures" ? DEP_COLS : TWO_COLS;
  const tickerText = `NOW BOARDING: ${scenes[sceneIndex]}`;
  const tickerTones = useMemo<(Tone | undefined)[]>(() => Array.from({ length: TOTAL }, (_, i) => (i < 13 ? "amber" : undefined)), []);

  return (
    <section className="hall" aria-labelledby="board-title">
      <h2 id="board-title" className="sr-only">
        Departures board
      </h2>

      <div className="tabs" role="tablist" aria-label="Board views">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${tabsId}-${t.id}`}
            aria-selected={view === t.id}
            aria-controls={`${tabsId}-panel`}
            className={"tab" + (view === t.id ? " is-on" : "")}
            onClick={() => pickView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="board-wrap">
        <span className="swipe" aria-hidden="true">
          swipe →
        </span>
        <div className="board-scroll" id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${view}`} tabIndex={0}>
          <div className="board">
            <div className="board-head" aria-hidden="true">
              {cols.map((c) => (
                <span key={c.label} className="bh-col" style={{ width: `calc(var(--slot) * ${c.w})` }}>
                  {c.label}
                </span>
              ))}
            </div>

            <div className="board-rows">
              {rows.map((row, ri) => {
                const laid = layoutRow(cols, row);
                const plain = row.cells.filter(Boolean).join(" · ");
                return (
                  <div key={ri} className={"br" + (row.selected ? " is-selected" : "")}>
                    <FlapRow text={laid.text} width={TOTAL} tones={laid.tones} stagger={row.live ? 0 : 9} delay={row.live ? 0 : ri * 45} />
                    {row.href && (
                      <a
                        className="br-hit"
                        href={row.href}
                        aria-label={plain}
                        target={row.href.startsWith("#") ? undefined : "_blank"}
                        rel={row.href.startsWith("#") ? undefined : "noreferrer"}
                      />
                    )}
                    {row.onSelect && (
                      <button type="button" className="br-hit" aria-label={`Show answer: ${plain}`} aria-pressed={row.selected} onClick={row.onSelect} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="ticker" aria-live="off">
              <FlapRow text={tickerText} width={TOTAL} tones={tickerTones} stagger={6} className="fr-ticker" />
            </div>
          </div>
        </div>
      </div>

      <p className="board-note">
        <span>Status column is a sample. All times Central.</span>
        <span>
          Opening night in{" "}
          <time dateTime={business.season.opensAt} className="note-cd">
            {countdownText.toLowerCase()}
          </time>
        </span>
      </p>
    </section>
  );
}
