/**
 * Everything around the planner: hero, attractions, dates, pricing, Kids Day,
 * community, crew, FAQ, directions, footer. All copy pulls facts from data.
 */
import { useId, useState } from "react";
import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";
import { nightFireworks, NIGHTS, type NightId } from "./plan";
import { CrowMark } from "./Scenery";

const { pricing, season, kidsDay, community, faq, address } = business;

/* ---------- Hero ---------- */

function CountdownStrip() {
  const c = useCountdown(season.opensAt);
  const units: Array<[string, number]> = [
    ["days", c.days],
    ["hrs", c.hours],
    ["min", c.minutes],
    ["sec", c.seconds],
  ];
  return (
    <div className="c11-countdown" role="timer" aria-live="off" aria-label="Countdown to opening night">
      <span className="c11-countdown-label">{c.done ? "The gates are open" : "Opening night in"}</span>
      {!c.done && (
        <div className="c11-countdown-units">
          {units.map(([u, v]) => (
            <span className="c11-countdown-unit" key={u}>
              <span className="c11-countdown-num">{u === "days" ? v : pad2(v)}</span>
              <span className="c11-countdown-u">{u}</span>
            </span>
          ))}
        </div>
      )}
      <span className="c11-countdown-when">
        {NIGHTS[0].label} · {NIGHTS[0].start}
      </span>
    </div>
  );
}

export function Hero({ onPlan }: { onPlan: () => void }) {
  return (
    <section className="c11-hero" id="top">
      <p className="c11-eyebrow">
        {address.city}, {address.state} · {NIGHTS.length} nights · October {season.year}
      </p>
      <h1 className="c11-h1">
        Plan your night
        <br />
        <span className="c11-h1-accent">on the Crow.</span>
      </h1>
      <p className="c11-lede">
        {business.voice} A neighbor-built haunted trail along the Crow River: a hayride in, real woods, tunnels, live actors, and the corn.
        Pick a night, count your party, see your price. No surprises until you are in the dark.
      </p>
      <div className="c11-hero-ctas">
        <a className="c11-btn c11-btn-primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Get Tickets
        </a>
        <button type="button" className="c11-btn c11-btn-ghost" onClick={onPlan}>
          Build my plan
        </button>
      </div>
      <p className="c11-offer-pill">
        <strong>${pricing.withDonation}</strong> with a donation · <span>${pricing.trail} without</span>
      </p>
      <CountdownStrip />
      <div className="c11-photo c11-photo-hero" role="img" aria-label="Placeholder for a photo of the trail entrance at dusk">
        <span>PHOTO: trail entrance at dusk, wagon waiting</span>
      </div>
    </section>
  );
}

/* ---------- Attractions ---------- */

export function Attractions() {
  const sceneList = business.scenes.flatMap((z) => z.names);
  return (
    <section className="c11-section" id="attractions" aria-labelledby="c11-attr-h">
      <p className="c11-kicker">What to expect</p>
      <h2 className="c11-h2" id="c11-attr-h">
        {business.tagline}
      </h2>
      <p className="c11-sub">
        Forty-five minutes to an hour from the wagon to the exit. Every part of it is built by hand by neighbors who take this far too seriously.
      </p>
      <div className="c11-grid c11-grid-attr">
        {business.attractions.map((a, i) => (
          <article className="c11-card" key={a.title}>
            <span className="c11-card-num" aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <h3 className="c11-h3">{a.title}</h3>
            <p>{a.blurb}</p>
          </article>
        ))}
        <article className="c11-card c11-card-scenes">
          <h3 className="c11-h3">By name</h3>
          <p>The owner let us say it out loud. Out there you will meet, in some order:</p>
          <ul className="c11-chips" aria-label="Scene names">
            {sceneList.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ---------- Dates ---------- */

export function Dates({ selected, onPick }: { selected: NightId; onPick: (id: NightId) => void }) {
  return (
    <section className="c11-section" id="dates" aria-labelledby="c11-dates-h">
      <p className="c11-kicker">Dates &amp; hours</p>
      <h2 className="c11-h2" id="c11-dates-h">
        {NIGHTS.length} nights. That is all you get.
      </h2>
      <p className="c11-sub">
        Haunt runs {season.hours}, last entry {season.lastEntry}. Tap a night to drop it into your plan.
      </p>
      <ul className="c11-dates">
        {NIGHTS.map((n) => {
          const fw = nightFireworks(n);
          const active = n.id === selected;
          return (
            <li key={n.id}>
              <button
                type="button"
                className={`c11-date ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => onPick(n.id)}
              >
                <span className="c11-date-label">{n.label}</span>
                <span className="c11-date-hours">
                  {n.start} – {n.end}
                </span>
                <span className="c11-date-note">{fw ? `Fireworks ${fw}, then the haunt` : n.note}</span>
                {fw && <span className="c11-badge">Fireworks</span>}
                <span className="c11-date-cta" aria-hidden="true">
                  {active ? "In your plan" : "Plan this night"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Pricing ---------- */

export function Pricing() {
  const off = pricing.trail - pricing.withDonation;
  return (
    <section className="c11-section" id="pricing" aria-labelledby="c11-price-h">
      <p className="c11-kicker">Pricing, out loud</p>
      <h2 className="c11-h2" id="c11-price-h">
        ${pricing.withDonation} if you bring something. ${pricing.trail} if you don't.
      </h2>
      <div className="c11-offer">
        <div className="c11-offer-main">
          <span className="c11-offer-price">
            <sup>$</sup>
            {pricing.withDonation}
          </span>
          <div>
            <h3 className="c11-h3">The donation ticket</h3>
            <p>{pricing.donationNote}</p>
            <p className="c11-muted">
              That is ${off} off for a can of soup or a spare pair of mittens. It all goes to the food shelf and the winter clothing drive.
            </p>
          </div>
        </div>
        <div className="c11-offer-side">
          <div>
            <span className="c11-offer-small">${pricing.trail}</span>
            <span className="c11-muted">Haunted Trail, no donation</span>
          </div>
          <div>
            <span className="c11-offer-small">${pricing.kidsDay}</span>
            <span className="c11-muted">Kids Day, and it is worth ${pricing.kidsDay} off at night</span>
          </div>
        </div>
      </div>
      <p className="c11-sub">
        The big haunts around the Cities charge a lot more and hide the number behind a ticket vendor. Ours is right here, and the
        planner on this page does the math for your whole group.
      </p>
    </section>
  );
}

/* ---------- Kids Day ---------- */

export function KidsDay() {
  return (
    <section className="c11-section c11-kids" id="kids-day" aria-labelledby="c11-kids-h">
      <div className="c11-kids-copy">
        <p className="c11-kicker">Kids Day</p>
        <h2 className="c11-h2" id="c11-kids-h">
          {kidsDay.label}, {kidsDay.time}. Lights on.
        </h2>
        <p>{kidsDay.blurb}</p>
        <p>
          <strong>${pricing.kidsDay} a ticket.</strong> {pricing.kidsDayCredit} Come in the daylight, come back at dark: the afternoon pays for itself.
        </p>
        <a className="c11-btn c11-btn-primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
          Kids Day Tickets
        </a>
      </div>
      <div className="c11-photo" role="img" aria-label="Placeholder for a photo of Kids Day trick-or-treating on the trail">
        <span>PHOTO: kids in costume on the lights-on trail</span>
      </div>
    </section>
  );
}

/* ---------- Community ---------- */

export function Community() {
  return (
    <section className="c11-section" id="community" aria-labelledby="c11-comm-h">
      <p className="c11-kicker">Give back</p>
      <h2 className="c11-h2" id="c11-comm-h">
        {community.headline}
      </h2>
      <p className="c11-sub">{business.origin} The scares fund the drives. Every donation ticket is a real item going to a real neighbor.</p>
      <div className="c11-grid c11-grid-3">
        <div className="c11-card">
          <h3 className="c11-h3">What to bring</h3>
          <ul className="c11-list">
            {community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="c11-card">
          <h3 className="c11-h3">Who it helps</h3>
          <ul className="c11-list">
            {community.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="c11-card">
          <h3 className="c11-h3">Fuel</h3>
          <p>On site every night:</p>
          <ul className="c11-list">
            {business.foodTrucks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Crew ---------- */

export function Crew() {
  return (
    <section className="c11-section" id="crew" aria-labelledby="c11-crew-h">
      <p className="c11-kicker">Join the crew</p>
      <h2 className="c11-h2" id="c11-crew-h">
        Nobody here is paid. Everybody here is having the best night of the year.
      </h2>
      <div className="c11-grid c11-grid-2">
        {business.crew.map((c) => (
          <div className="c11-card c11-card-crew" key={c.name}>
            <span className="c11-avatar" aria-hidden="true">
              {c.name[0]}
            </span>
            <div>
              <h3 className="c11-h3">{c.name}</h3>
              <p>{c.role}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="c11-sub">
        Actors, builders, ticket takers, flashlight wavers in the parking field. If you can stand in the dark and wait for the right moment, we
        have a spot for you.
      </p>
      <a className="c11-btn c11-btn-ghost" href="#">
        Volunteer with us
      </a>
    </section>
  );
}

/* ---------- FAQ accordion ---------- */

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const base = useId();
  return (
    <section className="c11-section" id="faq" aria-labelledby="c11-faq-h">
      <p className="c11-kicker">Questions</p>
      <h2 className="c11-h2" id="c11-faq-h">
        Before you come.
      </h2>
      <div className="c11-faq">
        {faq.map((item, i) => {
          const open = openIdx === i;
          const qid = `${base}-q${i}`;
          const aid = `${base}-a${i}`;
          return (
            <div className={`c11-faq-item ${open ? "is-open" : ""}`} key={item.q}>
              <h3 className="c11-faq-q">
                <button type="button" id={qid} aria-expanded={open} aria-controls={aid} onClick={() => setOpenIdx(open ? null : i)}>
                  <span>{item.q}</span>
                  <span className="c11-faq-icon" aria-hidden="true">
                    {open ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={aid} role="region" aria-labelledby={qid} className="c11-faq-a" hidden={!open}>
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Directions ---------- */

export function Directions() {
  return (
    <section className="c11-section" id="directions" aria-labelledby="c11-dir-h">
      <p className="c11-kicker">Find us</p>
      <h2 className="c11-h2" id="c11-dir-h">
        West of the Cities, on the river.
      </h2>
      <div className="c11-dir">
        <div>
          <address className="c11-address">
            {address.street}
            <br />
            {address.city}, {address.state} {address.zip}
          </address>
          <p className="c11-muted">West of the Cities, near the Crow River. Free parking in the field; follow the volunteers with flashlights.</p>
          <a className="c11-btn c11-btn-ghost" href={address.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Maps
          </a>
        </div>
        <div className="c11-map" aria-hidden="true">
          <svg viewBox="0 0 320 200" preserveAspectRatio="none">
            <path d="M0 140 C60 120 90 170 150 140 S250 90 320 110" fill="none" stroke="#28405f" strokeWidth="14" strokeLinecap="round" />
            <path d="M0 60 L320 40" stroke="#2a2f3a" strokeWidth="3" />
            <path d="M120 0 L140 200" stroke="#2a2f3a" strokeWidth="3" />
            <circle cx="190" cy="100" r="9" fill="#ff6a00" />
            <circle cx="190" cy="100" r="18" fill="none" stroke="#ff6a00" strokeOpacity="0.4" strokeWidth="2" />
          </svg>
          <span className="c11-map-label">MAP: Crow River, county roads, the field</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

export function Footer() {
  return (
    <footer className="c11-footer">
      <div className="c11-footer-brand">
        <CrowMark size={34} label={`${business.name} crow mark`} />
        <span>{business.name}</span>
      </div>
      <p className="c11-muted">
        {address.full} · {season.hours}, last entry {season.lastEntry}
      </p>
      <ul className="c11-socials" aria-label="Social links">
        {business.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <p className="c11-muted c11-tiny">Sample quotes and photo placeholders are for concept review only.</p>
    </footer>
  );
}
