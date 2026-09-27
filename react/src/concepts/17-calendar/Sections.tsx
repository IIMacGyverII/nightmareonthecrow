/** Everything below the calendar hero. All facts from business data. */
import { useId, useState } from "react";
import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";
import { fireworksOf, monthShort, openingDay } from "./doors";
import { ArrowIcon, ClockIcon, CrowIcon, FireworkIcon, GiftIcon, MaskIcon, PinIcon, SunIcon, TruckIcon } from "./icons";

const opening = business.season.nights[0];

export function CountdownSection() {
  const c = useCountdown(business.season.opensAt);
  const units = [
    ["Days", c.days],
    ["Hours", c.hours],
    ["Min", c.minutes],
    ["Sec", c.seconds],
  ] as const;
  return (
    <section className="c17-section c17-countdown" id="countdown" aria-labelledby="c17-count-h">
      <div className="c17-paper c17-paper--tilt">
        <h2 id="c17-count-h" className="c17-h2">
          {c.done ? `Door ${openingDay} is open.` : `Door ${openingDay} opens in`}
        </h2>
        {c.done ? (
          <p className="c17-lede">The trail is live. {opening.label}, {opening.start}. See you in the woods.</p>
        ) : (
          <div className="c17-count" role="timer" aria-live="off" aria-label={`${c.days} days ${c.hours} hours ${c.minutes} minutes until opening night`}>
            {units.map(([u, v]) => (
              <div className="c17-count-unit" key={u}>
                <span className="c17-count-num">{pad2(v)}</span>
                <span className="c17-count-label">{u}</span>
              </div>
            ))}
          </div>
        )}
        <p className="c17-muted">
          Opening night is {opening.label}, {opening.start}. {business.tagline}
        </p>
      </div>
    </section>
  );
}

export function AttractionsSection() {
  return (
    <section className="c17-section" id="trail" aria-labelledby="c17-trail-h">
      <div className="c17-section-head">
        <h2 id="c17-trail-h" className="c17-h2 c17-h2--light">What's behind the doors</h2>
        <p className="c17-lede c17-lede--light">{business.voice}</p>
      </div>
      <div className="c17-cards">
        {business.attractions.map((a, i) => (
          <article className={`c17-paper c17-card ${i % 2 ? "c17-paper--tilt-r" : "c17-paper--tilt"}`} key={a.title}>
            <h3 className="c17-h3">{a.title}</h3>
            <p>{a.blurb}</p>
          </article>
        ))}
        <div className="c17-placeholder c17-card">
          <span>PHOTO: trail entrance at dusk, wagon lanterns lit</span>
        </div>
      </div>
      <div className="c17-paper c17-scenes">
        <h3 className="c17-h3">The scenes, by zone</h3>
        <p className="c17-muted">Real names. Real neighbors behind the masks.</p>
        {business.scenes.map((z) => (
          <p className="c17-scene-row" key={z.zone}>
            <strong>{z.zone}:</strong> {z.names.join(" · ")}
          </p>
        ))}
      </div>
    </section>
  );
}

export function NightsSection() {
  return (
    <section className="c17-section" id="nights" aria-labelledby="c17-nights-h">
      <div className="c17-section-head">
        <h2 id="c17-nights-h" className="c17-h2 c17-h2--light">Four nights. That's it.</h2>
        <p className="c17-lede c17-lede--light">
          Haunt hours are {business.season.hours}, last entry {business.season.lastEntry}. Gates close, woods stay dark.
        </p>
      </div>
      <ul className="c17-nights">
        {business.season.nights.map((n) => {
          const fireworks = fireworksOf(n);
          return (
            <li className="c17-paper c17-night" key={n.id}>
              <span className="c17-night-tag">{n.note}</span>
              <span className="c17-night-date">{n.label}</span>
              <span className="c17-night-hours">
                <ClockIcon /> {n.start} – {n.end}
              </span>
              {fireworks && (
                <span className="c17-night-fw">
                  <FireworkIcon /> Fireworks {fireworks}
                </span>
              )}
              <span className="c17-muted">Last entry {business.season.lastEntry}</span>
            </li>
          );
        })}
      </ul>
      <p className="c17-center">
        <a className="c17-btn c17-btn--gold" href={business.ticketUrl}>
          Get Tickets
        </a>
      </p>
    </section>
  );
}

export function PricingSection() {
  const p = business.pricing;
  return (
    <section className="c17-section" id="tickets" aria-labelledby="c17-price-h">
      <div className="c17-section-head">
        <h2 id="c17-price-h" className="c17-h2 c17-h2--light">Pricing, out loud</h2>
        <p className="c17-lede c17-lede--light">No vendor page to dig through. Here's the whole thing.</p>
      </div>
      <div className="c17-prices">
        <div className="c17-paper c17-price">
          <span className="c17-price-name">Haunted Trail</span>
          <span className="c17-price-num">${p.trail}</span>
          <span className="c17-muted">At the gate or online</span>
        </div>
        <div className="c17-paper c17-price c17-price--deal">
          <span className="c17-stamp">Best deal</span>
          <span className="c17-price-name">
            <GiftIcon /> Trail with a donation
          </span>
          <span className="c17-price-num">${p.withDonation}</span>
          <span>{p.donationNote}</span>
        </div>
        <div className="c17-paper c17-price">
          <span className="c17-price-name">
            <SunIcon /> Kids Day
          </span>
          <span className="c17-price-num">${p.kidsDay}</span>
          <span className="c17-muted">{p.kidsDayCredit}</span>
        </div>
      </div>
      <p className="c17-center">
        <a className="c17-btn" href={business.ticketUrl}>
          Get Tickets
        </a>
      </p>
    </section>
  );
}

export function KidsSection() {
  const k = business.kidsDay;
  return (
    <section className="c17-section" id="kids" aria-labelledby="c17-kids-h">
      <div className="c17-paper c17-kids c17-paper--tilt-r">
        <SunIcon className="c17-kids-sun" />
        <div>
          <h2 id="c17-kids-h" className="c17-h2">Kids Day</h2>
          <p className="c17-kids-when">
            {k.label} · {k.time} · ${business.pricing.kidsDay}
          </p>
          <p>{k.blurb}</p>
          <p className="c17-muted">{business.pricing.kidsDayCredit}</p>
          <a className="c17-btn c17-btn--gold" href={business.ticketUrl}>
            Kids Day Tickets
          </a>
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  const c = business.community;
  return (
    <section className="c17-section" id="community" aria-labelledby="c17-comm-h">
      <div className="c17-section-head">
        <h2 id="c17-comm-h" className="c17-h2 c17-h2--light">{c.headline}</h2>
        <p className="c17-lede c17-lede--light">{business.origin}</p>
      </div>
      <div className="c17-two">
        <div className="c17-paper c17-paper--tilt">
          <h3 className="c17-h3">
            <GiftIcon /> What we collect
          </h3>
          <ul className="c17-list">
            {c.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="c17-muted">Bring one item, pay ${business.pricing.withDonation} instead of ${business.pricing.trail}. Everyone wins except the cold.</p>
        </div>
        <div className="c17-paper c17-paper--tilt-r">
          <h3 className="c17-h3">Partners</h3>
          <ul className="c17-list">
            {c.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h3 className="c17-h3">
            <TruckIcon /> Food on site
          </h3>
          <p>{business.foodTrucks.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}

export function CrewSection() {
  return (
    <section className="c17-section" id="crew" aria-labelledby="c17-crew-h">
      <div className="c17-paper c17-crew">
        <div>
          <h2 id="c17-crew-h" className="c17-h2">
            <MaskIcon /> Join the Crew
          </h2>
          <p className="c17-lede">
            Volunteer actors, builders, ticket-takers and flashlight-wavers. No experience needed, just a free October weekend and a decent scream.
          </p>
          <ul className="c17-crew-list">
            {business.crew.map((m) => (
              <li key={m.name}>
                <strong>{m.name}</strong> — {m.role}
              </li>
            ))}
          </ul>
          <a className="c17-btn" href="#">
            Sign up to volunteer
          </a>
        </div>
        <div className="c17-placeholder c17-placeholder--tall">
          <span>PHOTO: crew in costume before gates open</span>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section className="c17-section" id="faq" aria-labelledby="c17-faq-h">
      <div className="c17-section-head">
        <h2 id="c17-faq-h" className="c17-h2 c17-h2--light">Questions from the line</h2>
      </div>
      <div className="c17-paper c17-faq">
        {business.faq.map((f, i) => {
          const isOpen = open === i;
          const id = `${base}-${i}`;
          return (
            <div className={`c17-faq-item ${isOpen ? "is-open" : ""}`} key={f.q}>
              <h3 className="c17-faq-q">
                <button type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : i)}>
                  <span>{f.q}</span>
                  <ArrowIcon className="c17-faq-arrow" />
                </button>
              </h3>
              <div id={id} className="c17-faq-a" hidden={!isOpen}>
                <p>{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DirectionsSection() {
  const a = business.address;
  return (
    <section className="c17-section" id="directions" aria-labelledby="c17-dir-h">
      <div className="c17-two">
        <div className="c17-paper c17-paper--tilt">
          <h2 id="c17-dir-h" className="c17-h2">
            <PinIcon /> Find the trail
          </h2>
          <p className="c17-address">{a.full}</p>
          <p>West metro, about 35 minutes from Minneapolis, along the Crow River. Free parking in the field; follow the volunteers with flashlights.</p>
          <a className="c17-btn c17-btn--gold" href={a.mapsUrl} target="_blank" rel="noreferrer">
            Open in Maps <ArrowIcon />
          </a>
        </div>
        <div className="c17-placeholder c17-placeholder--tall">
          <span>MAP: {a.city}, {a.state} — pin on {a.street}</span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="c17-footer">
      <div className="c17-footer-inner">
        <p className="c17-footer-brand">
          <CrowIcon label="Crow" /> {business.name}
        </p>
        <p className="c17-muted">
          {business.address.full} · Haunt nights {business.season.hours} · Opening {monthShort} {openingDay}
        </p>
        <ul className="c17-socials" aria-label="Social links">
          {business.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
        </ul>
        <p className="c17-muted c17-footer-tag">{business.tagline}</p>
      </div>
    </footer>
  );
}
