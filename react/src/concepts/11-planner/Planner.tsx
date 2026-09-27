/**
 * The night planner: a stateful widget that turns four small choices into a
 * live price, a timeline and a ticket link. Sticky panel on desktop, bottom
 * sheet on phones (see styles.css).
 */
import { useId, useState } from "react";
import { business } from "@/data/business";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { computeQuote, NIGHTS, nightFireworks, PEOPLE_MAX, PEOPLE_MIN, type NightId, type Plan } from "./plan";
import { useCountUp } from "./useCountUp";
import type { PlanApi } from "./usePlan";

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n))}`;

/* ---------- Step 1: night ---------- */

function NightPicker({ value, onChange }: { value: NightId; onChange: (id: NightId) => void }) {
  const name = useId();
  return (
    <fieldset className="c11-step">
      <legend className="c11-step-title">
        <span className="c11-step-num">1</span> Pick your night
      </legend>
      <div className="c11-nights" role="radiogroup" aria-label="Night">
        {NIGHTS.map((n) => {
          const fireworks = nightFireworks(n);
          const id = `${name}-${n.id}`;
          return (
            <div className="c11-night" key={n.id}>
              <input
                className="c11-sr"
                type="radio"
                id={id}
                name={name}
                value={n.id}
                checked={value === n.id}
                onChange={() => onChange(n.id)}
              />
              <label htmlFor={id} className="c11-night-card">
                <span className="c11-night-day">{n.label.split(",")[0]}</span>
                <span className="c11-night-date">{n.short}</span>
                <span className="c11-night-note">{fireworks ? "Fireworks night" : n.note}</span>
                {fireworks && (
                  <span className="c11-badge" aria-label={`Fireworks at ${fireworks}`}>
                    Fireworks {fireworks}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ---------- Steppers (steps 2 and 3) ---------- */

interface StepperProps {
  step: number;
  title: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (n: number) => void;
}

function Stepper({ step, title, hint, value, min, max, unit, onChange }: StepperProps) {
  const id = useId();
  return (
    <div className="c11-step" role="group" aria-labelledby={`${id}-title`}>
      <div className="c11-step-title" id={`${id}-title`}>
        <span className="c11-step-num">{step}</span> {title}
      </div>
      {hint && (
        <p className="c11-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <div className="c11-stepper">
        <button
          type="button"
          className="c11-stepper-btn"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Fewer ${unit}`}
        >
          −
        </button>
        <label className="c11-sr" htmlFor={`${id}-input`}>
          {title}
        </label>
        <input
          id={`${id}-input`}
          className="c11-stepper-input"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
        />
        <button
          type="button"
          className="c11-stepper-btn"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`More ${unit}`}
        >
          +
        </button>
        <span className="c11-stepper-unit" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ---------- Step 4: Kids Day ---------- */

function KidsDayToggle({ plan, available, onChange }: { plan: Plan; available: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  const kd = business.kidsDay;
  return (
    <div className="c11-step">
      <div className="c11-step-title" id={`${id}-title`}>
        <span className="c11-step-num">4</span> Add Kids Day?
      </div>
      <label className={`c11-switch ${available ? "" : "is-off"}`} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={plan.kidsDay}
          disabled={!available}
          aria-checked={plan.kidsDay}
          aria-describedby={`${id}-desc`}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="c11-switch-track" aria-hidden="true">
          <span className="c11-switch-thumb" />
        </span>
        <span className="c11-switch-text">
          <strong>
            {kd.label}, {kd.time} · ${business.pricing.kidsDay} each
          </strong>
          <span id={`${id}-desc`} className="c11-hint">
            {available
              ? `Lights-on trail in the afternoon, then the real thing at dark. ${business.pricing.kidsDayCredit}`
              : `Kids Day is ${kd.label} only. Pick that night to add it.`}
          </span>
        </span>
      </label>
    </div>
  );
}

/* ---------- The quote ---------- */

function Quote({ plan }: { plan: Plan }) {
  const reduced = useReducedMotion();
  const quote = computeQuote(plan);
  const total = useCountUp(quote.total, reduced);
  const perPerson = Math.round(quote.total / plan.people);

  return (
    <div className="c11-quote">
      <dl className="c11-lines">
        {quote.lines.map((l) => (
          <div className={`c11-line ${l.amount < 0 ? "is-credit" : ""}`} key={l.id}>
            <dt>
              {l.label} <span className="c11-line-detail">{l.detail}</span>
            </dt>
            <dd>{money(l.amount)}</dd>
          </div>
        ))}
      </dl>

      <div className="c11-total">
        <span className="c11-total-label">Your night</span>
        <output className="c11-total-num" aria-live="polite" aria-atomic="true">
          {money(total)}
        </output>
        <span className="c11-total-sub">
          {plan.people === 1 ? "for 1 person" : `for ${plan.people} people · ≈ $${perPerson} each`}
          {quote.savings > 0 && <span className="c11-savings"> · you saved ${quote.savings}</span>}
        </span>
      </div>

      <ol className="c11-timeline" aria-label={`Timeline for ${quote.night.label}`}>
        <li>
          <span className="c11-tl-time">≈ {quote.sunset}</span>
          <span className="c11-tl-what">Sunset. It gets dark fast in the woods.</span>
        </li>
        <li>
          <span className="c11-tl-time">{quote.arriveBy}</span>
          <span className="c11-tl-what">Arrive by. Park in the field, grab a bite from the trucks.</span>
        </li>
        {quote.fireworks && (
          <li className="is-fireworks">
            <span className="c11-tl-time">{quote.fireworks}</span>
            <span className="c11-tl-what">Fireworks over the field.</span>
          </li>
        )}
        <li>
          <span className="c11-tl-time">{quote.gatesOpen}</span>
          <span className="c11-tl-what">Wagons roll. It all begins with a hayride.</span>
        </li>
        <li>
          <span className="c11-tl-time">≈ {quote.outBy}</span>
          <span className="c11-tl-what">You are out. Probably. Last entry {quote.lastEntry}.</span>
        </li>
      </ol>

      <a className="c11-btn c11-btn-primary c11-btn-big" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets · {quote.night.short}
      </a>
      <p className="c11-fineprint">
        {plan.donors > 0
          ? `Bring ${plan.donors === 1 ? "your donation item" : `${plan.donors} donation items`} to the gate.`
          : business.pricing.donationNote}
      </p>
    </div>
  );
}

/* ---------- Panel shell (sticky on desktop, bottom sheet on phones) ---------- */

export function Planner({ api }: { api: PlanApi }) {
  const { plan, setNight, setPeople, setDonors, setKidsDay, reset } = api;
  // `?plan=open` deep-links to the expanded sheet on phones (also handy for review screenshots).
  const [open, setOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("plan") === "open";
    } catch {
      return false;
    }
  });
  const sheetId = useId();
  const quote = computeQuote(plan);

  return (
    <aside className={`c11-planner ${open ? "is-open" : ""}`} aria-labelledby={`${sheetId}-h`} id="planner">
      {/* Mobile-only collapsed bar */}
      <div className="c11-sheet-bar">
        <button
          type="button"
          className="c11-sheet-toggle"
          aria-expanded={open}
          aria-controls={`${sheetId}-body`}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="c11-sheet-toggle-label">{open ? "Hide plan" : "Plan your night"}</span>
          <span className="c11-sheet-toggle-sum">
            {quote.night.short} · {plan.people} {plan.people === 1 ? "person" : "people"} · {money(quote.total)}
          </span>
        </button>
        <a className="c11-btn c11-btn-primary c11-sheet-cta" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Tickets
        </a>
      </div>

      <div className="c11-sheet-body" id={`${sheetId}-body`}>
        <header className="c11-planner-head">
          <h2 id={`${sheetId}-h`} className="c11-planner-title">
            Plan your night
          </h2>
          <button type="button" className="c11-link-btn" onClick={reset}>
            Reset
          </button>
        </header>

        <NightPicker value={plan.nightId} onChange={setNight} />
        <Stepper step={2} title="How many of you?" value={plan.people} min={PEOPLE_MIN} max={PEOPLE_MAX} unit="people" onChange={setPeople} />
        <Stepper
          step={3}
          title="Bringing a donation?"
          hint={`Food-shelf item or winter clothing = $${business.pricing.withDonation} instead of $${business.pricing.trail}. How many of you are bringing something?`}
          value={plan.donors}
          min={0}
          max={plan.people}
          unit="donors"
          onChange={setDonors}
        />
        <KidsDayToggle plan={plan} available={quote.kidsDayAvailable} onChange={setKidsDay} />
        <Quote plan={plan} />
      </div>
    </aside>
  );
}
