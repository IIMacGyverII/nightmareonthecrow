import { business } from "@/data/business";
import { pad2, useCountdown } from "@/shared/useCountdown";

const NAV = [
  ["#quiz", "Quiz"],
  ["#expect", "What to expect"],
  ["#nights", "Nights"],
  ["#pricing", "Pricing"],
  ["#kids", "Kids Day"],
  ["#faq", "FAQ"],
  ["#directions", "Directions"],
] as const;

/** Sticky top bar. Anchor links + the ever-present ticket button. */
export function Nav() {
  return (
    <header className="c12-nav">
      <a className="c12-nav-brand" href="#quiz">
        <CrowMark />
        <span>{business.name}</span>
      </a>
      <nav aria-label="Sections" className="c12-nav-links">
        {NAV.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="c12-btn c12-btn-lime c12-nav-cta" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </header>
  );
}

/** A small code-drawn crow used as the brand mark. */
export function CrowMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Crow silhouette" focusable="false">
      <path
        fill="currentColor"
        d="M4 20c3-1 6-1 8-3 1-2 1-5 4-7 2-1 4-1 6 0l6 1-5 2c1 2 0 4-2 6-2 1-4 2-6 2l1 5h-2l-1-5c-2 0-4 0-6-1L4 20Zm14 9h2l2 3h-3l-1-3Z"
      />
    </svg>
  );
}

function PhotoBlock({ label }: { label: string }) {
  return (
    <div className="c12-photo" role="img" aria-label={`Placeholder: ${label}`}>
      <span>PHOTO</span>
      <em>{label}</em>
    </div>
  );
}

export function Attractions() {
  const sceneNames = business.scenes.flatMap((z) => z.names);
  return (
    <section id="expect" className="c12-section" aria-labelledby="c12-expect-h">
      <div className="c12-section-head">
        <p className="c12-kicker">What to expect</p>
        <h2 id="c12-expect-h" className="c12-h2">
          Five ways in.<br />
          <span className="c12-lime">One way out.</span>
        </h2>
        <p className="c12-lede">{business.voice}</p>
      </div>
      <ol className="c12-attr-list">
        {business.attractions.map((a, i) => (
          <li key={a.title} className="c12-attr">
            <span className="c12-bignum" aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <div>
              <h3>{a.title}</h3>
              <p>{a.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="c12-scenes">
        <p className="c12-kicker">Real scenes. Real names. {sceneNames.length} of them.</p>
        <ul className="c12-scene-tags" aria-label="Scenes on the trail">
          {business.scenes.map((z) =>
            z.names.map((n) => (
              <li key={n}>
                <span className="c12-scene-zone">{z.zone}</span>
                {n}
              </li>
            )),
          )}
        </ul>
      </div>
      <div className="c12-photo-row">
        <PhotoBlock label="The wagon leaving the field at dusk" />
        <PhotoBlock label="Fog rolling through the Tunnel" />
        <PhotoBlock label="The Corn Field at night, lit from below" />
      </div>
    </section>
  );
}

export function Nights() {
  const { season } = business;
  return (
    <section id="nights" className="c12-section c12-section-lime" aria-labelledby="c12-nights-h">
      <div className="c12-section-head">
        <p className="c12-kicker">Dates &amp; hours · {season.year}</p>
        <h2 id="c12-nights-h" className="c12-h2">
          Four nights.<br />That's it.
        </h2>
        <p className="c12-lede">
          Gates {season.hours}. Last entry {season.lastEntry}. When the last wagon leaves, it leaves.
        </p>
      </div>
      <ul className="c12-nights">
        {season.nights.map((n) => (
          <li key={n.id} className="c12-night" data-fireworks={"fireworks" in n ? "y" : "n"}>
            <span className="c12-night-date">{n.short}</span>
            <span className="c12-night-label">{n.label}</span>
            <span className="c12-night-hours">
              {n.start} – {n.end}
            </span>
            <span className="c12-night-note">{n.note}</span>
            {"fireworks" in n && (
              <span className="c12-night-fw">
                <FireworkMark /> Fireworks at {n.fireworks}, then the haunt opens at {n.start}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FireworkMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 2v5M10 13v5M2 10h5M13 10h5M4.3 4.3l3.5 3.5M12.2 12.2l3.5 3.5M15.7 4.3l-3.5 3.5M7.8 12.2l-3.5 3.5" />
      </g>
    </svg>
  );
}

export function Pricing() {
  const p = business.pricing;
  return (
    <section id="pricing" className="c12-section" aria-labelledby="c12-pricing-h">
      <div className="c12-section-head">
        <p className="c12-kicker">Pricing · no surprises</p>
        <h2 id="c12-pricing-h" className="c12-h2">
          ${p.trail} bucks.<br />
          <span className="c12-lime">${p.withDonation} if you're kind.</span>
        </h2>
      </div>
      <div className="c12-price-grid">
        <div className="c12-price">
          <span className="c12-price-num">
            <sup>$</sup>
            {p.trail}
          </span>
          <span className="c12-price-name">Haunted Trail</span>
          <span className="c12-price-sub">Wagon, trail, tunnels, buildings, corn. The whole thing.</span>
        </div>
        <div className="c12-price c12-price-hot">
          <span className="c12-price-flag">Bring a donation</span>
          <span className="c12-price-num">
            <sup>$</sup>
            {p.withDonation}
          </span>
          <span className="c12-price-name">Haunted Trail + one good deed</span>
          <span className="c12-price-sub">{p.donationNote}</span>
        </div>
        <div className="c12-price">
          <span className="c12-price-num">
            <sup>$</sup>
            {p.kidsDay}
          </span>
          <span className="c12-price-name">Kids Day</span>
          <span className="c12-price-sub">{p.kidsDayCredit}</span>
        </div>
      </div>
      <a className="c12-btn c12-btn-lime c12-btn-xl" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </section>
  );
}

export function KidsDay() {
  const k = business.kidsDay;
  const fwNight = business.season.nights.find((n) => "fireworks" in n);
  return (
    <section id="kids" className="c12-section c12-section-lime" aria-labelledby="c12-kids-h">
      <div className="c12-kids">
        <div className="c12-section-head">
          <p className="c12-kicker">Kids Day · {k.label} · {k.time}</p>
          <h2 id="c12-kids-h" className="c12-h2">
            Lights on.<br />Candy out.
          </h2>
          <p className="c12-lede">{k.blurb}</p>
          <p className="c12-lede">
            <b>${business.pricing.kidsDay}</b> a ticket. {business.pricing.kidsDayCredit}
            {fwNight && "fireworks" in fwNight ? ` Fireworks at ${fwNight.fireworks}.` : ""}
          </p>
          <a className="c12-btn c12-btn-black" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
            Kids Day tickets
          </a>
        </div>
        <PhotoBlock label="Kids in costume on the lights-on trail, daytime" />
      </div>
    </section>
  );
}

export function Community() {
  const c = business.community;
  return (
    <section id="community" className="c12-section" aria-labelledby="c12-comm-h">
      <div className="c12-section-head">
        <p className="c12-kicker">Community</p>
        <h2 id="c12-comm-h" className="c12-h2">
          {c.headline}
        </h2>
        <p className="c12-lede">{business.origin}</p>
      </div>
      <div className="c12-comm-grid">
        <div className="c12-box">
          <h3>What we collect</h3>
          <ul className="c12-checklist">
            {c.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="c12-box">
          <h3>Who it goes to</h3>
          <ul className="c12-checklist">
            {c.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="c12-small">Every ${business.pricing.withDonation} ticket is a can on a shelf or a coat on a kid before the snow comes.</p>
        </div>
        <div className="c12-box">
          <h3>Food trucks on site</h3>
          <ul className="c12-checklist">
            {business.foodTrucks.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="c12-small">Eat before or after. Nobody recommends during.</p>
        </div>
      </div>
    </section>
  );
}

export function Crew() {
  return (
    <section id="crew" className="c12-section c12-section-lime" aria-labelledby="c12-crew-h">
      <div className="c12-section-head">
        <p className="c12-kicker">Join the crew</p>
        <h2 id="c12-crew-h" className="c12-h2">
          Be the reason<br />someone screams.
        </h2>
        <p className="c12-lede">
          Every actor, set builder and flashlight-waver out there is a volunteer neighbor. No experience needed. You get a
          costume, a zone, and permission to hide in the corn.
        </p>
      </div>
      <ul className="c12-crew-list">
        {business.crew.map((m) => (
          <li key={m.name}>
            <span className="c12-crew-name">{m.name}</span>
            <span>{m.role}</span>
          </li>
        ))}
        <li className="c12-crew-you">
          <span className="c12-crew-name">You?</span>
          <span>Actors, builders, ticket takers, parking guides. No experience needed. Just show up scary.</span>
        </li>
      </ul>
      <a className="c12-btn c12-btn-black" href="#" onClick={(e) => e.preventDefault()}>
        Volunteer sign-up (coming soon)
      </a>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="c12-section" aria-labelledby="c12-faq-h">
      <div className="c12-section-head">
        <p className="c12-kicker">FAQ</p>
        <h2 id="c12-faq-h" className="c12-h2">
          Asked at the gate.<br />
          <span className="c12-lime">Answered here.</span>
        </h2>
      </div>
      <div className="c12-faq">
        {business.faq.map((f, i) => (
          <details key={f.q} className="c12-faq-item">
            <summary>
              <span className="c12-faq-num" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              {f.q}
            </summary>
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
    <section id="directions" className="c12-section c12-section-lime" aria-labelledby="c12-dir-h">
      <div className="c12-dir">
        <div className="c12-section-head">
          <p className="c12-kicker">Directions</p>
          <h2 id="c12-dir-h" className="c12-h2">
            West of the city,<br />east of nowhere.
          </h2>
          <address className="c12-address">
            {a.street}
            <br />
            {a.city}, {a.state} {a.zip}
          </address>
          <p className="c12-lede">
            West of Minneapolis, near the Crow River. Free parking in the field; follow the volunteers with flashlights.
          </p>
          <a className="c12-btn c12-btn-black" href={a.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
        <div className="c12-map" role="img" aria-label={`Stylized map: ${a.full}, marked with a crow`}>
          <svg viewBox="0 0 400 300" focusable="false" aria-hidden="true">
            <path d="M0 210 C80 190 120 240 200 220 S320 170 400 190" className="c12-map-river" />
            <path d="M0 120 H400" className="c12-map-road" />
            <path d="M230 0 V300" className="c12-map-road" />
            <path d="M120 300 L170 120" className="c12-map-road c12-map-road-thin" />
            <text x="12" y="108" className="c12-map-label">
              {a.street.replace(/^\d+\s/, "").toUpperCase()}
            </text>
            <text x="238" y="24" className="c12-map-label">
              TO MINNEAPOLIS →
            </text>
            <text x="300" y="235" className="c12-map-label c12-map-label-river">
              CROW RIVER
            </text>
            <g transform="translate(190 96) scale(1.6)">
              <circle cx="0" cy="0" r="16" className="c12-map-pin" />
              <path
                fill="#000"
                transform="translate(-10 -9) scale(.62)"
                d="M4 20c3-1 6-1 8-3 1-2 1-5 4-7 2-1 4-1 6 0l6 1-5 2c1 2 0 4-2 6-2 1-4 2-6 2l1 5h-2l-1-5c-2 0-4 0-6-1L4 20Z"
              />
            </g>
          </svg>
          <span className="c12-map-tag">{a.full}</span>
        </div>
      </div>
    </section>
  );
}

export function CountdownBand() {
  const c = useCountdown(business.season.opensAt);
  const opening = business.season.nights[0];
  const units = [
    ["Days", String(c.days)],
    ["Hrs", pad2(c.hours)],
    ["Min", pad2(c.minutes)],
    ["Sec", pad2(c.seconds)],
  ] as const;
  return (
    <section id="countdown" className="c12-section c12-countdown" aria-labelledby="c12-cd-h">
      <p className="c12-kicker">
        {c.done ? "The gates are open" : `Opening night · ${opening.label} · ${opening.start}`}
      </p>
      <h2 id="c12-cd-h" className="c12-sr">
        Countdown to opening night
      </h2>
      <div className="c12-cd-grid" role="timer" aria-live="off" aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes, ${c.seconds} seconds until opening night`}>
        {units.map(([label, val]) => (
          <div key={label} className="c12-cd-unit">
            <span className="c12-cd-num">{val}</span>
            <span className="c12-cd-label">{label}</span>
          </div>
        ))}
      </div>
      <a className="c12-btn c12-btn-lime c12-btn-xl" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
        Get Tickets
      </a>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="c12-footer">
      <div className="c12-footer-brand">
        <CrowMark size={40} />
        <div>
          <strong>{business.name}</strong>
          <span>{business.tagline}</span>
        </div>
      </div>
      <address className="c12-footer-addr">{business.address.full}</address>
      <ul className="c12-socials" aria-label="Social links">
        {business.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <p className="c12-footer-fine">
        Neighbor-built in Greenfield. Every ticket helps the food shelf and the winter clothing drive. See you in the corn.
      </p>
    </footer>
  );
}
