import type { ReactNode } from "react";
import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";

/** Panel wrapper: brushed module with corner screws and a mono label strip. */
function Module({ id, label, title, children, wide = false }: { id: string; label: string; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section id={id} className={`module${wide ? " module--wide" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="module__strip">
        <span className="module__label">{label}</span>
        <span className="led led--on led--small" aria-hidden="true" />
      </div>
      <h2 id={`${id}-title`} className="module__title">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------ attractions */
const pick = (zone: string, n: number) => business.scenes.find((z) => z.zone === zone)?.names.slice(0, n) ?? [];
const sceneTags: Record<string, readonly string[]> = {
  "The Hayride": [],
  "The Trail": pick("The Yard", 3),
  "The Tunnels": business.scenes.flatMap((z) => z.names).filter((n) => /Tunnel|Blackout|Cage/.test(n)),
  "Haunted Buildings": business.scenes.flatMap((z) => z.names).filter((n) => /Butcher|Barn|Saloon|Bus/.test(n)),
  "The Corn Maze": pick("The Back Forty", 6).filter((n) => /Corn|Graveyard|Crossing/.test(n)),
};

export function Attractions() {
  return (
    <Module id="attractions" label="CH 01–05 · Signal chain" title="What's on the trail" wide>
      <p className="module__lede">{business.voice}</p>
      <ol className="chain">
        {business.attractions.map((a, i) => (
          <li key={a.title} className="chain__item">
            <span className="chain__num">{pad2(i + 1)}</span>
            <div>
              <h3 className="chain__title">{a.title}</h3>
              <p>{a.blurb}</p>
              {sceneTags[a.title]?.length ? (
                <ul className="tags" aria-label={`Scenes in ${a.title}`}>
                  {sceneTags[a.title].map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="placeholder" role="img" aria-label="Photo placeholder: the trail entrance at dusk, wagon lights in the fog">
        <span>PHOTO: trail entrance at dusk, wagon lights in the fog</span>
      </div>
    </Module>
  );
}

/* ----------------------------------------------------------------- nights */
export function Nights() {
  return (
    <Module id="nights" label="SEQ · 4 steps" title={`${business.season.year} season · four nights`}>
      <ol className="steps">
        {business.season.nights.map((n) => (
          <li key={n.id} className={`step${"fireworks" in n ? " step--fireworks" : ""}`}>
            <span className="step__led led led--on" aria-hidden="true" />
            <div className="step__date">
              <strong>{n.label}</strong>
              <span>{n.note}</span>
            </div>
            <div className="step__time">
              <span className="mono">
                {n.start} – {n.end}
              </span>
              {"fireworks" in n && <span className="step__fw">Fireworks {n.fireworks}</span>}
            </div>
          </li>
        ))}
      </ol>
      <p className="module__note">
        Gates run {business.season.hours}. Last entry {business.season.lastEntry}. Wear boots.
      </p>
    </Module>
  );
}

/* ---------------------------------------------------------------- pricing */
export function Pricing() {
  const { pricing } = business;
  return (
    <Module id="pricing" label="GAIN · input stage" title="Pricing, out loud">
      <div className="price-grid">
        <div className="price price--hot">
          <span className="price__tag">With a donation</span>
          <span className="price__amt">${pricing.withDonation}</span>
          <p>{pricing.donationNote}</p>
        </div>
        <div className="price">
          <span className="price__tag">Haunted trail</span>
          <span className="price__amt">${pricing.trail}</span>
          <p>Hayride, trail, tunnels, buildings, corn. One ticket, everything.</p>
        </div>
        <div className="price price--kids">
          <span className="price__tag">Kids Day</span>
          <span className="price__amt">${pricing.kidsDay}</span>
          <p>{pricing.kidsDayCredit}</p>
        </div>
      </div>
      <a className="btn btn--primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </Module>
  );
}

/* --------------------------------------------------------------- kids day */
export function KidsDay() {
  const { kidsDay, pricing } = business;
  return (
    <Module id="kids" label="LO-PASS · lights on" title="Kids Day">
      <p className="big-mono">
        {kidsDay.label} · {kidsDay.time} · ${pricing.kidsDay}
      </p>
      <p>{kidsDay.blurb}</p>
      <p className="module__note">{pricing.kidsDayCredit}</p>
    </Module>
  );
}

/* -------------------------------------------------------------- community */
export function Community() {
  const { community } = business;
  return (
    <Module id="community" label="SEND · give back" title={community.headline}>
      <p>{business.origin}</p>
      <p>
        Bring one of these and your ticket drops to <strong>${business.pricing.withDonation}</strong>:
      </p>
      <ul className="list-led">
        {community.accepts.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="module__note">Partners: {community.partners.join(" · ")}. Food on site: {business.foodTrucks.join(" and ")}.</p>
    </Module>
  );
}

/* -------------------------------------------------------------------- crew */
export function Crew() {
  return (
    <Module id="crew" label="INPUT · volunteers" title="Join the Crew">
      <p>Every scare on the trail is a neighbor in a mask. We need actors, builders, ticket takers and flashlight-holders for all four nights.</p>
      <ul className="crew">
        {business.crew.map((c) => (
          <li key={c.name}>
            <strong>{c.name}</strong>
            <span>{c.role}</span>
          </li>
        ))}
      </ul>
      <div className="btn-row">
        <a className="btn" href={business.socials[0]?.href ?? "#"}>
          Volunteer this season
        </a>
        <a className="btn btn--ghost" href="#">
          Already on the crew? Log in
        </a>
      </div>
    </Module>
  );
}

/* --------------------------------------------------------------------- faq */
export function Faq() {
  return (
    <Module id="faq" label="MANUAL · read before use" title="Questions" wide>
      <div className="faq">
        {business.faq.map((f) => (
          <details key={f.q} className="faq__item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </Module>
  );
}

/* -------------------------------------------------------------- directions */
export function Directions() {
  const { address } = business;
  return (
    <Module id="directions" label="OUTPUT · find us" title="Directions">
      <p className="big-mono">{address.full}</p>
      <p>West metro, near the Crow River. Free parking in the field; follow the signs and the volunteers with flashlights.</p>
      <a className="btn" href={address.mapsUrl} target="_blank" rel="noopener noreferrer">
        Open in Maps
      </a>
      <div className="placeholder placeholder--short" role="img" aria-label="Map placeholder: field parking and the wagon pickup">
        <span>MAP: field parking and the wagon pickup</span>
      </div>
    </Module>
  );
}

/* -------------------------------------------------------------- countdown */
export function Countdown({ compact = false }: { compact?: boolean }) {
  const c = useCountdown(business.season.opensAt);
  const opening = business.season.nights[0];
  const units = [
    ["Days", String(c.days).padStart(3, "0")],
    ["Hrs", pad2(c.hours)],
    ["Min", pad2(c.minutes)],
    ["Sec", pad2(c.seconds)],
  ] as const;
  const label = c.done ? `The gates are open. ${opening.label}, ${opening.start}.` : `Opening night: ${opening.label}, ${opening.start}`;
  if (compact) {
    return (
      <p className="clock clock--compact" aria-live="off" aria-label={`Countdown to opening night: ${c.days} days, ${c.hours} hours, ${c.minutes} minutes`}>
        <span className="clock__digits">{units.map(([, v]) => v).join(":")}</span>
        <span className="clock__label">to {opening.short}</span>
      </p>
    );
  }
  return (
    <Module id="countdown" label="CLOCK · T-minus" title="Until the wagon leaves" wide>
      <div className="clock" role="timer" aria-live="off" aria-label={`Countdown to opening night: ${c.days} days, ${c.hours} hours, ${c.minutes} minutes, ${c.seconds} seconds`}>
        {units.map(([u, v]) => (
          <div key={u} className="clock__unit">
            <span className="clock__digits">{v}</span>
            <span className="clock__label">{u}</span>
          </div>
        ))}
      </div>
      <p className="module__note">{label}</p>
    </Module>
  );
}

/* ------------------------------------------------------------------ footer */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__brand">
        <CrowMark />
        <div>
          <strong>{business.name}</strong>
          <span>{business.tagline}</span>
        </div>
      </div>
      <address className="foot__addr">{business.address.full}</address>
      <ul className="foot__social" aria-label="Social links">
        {business.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <p className="foot__fine">Every sound on this page is synthesized in your browser. The trail is louder.</p>
    </footer>
  );
}

/** Crow silhouette mark, drawn once as a small SVG. */
export function CrowMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-label="Crow silhouette" role="img" className="crow">
      <path
        fill="currentColor"
        d="M4 22c3-1 6-1 8-3l-2-2c-2-2-2-5 0-7 2-1 4-1 6 0l3-4 1 1-2 4c2 1 3 3 3 5 0 1 0 2-1 3l7 4-8-2c-1 1-2 2-4 2l1 4h-2l-1-4c-1 0-2 0-3-1L6 24Z"
      />
    </svg>
  );
}
