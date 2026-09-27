import { useCallback } from "react";
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { Planner } from "./Planner";
import { CrowMark, Moon, Treeline } from "./Scenery";
import { Attractions, Community, Crew, Dates, Directions, Faq, Footer, Hero, KidsDay, Pricing } from "./Sections";
import { usePlan } from "./usePlan";
import "./styles.css";

const NAV = [
  ["#attractions", "Trail"],
  ["#dates", "Dates"],
  ["#pricing", "Pricing"],
  ["#kids-day", "Kids Day"],
  ["#faq", "FAQ"],
] as const;

export function App() {
  const api = usePlan();
  const reduced = useReducedMotion();

  /** "Build my plan" and the date cards send focus into the panel; on phones the sheet is opened via its own toggle. */
  const focusPlanner = useCallback(() => {
    const panel = document.getElementById("planner");
    if (!panel) return;
    const bar = panel.querySelector<HTMLButtonElement>(".c11-sheet-toggle");
    const barVisible = bar && getComputedStyle(bar).display !== "none";
    if (barVisible) {
      if (bar.getAttribute("aria-expanded") !== "true") bar.click();
      return;
    }
    panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    panel.querySelector<HTMLInputElement>("input[type=radio]:checked")?.focus({ preventScroll: true });
  }, [reduced]);

  return (
    <div className="c11">
      <a className="c11-skip" href="#planner">
        Skip to the planner
      </a>
      <Moon />
      <div className="c11-sky" aria-hidden="true">
        <Treeline />
      </div>

      <nav className="c11-nav" aria-label="Primary">
        <a className="c11-nav-brand" href="#top">
          <CrowMark size={26} label={`${business.name} home`} />
          <span>{business.name}</span>
        </a>
        <ul className="c11-nav-links">
          {NAV.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="c11-btn c11-btn-primary c11-nav-cta" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets
        </a>
      </nav>

      <div className="c11-layout">
        <main className="c11-main">
          <Hero onPlan={focusPlanner} />
          <Attractions />
          <Dates
            selected={api.plan.nightId}
            onPick={(id) => {
              api.setNight(id);
              focusPlanner();
            }}
          />
          <Pricing />
          <KidsDay />
          <Community />
          <Crew />
          <Faq />
          <Directions />
          <Footer />
        </main>
        <Planner api={api} />
      </div>

      <ConceptBadge number={11} name="Plan Your Night" corner="bottom-right" />
    </div>
  );
}
