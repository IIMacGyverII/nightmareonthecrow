/** The compact site below (and around) the chat. Every fact comes from `business`. */
import { useId, useState } from "react";
import { business, type Night } from "@/data/business";
import { pad2, type Countdown } from "@/shared/useCountdown";
import { CrowAvatar, CrowMark } from "./CrowAvatar";

const b = business;
const money = (n: number) => `$${n}`;
type FireworksNight = Extract<Night, { fireworks: string }>;
const fireworksNight = b.season.nights.find((n): n is FireworksNight => "fireworks" in n);

/** Sections that can hand a question to the chat receive this. */
export interface AskProps {
  ask: (question: string) => void;
}

const NAV = [
  ["#attractions", "Trail"],
  ["#nights", "Nights"],
  ["#pricing", "Pricing"],
  ["#kids", "Kids Day"],
  ["#community", "Community"],
  ["#crew", "Crew"],
  ["#faq", "FAQ"],
  ["#directions", "Directions"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <nav className="c16-nav" aria-label="Site">
      <a href="#top" className="c16-brand">
        <CrowMark />
        <span>{b.name}</span>
      </a>
      <button type="button" className="c16-menu-btn" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((o) => !o)}>
        Menu
      </button>
      <ul id={menuId} className={`c16-nav-links${open ? " is-open" : ""}`}>
        {NAV.map(([href, label]) => (
          <li key={href}>
            <a href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          </li>
        ))}
        <li className="c16-nav-cta">
          <a className="c16-btn c16-btn--primary c16-btn--sm" href={b.ticketUrl} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </li>
      </ul>
    </nav>
  );
}

export function HeroCopy({ cd }: { cd: Countdown }) {
  const first = b.season.nights[0];
  return (
    <div className="c16-hero-copy">
      <p className="c16-kicker">
        {b.address.city}, {b.address.state} · {b.season.nights.length} nights · October {b.season.year}
      </p>
      <h1>
        Ask <span className="c16-accent">the Crow.</span>
      </h1>
      <p className="c16-lede">
        {b.name} is a haunted trail built by three neighbors in the woods off the Crow River. The Crow answers every question — dates, prices, what's in
        the dark — before you walk in. <em>{b.voice}</em>
      </p>
      <div className="c16-hero-actions">
        <a className="c16-btn c16-btn--primary" href={b.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets · {money(b.pricing.trail)}
        </a>
        <a className="c16-btn c16-btn--ghost" href="#pricing">
          {money(b.pricing.withDonation)} with a donation
        </a>
      </div>
      <p className="c16-hero-count" aria-live="off">
        {cd.done ? (
          <>The gate is open.</>
        ) : (
          <>
            Opening night ({first.label}, {first.start}) in{" "}
            <strong>
              {cd.days}d {pad2(cd.hours)}h {pad2(cd.minutes)}m {pad2(cd.seconds)}s
            </strong>
          </>
        )}
      </p>
    </div>
  );
}

export function Attractions({ ask }: AskProps) {
  return (
    <section id="attractions" className="c16-section" aria-labelledby="c16-attr-title">
      <div className="c16-section-head">
        <h2 id="c16-attr-title">What's out there</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("What's in the woods?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <p className="c16-section-lede">{b.tagline}</p>
      <div className="c16-attr-grid">
        {b.attractions.map((a) => (
          <article key={a.title} className="c16-card">
            <h3>{a.title}</h3>
            <p>{a.blurb}</p>
          </article>
        ))}
        <div className="c16-photo" role="img" aria-label="Photo placeholder: the trail entrance at dusk">
          <span>PHOTO: trail entrance at dusk</span>
        </div>
      </div>
      <div className="c16-zones">
        {b.scenes.map((z) => (
          <div key={z.zone} className="c16-zone">
            <h3>{z.zone}</h3>
            <ul className="c16-tags">
              {z.names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Nights({ ask }: AskProps) {
  return (
    <section id="nights" className="c16-section" aria-labelledby="c16-nights-title">
      <div className="c16-section-head">
        <h2 id="c16-nights-title">Four nights</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("When are you open?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <p className="c16-section-lede">
        {b.season.hours} · last entry {b.season.lastEntry}
      </p>
      <ul className="c16-nights">
        {b.season.nights.map((n) => (
          <li key={n.id} className={`c16-night${"fireworks" in n ? " c16-night--fw" : ""}`}>
            <span className="c16-night-date">{n.label}</span>
            <span className="c16-night-time">
              {n.start} – {n.end}
            </span>
            <span className="c16-night-note">{n.note}</span>
            {"fireworks" in n && <span className="c16-badge">Fireworks {n.fireworks}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Pricing({ ask }: AskProps) {
  return (
    <section id="pricing" className="c16-section" aria-labelledby="c16-price-title">
      <div className="c16-section-head">
        <h2 id="c16-price-title">Pricing, out loud</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("How much is it?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <div className="c16-price-grid">
        <article className="c16-card c16-price">
          <h3>Haunted Trail</h3>
          <p className="c16-price-num">{money(b.pricing.trail)}</p>
          <p>Hayride, trail, tunnels, buildings, corn. One ticket, any night.</p>
        </article>
        <article className="c16-card c16-price c16-price--deal">
          <span className="c16-badge">Best deal</span>
          <h3>With a donation</h3>
          <p className="c16-price-num">{money(b.pricing.withDonation)}</p>
          <p>{b.pricing.donationNote}</p>
          <button type="button" className="c16-btn c16-btn--ghost c16-btn--sm" onClick={() => ask("How does the donation deal work?")}>
            How does that work?
          </button>
        </article>
        <article className="c16-card c16-price">
          <h3>Kids Day</h3>
          <p className="c16-price-num">{money(b.pricing.kidsDay)}</p>
          <p>{b.pricing.kidsDayCredit}</p>
        </article>
      </div>
      <a className="c16-btn c16-btn--primary" href={b.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </section>
  );
}

export function KidsDay({ ask }: AskProps) {
  return (
    <section id="kids" className="c16-section c16-section--panel" aria-labelledby="c16-kids-title">
      <div className="c16-section-head">
        <h2 id="c16-kids-title">Kids Day</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("Tell me about Kids Day")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <p className="c16-big">
        {b.kidsDay.label} · {b.kidsDay.time} · {money(b.pricing.kidsDay)}
      </p>
      <p>{b.kidsDay.blurb}</p>
      <p>{b.pricing.kidsDayCredit}</p>
      {fireworksNight && (
        <p className="c16-callout">
          Come back at dark: fireworks at {fireworksNight.fireworks}, then the haunt runs {fireworksNight.start} – {fireworksNight.end}.
        </p>
      )}
    </section>
  );
}

export function Community({ ask }: AskProps) {
  return (
    <section id="community" className="c16-section" aria-labelledby="c16-comm-title">
      <div className="c16-section-head">
        <h2 id="c16-comm-title">{b.community.headline}</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("Who runs this?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <p className="c16-section-lede">{b.origin}</p>
      <div className="c16-two">
        <div className="c16-card">
          <h3>What we collect</h3>
          <ul className="c16-list">
            {b.community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="c16-card">
          <h3>Where it goes</h3>
          <ul className="c16-list">
            {b.community.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="c16-muted">
            Every donation is {money(b.pricing.trail - b.pricing.withDonation)} off your ticket. Bring one per person.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Crew({ ask }: AskProps) {
  return (
    <section id="crew" className="c16-section c16-section--panel" aria-labelledby="c16-crew-title">
      <div className="c16-section-head">
        <h2 id="c16-crew-title">Join the Crew</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("How do I join the crew?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <p className="c16-section-lede">Volunteer actors, builders and helpers run every night. No experience needed — just a loud voice or a steady hammer.</p>
      <ul className="c16-crew">
        {b.crew.map((c) => (
          <li key={c.name} className="c16-card">
            <h3>{c.name}</h3>
            <p>{c.role}</p>
          </li>
        ))}
      </ul>
      <div className="c16-hero-actions">
        <button type="button" className="c16-btn c16-btn--primary" onClick={() => ask("How do I join the crew?")}>
          Ask how to sign up
        </button>
        <a className="c16-btn c16-btn--ghost" href="#">
          Already on the crew? Log in
        </a>
      </div>
    </section>
  );
}

export function Faq({ ask }: AskProps) {
  return (
    <section id="faq" className="c16-section" aria-labelledby="c16-faq-title">
      <div className="c16-section-head">
        <h2 id="c16-faq-title">Questions the Crow gets a lot</h2>
      </div>
      <p className="c16-section-lede">Click any question to ask the Crow directly.</p>
      <ul className="c16-faq">
        {b.faq.map((f) => (
          <li key={f.q}>
            <button type="button" className="c16-faq-q" onClick={() => ask(f.q)}>
              <span>{f.q}</span>
              <span className="c16-faq-ask" aria-hidden="true">
                Ask <CrowAvatar size={20} label="" />
              </span>
            </button>
            <p className="c16-faq-a">{f.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Directions({ ask }: AskProps) {
  const parking = b.faq.find((f) => /parking/i.test(f.q));
  return (
    <section id="directions" className="c16-section c16-section--panel" aria-labelledby="c16-dir-title">
      <div className="c16-section-head">
        <h2 id="c16-dir-title">Find us</h2>
        <button type="button" className="c16-asklink" onClick={() => ask("Where are you?")}>
          <CrowAvatar size={22} label="" /> Ask the Crow
        </button>
      </div>
      <div className="c16-two">
        <div>
          <p className="c16-big">{b.address.full}</p>
          {parking && <p>{parking.a}</p>}
          <p>Food on site: {b.foodTrucks.join(" · ")}.</p>
          <a className="c16-btn c16-btn--primary" href={b.address.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Maps
          </a>
        </div>
        <svg className="c16-map" viewBox="0 0 320 200" role="img" aria-label={`Stylized map: ${b.address.street}, ${b.address.city}`}>
          <rect width="320" height="200" rx="16" fill="#17171b" />
          <path d="M0 140 C80 120 120 170 200 130 S300 60 320 70" stroke="#2c2c34" strokeWidth="14" fill="none" />
          <path d="M0 140 C80 120 120 170 200 130 S300 60 320 70" stroke="#3a3a44" strokeWidth="2" strokeDasharray="6 8" fill="none" />
          <path d="M40 0 C60 60 30 100 70 200" stroke="#123a4a" strokeWidth="10" fill="none" opacity=".8" />
          <g transform="translate(200 128)">
            <path d="M0-28c-9 0-15 7-15 15 0 11 15 27 15 27s15-16 15-27c0-8-6-15-15-15z" fill="#ff6a00" />
            <circle r="5" cy="-13" fill="#0a0a0c" />
          </g>
          <text x="16" y="28" fill="#9a9aa6" fontFamily="Inter, sans-serif" fontSize="11">
            {b.address.street}
          </text>
          <text x="16" y="186" fill="#6b6b78" fontFamily="Inter, sans-serif" fontSize="10">
            Crow River
          </text>
        </svg>
      </div>
    </section>
  );
}

export function CountdownStrip({ cd }: { cd: Countdown }) {
  const first = b.season.nights[0];
  const units: Array<[string, number]> = [
    ["Days", cd.days],
    ["Hours", cd.hours],
    ["Minutes", cd.minutes],
    ["Seconds", cd.seconds],
  ];
  return (
    <section className="c16-section c16-countdown" aria-labelledby="c16-cd-title">
      <h2 id="c16-cd-title">{cd.done ? "The gate is open" : `Until the gate opens · ${first.label}, ${first.start}`}</h2>
      {!cd.done && (
        <div className="c16-cd-grid" role="timer" aria-live="off">
          {units.map(([label, n]) => (
            <div key={label} className="c16-cd-unit">
              <span className="c16-cd-num">{label === "Days" ? n : pad2(n)}</span>
              <span className="c16-cd-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Footer() {
  return (
    <footer className="c16-footer">
      <div className="c16-brand">
        <CrowMark />
        <span>{b.name}</span>
      </div>
      <p>{b.address.full}</p>
      <p className="c16-muted">{b.tagline}</p>
      <ul className="c16-socials" aria-label="Social links">
        {b.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <p className="c16-muted">
        Concept demo. The Crow is a scripted concierge: no AI, nothing leaves your browser. © {b.season.year} {b.name}.
      </p>
    </footer>
  );
}
