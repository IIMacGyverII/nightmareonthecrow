/**
 * The rest of the homepage below the wall: attractions, nights, pricing, Kids Day,
 * community, crew, FAQ, directions, countdown and footer. All facts from @/data/business.
 */
import type { CSSProperties } from "react";
import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";

const TICKET = business.ticketUrl;

/** Crow silhouette used in the nav and footer. */
export function Crow({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 48" width={size} height={size * 0.75} aria-hidden="true" focusable="false" className="crow">
      <path d="M6 30c8-2 14-8 20-14 3-3 7-6 12-6 4 0 7 2 9 5l11-1-9 4c1 4-1 9-5 12-3 2-7 3-11 3l-4 8-2-1 3-7c-5 0-9-1-13-1L8 39l3-6c-2 0-4-1-5-3z" />
    </svg>
  );
}

/** Sticky top nav with a Get Tickets CTA. */
export function Nav() {
  return (
    <header className="nav">
      <a className="skip" href="#wall">
        Skip to the wall
      </a>
      <a className="brand" href="#top" aria-label={`${business.name} home`}>
        <Crow />
        <span>{business.name}</span>
      </a>
      <nav aria-label="Sections" className="nav-links">
        <a href="#wall">Wall</a>
        <a href="#attractions">Expect</a>
        <a href="#nights">Nights</a>
        <a href="#pricing">Pricing</a>
        <a href="#kids">Kids Day</a>
        <a href="#faq">FAQ</a>
        <a href="#directions">Directions</a>
      </nav>
      <a className="btn btn-orange btn-sm" href={TICKET} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </header>
  );
}

/** Hero banner above the wall. */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-h">
      <p className="kicker">{business.address.city}, {business.address.state} · Haunted trail · {business.tagline}</p>
      <h1 id="hero-h" className="hero-h">
        Everybody screams.
        <br />
        <span className="hero-orange">Some of them write it down.</span>
      </h1>
      <p className="hero-p">{business.voice}</p>
      <div className="hero-ctas">
        <a className="btn btn-orange btn-lg" href={TICKET} target="_blank" rel="noopener noreferrer">
          Get Tickets — ${business.pricing.trail}
        </a>
        <a className="btn btn-ghost btn-lg" href="#pricing">
          Or ${business.pricing.withDonation} with a donation
        </a>
      </div>
      <Countdown />
    </section>
  );
}

/** Live countdown to opening night as a strip of torn-paper digits. */
export function Countdown() {
  const c = useCountdown(business.season.opensAt);
  const opening = business.season.nights[0];
  return (
    <div className="countdown" role="timer" aria-live="off" aria-label="Countdown to opening night">
      <span className="cd-label">{c.done ? "Gates are open" : `Gates open ${opening.label} at ${opening.start}`}</span>
      {!c.done && (
        <span className="cd-units">
          {[
            [c.days, "days"],
            [c.hours, "hrs"],
            [c.minutes, "min"],
            [c.seconds, "sec"],
          ].map(([n, l]) => (
            <span className="cd-unit" key={l}>
              <span className="cd-n">{pad2(Number(n))}</span>
              <span className="cd-l">{l}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function SectionHead({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div className="sec-head">
      <p className="kicker">{kicker}</p>
      <h2 id={id} className="sec-h">
        {title}
      </h2>
    </div>
  );
}

export function Attractions() {
  return (
    <section className="sec" id="attractions" aria-labelledby="attr-h">
      <SectionHead id="attr-h" kicker="What to expect" title="Five ways to lose your nerve" />
      <ul className="attr-grid">
        {business.attractions.map((a, i) => (
          <li className={`paper attr tone-${i % 3 === 1 ? "orange" : i % 3 === 2 ? "bone" : "paper"}`} key={a.title} style={{ "--rot": `${(i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.4)}deg` } as CSSProperties}>
            <h3>{a.title}</h3>
            <p>{a.blurb}</p>
          </li>
        ))}
        <li className="placeholder" aria-label="Photo placeholder">
          <span>PHOTO: trail entrance at dusk, wagon pulling away</span>
        </li>
      </ul>
      <div className="scenes">
        <p className="scenes-l">Real scenes on the trail this year</p>
        {business.scenes.map((z) => (
          <p className="zone" key={z.zone}>
            <strong>{z.zone}</strong>
            {z.names.map((n) => (
              <span className="scene-tag" key={n}>
                {n}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}

export function Nights() {
  const s = business.season;
  return (
    <section className="sec" id="nights" aria-labelledby="nights-h">
      <SectionHead id="nights-h" kicker={`${s.year} season`} title="Four nights. That's it." />
      <ul className="nights">
        {s.nights.map((n) => (
          <li className={`night-card ${"fireworks" in n ? "has-fw" : ""}`} key={n.id}>
            <span className="night-date">{n.label}</span>
            <span className="night-hours">
              {n.start} – {n.end}
            </span>
            <span className="night-note">{n.note}</span>
            {"fireworks" in n && <span className="fw">Fireworks {n.fireworks}</span>}
          </li>
        ))}
      </ul>
      <p className="nights-foot">
        Haunt hours {s.hours}. Last entry {s.lastEntry}. Food on site from {business.foodTrucks.join(" and ")}.
      </p>
    </section>
  );
}

export function Pricing() {
  const p = business.pricing;
  return (
    <section className="sec" id="pricing" aria-labelledby="price-h">
      <SectionHead id="price-h" kicker="Pricing, out loud" title="Cheaper if you're kind" />
      <div className="price-grid">
        <div className="paper price tone-orange" style={{ "--rot": "-1.2deg" } as CSSProperties}>
          <span className="price-n">${p.withDonation}</span>
          <span className="price-l">with a donation</span>
          <p>{p.donationNote}</p>
          <a className="btn btn-dark" href={TICKET} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </div>
        <div className="paper price tone-paper" style={{ "--rot": "1deg" } as CSSProperties}>
          <span className="price-n">${p.trail}</span>
          <span className="price-l">haunted trail</span>
          <p>Everything on the trail, hayride to exit, no upsells, no VIP line.</p>
          <a className="btn btn-dark" href={TICKET} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </div>
        <div className="paper price tone-bone" style={{ "--rot": "-0.6deg" } as CSSProperties}>
          <span className="price-n">${p.kidsDay}</span>
          <span className="price-l">Kids Day</span>
          <p>{p.kidsDayCredit}</p>
          <a className="btn btn-dark" href="#kids">
            About Kids Day
          </a>
        </div>
      </div>
    </section>
  );
}

export function KidsDay() {
  const k = business.kidsDay;
  const fwNight = business.season.nights.find((n) => "fireworks" in n);
  return (
    <section className="sec" id="kids" aria-labelledby="kids-h">
      <SectionHead id="kids-h" kicker={`${k.label} · ${k.time} · $${business.pricing.kidsDay}`} title="Kids Day: lights on, scares off" />
      <div className="two-col">
        <div>
          <p className="lead">{k.blurb}</p>
          <p>{business.pricing.kidsDayCredit}</p>
          {fwNight && "fireworks" in fwNight && (
            <p className="callout">
              Come back at dark: fireworks at {fwNight.fireworks}, then the haunt runs {fwNight.start} – {fwNight.end}.
            </p>
          )}
        </div>
        <div className="placeholder tall" aria-label="Photo placeholder">
          <span>PHOTO: kids trick-or-treating on the lights-on trail</span>
        </div>
      </div>
    </section>
  );
}

export function Community() {
  const c = business.community;
  return (
    <section className="sec" id="community" aria-labelledby="comm-h">
      <SectionHead id="comm-h" kicker="Give back" title={c.headline} />
      <div className="two-col">
        <div>
          <p className="lead">{business.origin}</p>
          <p>
            The discount is not a gimmick. Every can and every coat goes to our partners: {c.partners.join(" and ")}.
          </p>
        </div>
        <ul className="accepts">
          {c.accepts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Crew() {
  return (
    <section className="sec" id="crew" aria-labelledby="crew-h">
      <SectionHead id="crew-h" kicker="Join the crew" title="The screams need staff" />
      <div className="two-col">
        <div>
          <p className="lead">Volunteer actors, builders and gate crew make every one of these notes happen. No experience needed. Fake blood provided.</p>
          <a className="btn btn-orange" href="#crew">
            Join the Crew
          </a>
        </div>
        <ul className="crew-list">
          {business.crew.map((m) => (
            <li className="paper crew-card tone-paper" key={m.name}>
              <strong>{m.name}</strong>
              <span>{m.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-h">
      <SectionHead id="faq-h" kicker="Questions" title="Before you scream" />
      <div className="faq">
        {business.faq.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Directions() {
  const a = business.address;
  return (
    <section className="sec" id="directions" aria-labelledby="dir-h">
      <SectionHead id="dir-h" kicker="Directions" title="Find the field" />
      <div className="two-col">
        <div>
          <p className="lead addr">{a.full}</p>
          <p>West metro, near the Crow River. Free parking in the field; follow the volunteers with flashlights.</p>
          <a className="btn btn-ghost" href={a.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
        <div className="placeholder map" aria-label="Map placeholder">
          <span>MAP: {a.street}, {a.city}</span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="foot-brand">
        <Crow size={36} />
        <span>{business.name}</span>
      </div>
      <p>{business.address.full}</p>
      <ul className="socials" aria-label="Social links">
        {business.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <a className="btn btn-orange" href={TICKET} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
      <p className="fine">Notes on the wall are anonymous sample reactions for this concept demo.</p>
    </footer>
  );
}
