/**
 * Everything below the deck: nav, attractions, nights, pricing, Kids Day,
 * community, crew, FAQ, directions, countdown, footer. Facts come from business.ts.
 */
import { useId, useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { useCountdown, pad2 } from "@/shared/useCountdown";
import { Crow, Divider, Emblem } from "./Art";
import { CARDS } from "./cards";

/* ---------- small building blocks ---------- */

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="c14-head">
      <p className="c14-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <Divider className="c14-divider" />
      {children && <p className="c14-lede">{children}</p>}
    </header>
  );
}

const NAV_LINKS = [
  { href: "#deck", label: "The Deck" },
  { href: "#trail", label: "The Trail" },
  { href: "#nights", label: "Nights" },
  { href: "#pricing", label: "Pricing" },
  { href: "#kids", label: "Kids Day" },
  { href: "#give", label: "Give Back" },
  { href: "#crew", label: "Crew" },
  { href: "#faq", label: "FAQ" },
  { href: "#find", label: "Find Us" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <nav className="c14-nav" aria-label="Primary">
      <a className="c14-brand" href="#top">
        <Crow className="c14-brand-crow" />
        <span>{business.name}</span>
      </a>
      <button
        type="button"
        className="c14-nav-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <div id={menuId} className={`c14-nav-links${open ? " is-open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="c14-btn small" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets
        </a>
      </div>
    </nav>
  );
}

/* ---------- countdown: "The first card turns in …" ---------- */

export function CountdownStrip() {
  const c = useCountdown(business.season.opensAt);
  const units = [
    { v: c.days, l: "days" },
    { v: c.hours, l: "hours" },
    { v: c.minutes, l: "minutes" },
    { v: c.seconds, l: "seconds" },
  ];
  return (
    <section className="c14-countdown" aria-label="Countdown to opening night">
      <p className="c14-eyebrow">{c.done ? "The first card has turned" : "The first card turns in"}</p>
      {c.done ? (
        <p className="c14-countdown-done">The trail is open. {business.season.nights[0].label}, {business.season.hours}.</p>
      ) : (
        <div className="c14-countdown-units" role="timer" aria-live="off">
          {units.map((u) => (
            <div className="c14-unit" key={u.l}>
              <span className="c14-unit-n">{u.l === "days" ? u.v : pad2(u.v)}</span>
              <span className="c14-unit-l">{u.l}</span>
            </div>
          ))}
        </div>
      )}
      <p className="c14-countdown-sub">
        Opening night {business.season.nights[0].label} · {business.season.hours} · last entry {business.season.lastEntry}
      </p>
    </section>
  );
}

/* ---------- attractions ---------- */

export function Attractions() {
  return (
    <section id="trail" className="c14-section">
      <SectionHead eyebrow="What the cards show" title="The Trail">
        {business.voice} Hayride, trail, tunnels, haunted buildings, corn. Eighteen scenes, eighteen cards.
      </SectionHead>
      <div className="c14-grid c14-attractions">
        {business.attractions.map((a, i) => (
          <article className="c14-tile" key={a.title}>
            <span className="c14-tile-numeral">{["I", "II", "III", "IV", "V"][i] ?? ""}</span>
            <h3>{a.title}</h3>
            <p>{a.blurb}</p>
          </article>
        ))}
      </div>
      <div className="c14-suits">
        {business.scenes.map((zone) => (
          <div className="c14-suit" key={zone.zone}>
            <h3>{zone.zone}</h3>
            <ul>
              {zone.names.map((name) => {
                const card = CARDS.find((c) => c.name === name);
                return (
                  <li key={name}>
                    {card && <Emblem kind={card.emblem} className="c14-suit-emblem" />}
                    <span>{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="c14-placeholder" role="img" aria-label="Photo placeholder: trail entrance at dusk">
        PHOTO: trail entrance at dusk, wagon lanterns lit
      </div>
    </section>
  );
}

/* ---------- nights ---------- */

export function Nights() {
  return (
    <section id="nights" className="c14-section">
      <SectionHead eyebrow="Four nights, one deck" title="Dates & Hours">
        Every night, last entry {business.season.lastEntry}. Wear boots.
      </SectionHead>
      <div className="c14-grid c14-nights">
        {business.season.nights.map((n) => {
          const fireworks = "fireworks" in n ? n.fireworks : null;
          return (
            <article className={`c14-tile c14-night${fireworks ? " has-fireworks" : ""}`} key={n.id}>
              <p className="c14-night-date">{n.label}</p>
              <p className="c14-night-hours">
                {n.start} – {n.end}
              </p>
              <p className="c14-night-note">{n.note}</p>
              {fireworks && <p className="c14-night-fire">Fireworks at {fireworks}, then the haunt</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- pricing ---------- */

export function Pricing() {
  const { trail, withDonation, donationNote, kidsDay, kidsDayCredit } = business.pricing;
  return (
    <section id="pricing" className="c14-section">
      <SectionHead eyebrow="The toll" title="Tickets">
        No hidden fees, no fine print. The cheapest fright in the west metro.
      </SectionHead>
      <div className="c14-prices">
        <article className="c14-price">
          <p className="c14-price-label">Haunted Trail</p>
          <p className="c14-price-n">${trail}</p>
          <p className="c14-price-sub">Per person, at the gate or online</p>
        </article>
        <article className="c14-price is-hero">
          <p className="c14-price-ribbon">The deck's favorite</p>
          <p className="c14-price-label">Haunted Trail with a donation</p>
          <p className="c14-price-n">${withDonation}</p>
          <p className="c14-price-sub">{donationNote}</p>
        </article>
        <article className="c14-price">
          <p className="c14-price-label">Kids Day</p>
          <p className="c14-price-n">${kidsDay}</p>
          <p className="c14-price-sub">{kidsDayCredit}</p>
        </article>
      </div>
      <div className="c14-center">
        <a className="c14-btn" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets
        </a>
      </div>
    </section>
  );
}

/* ---------- kids day ---------- */

export function KidsDay() {
  const k = business.kidsDay;
  return (
    <section id="kids" className="c14-section">
      <div className="c14-split">
        <div>
          <SectionHead eyebrow="The gentle card" title="Kids Day" />
          <p className="c14-big">
            {k.label} · {k.time} · ${business.pricing.kidsDay}
          </p>
          <p>{k.blurb}</p>
          <p className="c14-muted">{business.pricing.kidsDayCredit}</p>
        </div>
        <div className="c14-placeholder tall" role="img" aria-label="Photo placeholder: kids trick-or-treating on the lights-on trail">
          PHOTO: lights-on trail, kids in costume, fire truck
        </div>
      </div>
    </section>
  );
}

/* ---------- community ---------- */

export function Community() {
  const c = business.community;
  return (
    <section id="give" className="c14-section">
      <SectionHead eyebrow="Why the deck was made" title={c.headline}>
        {business.origin} Every ticket and every can goes back into the neighborhood.
      </SectionHead>
      <div className="c14-grid c14-give">
        <article className="c14-tile">
          <h3>Bring</h3>
          <ul className="c14-list">
            {c.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </article>
        <article className="c14-tile">
          <h3>Get</h3>
          <p>
            ${business.pricing.withDonation} entry instead of ${business.pricing.trail}. And the good kind of haunted.
          </p>
        </article>
        <article className="c14-tile">
          <h3>With</h3>
          <ul className="c14-list">
            {c.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ---------- crew ---------- */

export function Crew() {
  return (
    <section id="crew" className="c14-section">
      <SectionHead eyebrow="Be a card in the deck" title="Join the Crew">
        Every scene needs a face behind it. Volunteer actors, builders and helpers make the trail. No experience needed, just nerve.
      </SectionHead>
      <div className="c14-grid c14-crew">
        {business.crew.map((m) => (
          <article className="c14-tile" key={m.name}>
            <h3>{m.name}</h3>
            <p>{m.role}</p>
          </article>
        ))}
        <article className="c14-tile is-cta">
          <h3>You</h3>
          <p>Pick your scene, learn your scare, meet the neighbors.</p>
          <a className="c14-btn small" href="#">
            Volunteer
          </a>
          <a className="c14-link" href="#">
            Already on the crew? Log in
          </a>
        </article>
      </div>
    </section>
  );
}

/* ---------- FAQ accordion ---------- */

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const panelId = useId();
  return (
    <div className={`c14-faq-item${open ? " is-open" : ""}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <span>{q}</span>
          <span className="c14-faq-mark" aria-hidden="true">
            {open ? "–" : "+"}
          </span>
        </button>
      </h3>
      <div id={panelId} className="c14-faq-panel" hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="c14-section">
      <SectionHead eyebrow="Ask the deck" title="Questions" />
      <div className="c14-faq">
        {business.faq.map((f, i) => (
          <FaqItem key={f.q} q={f.q} a={f.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
        ))}
      </div>
    </section>
  );
}

/* ---------- directions ---------- */

export function Directions() {
  const a = business.address;
  return (
    <section id="find" className="c14-section">
      <div className="c14-split">
        <div>
          <SectionHead eyebrow="Where the trail begins" title="Find Us" />
          <p className="c14-big">{a.full}</p>
          <p>
            West metro, about 35 minutes from Minneapolis, beside the Crow River. Free parking in the field; follow the volunteers with
            flashlights.
          </p>
          <p className="c14-muted">Food trucks on site: {business.foodTrucks.join(" and ")}.</p>
          <a className="c14-btn" href={a.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Maps
          </a>
        </div>
        <div className="c14-placeholder tall" role="img" aria-label="Map placeholder">
          MAP: {a.street}, {a.city}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

export function Footer() {
  return (
    <footer className="c14-footer">
      <Crow className="c14-footer-crow" />
      <p className="c14-footer-name">{business.name}</p>
      <p className="c14-muted">
        {business.address.full} · {business.tagline}
      </p>
      <ul className="c14-socials">
        {business.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
        <li>
          <a href="#">Actor log-in</a>
        </li>
      </ul>
      <p className="c14-muted small">Season {business.season.year}. The deck is fiction; the trail is not.</p>
    </footer>
  );
}
