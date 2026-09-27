/**
 * Concept 17 — "31 Doors": an advent-style October calendar as the hero.
 * State lives here: which doors are open (persisted), preview mode, the
 * selected door shown on the stage, and the roving focus for keyboard nav.
 */
import { useEffect, useId, useMemo, useState } from "react";
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { Calendar } from "./Calendar";
import { Reveal } from "./Reveal";
import {
  AttractionsSection,
  CommunitySection,
  CountdownSection,
  CrewSection,
  DirectionsSection,
  FaqSection,
  Footer,
  KidsSection,
  NightsSection,
  PricingSection,
} from "./Sections";
import { buildDoors, daysInMonth, isSameDay, loadOpened, loadPreview, monthName, openableThrough, saveOpened, savePreview, season } from "./doors";
import { CrowIcon, LockIcon } from "./icons";
import "./styles.css";

const NAV = [
  ["#trail", "The Trail"],
  ["#nights", "Nights"],
  ["#tickets", "Tickets"],
  ["#kids", "Kids Day"],
  ["#community", "Give Back"],
  ["#crew", "Crew"],
  ["#faq", "FAQ"],
  ["#directions", "Find Us"],
] as const;

export function App() {
  const reduced = useReducedMotion();
  const doors = useMemo(buildDoors, []);
  const [now] = useState(() => new Date());
  const [opened, setOpened] = useState<number[]>(loadOpened);
  const [preview, setPreview] = useState<boolean>(loadPreview);
  const [selected, setSelected] = useState<number | null>(() => {
    const saved = loadOpened();
    return saved.length ? saved[saved.length - 1] : null;
  });
  const [focusDay, setFocusDay] = useState(1);
  const [shakingDay, setShakingDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const switchId = useId();
  const menuId = useId();

  const through = preview ? daysInMonth : openableThrough(now);
  const isLocked = (day: number) => day > through;
  const isToday = (day: number) => isSameDay(now, day);
  const openedSet = useMemo(() => new Set(opened), [opened]);

  useEffect(() => saveOpened(opened), [opened]);
  useEffect(() => savePreview(preview), [preview]);
  useEffect(() => {
    if (shakingDay === null) return;
    const t = window.setTimeout(() => setShakingDay(null), 450);
    return () => window.clearTimeout(t);
  }, [shakingDay]);

  function activate(day: number) {
    setFocusDay(day);
    if (isLocked(day)) {
      if (!reduced) setShakingDay(day);
      return;
    }
    setSelected(day);
    setOpened((prev) => (prev.includes(day) ? prev : [...prev, day]));
  }

  function togglePreview(on: boolean) {
    setPreview(on);
    if (!on) {
      // Re-lock the future: doors past today close again.
      const limit = openableThrough(now);
      setOpened((prev) => prev.filter((d) => d <= limit));
      setSelected((s) => (s !== null && s > limit ? null : s));
    }
  }

  function closeAll() {
    setOpened([]);
    setSelected(null);
  }

  const stageDoor = selected !== null && openedSet.has(selected) ? doors[selected - 1] : null;
  const lockedCount = doors.filter((d) => isLocked(d.day)).length;

  return (
    <div className={`c17 ${reduced ? "c17--reduced" : ""}`}>
      <a className="c17-skip" href="#calendar">
        Skip to the calendar
      </a>

      <nav className="c17-nav" aria-label="Site">
        <a className="c17-brand" href="#top">
          <CrowIcon label="Crow" /> <span>{business.name}</span>
        </a>
        <button
          type="button"
          className="c17-menu-btn"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((m) => !m)}
        >
          Menu
        </button>
        <ul id={menuId} className={`c17-nav-links ${menuOpen ? "is-open" : ""}`}>
          {NAV.map(([href, label]) => (
            <li key={href}>
              <a href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a className="c17-btn c17-btn--sm" href={business.ticketUrl}>
          Get Tickets
        </a>
      </nav>

      <header className="c17-hero" id="top">
        <div className="c17-hero-head">
          <p className="c17-kicker">{business.name} · Greenfield, MN</p>
          <h1 className="c17-title">
            {monthName} {season.year}
          </h1>
          <p className="c17-lede c17-lede--light">
            {daysInMonth} doors. {business.season.nights.length} haunt nights. One trail through the woods on the Crow. Open a door a day, or skip ahead
            and buy the ticket now.
          </p>
          <div className="c17-hero-cta">
            <a className="c17-btn c17-btn--lg" href={business.ticketUrl}>
              Get Tickets
            </a>
            <span className="c17-hero-price">
              ${business.pricing.trail} · <strong>${business.pricing.withDonation} with a donation</strong>
            </span>
          </div>
        </div>

        <section className="c17-cal" id="calendar" aria-labelledby="c17-cal-h">
          <div className="c17-sheet">
            <div className="c17-sheet-top">
              <h2 id="c17-cal-h" className="c17-sheet-title">
                {daysInMonth} Doors
              </h2>
              <p className="c17-counter" aria-live="polite">
                <strong>{opened.length}</strong> of {daysInMonth} opened
              </p>
            </div>
            <Calendar
              doors={doors}
              opened={openedSet}
              isLocked={isLocked}
              isToday={isToday}
              selected={selected}
              focusDay={focusDay}
              shakingDay={shakingDay}
              onActivate={activate}
              onFocusDay={setFocusDay}
            />
            <div className="c17-sheet-foot">
              <label className="c17-switch" htmlFor={switchId}>
                <input id={switchId} type="checkbox" role="switch" checked={preview} onChange={(e) => togglePreview(e.target.checked)} />
                <span className="c17-switch-track" aria-hidden="true" />
                <span>Preview mode: unlock all</span>
              </label>
              <p className="c17-sheet-note">
                {lockedCount > 0 ? (
                  <>
                    <LockIcon /> {lockedCount} {lockedCount === 1 ? "door is" : "doors are"} locked until {lockedCount === daysInMonth ? `${monthName} 1` : "their day"}.
                  </>
                ) : (
                  <>Every door is unlocked.</>
                )}
              </p>
              {opened.length > 0 && (
                <button type="button" className="c17-textbtn" onClick={closeAll}>
                  Close all doors
                </button>
              )}
            </div>
          </div>
          <aside className="c17-stage" aria-label="Behind the door">
            <Reveal door={stageDoor} />
          </aside>
        </section>
      </header>

      <main>
        <CountdownSection />
        <AttractionsSection />
        <NightsSection />
        <PricingSection />
        <KidsSection />
        <CommunitySection />
        <CrewSection />
        <FaqSection />
        <DirectionsSection />
      </main>
      <Footer />
      <ConceptBadge number={17} name="31 Doors" corner="bottom-right" />
    </div>
  );
}
