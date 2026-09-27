import { useId, useState } from "react";
import { business } from "@/data/business";
import { pad2, type Countdown } from "@/shared/useCountdown";
import { DawnHorizon } from "./scenes";
import { DAWN_INDEX, STOPS } from "./stops";

/** Live countdown block. Uses the shared hook's output so it never shows NaN. */
function CountdownBlock({ c }: { c: Countdown }) {
  if (c.done) return <p className="c15-count__done">The wagon is rolling. See you on the trail.</p>;
  const units: Array<[string, string | number]> = [
    ["Days", c.days],
    ["Hours", pad2(c.hours)],
    ["Min", pad2(c.minutes)],
    ["Sec", pad2(c.seconds)],
  ];
  return (
    <div className="c15-count" role="timer" aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes and ${c.seconds} seconds until opening night`}>
      {units.map(([label, value]) => (
        <div key={label} className="c15-count__unit">
          <span className="c15-count__num">{value}</span>
          <span className="c15-count__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** One-open-at-a-time accordion over business.faq. */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="c15-faq">
      {business.faq.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${base}-p${i}`;
        const buttonId = `${base}-b${i}`;
        return (
          <div key={f.q} className="c15-faq__item">
            <h4 className="c15-faq__q">
              <button type="button" id={buttonId} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{f.q}</span>
                <span className="c15-faq__sign" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h4>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="c15-faq__a">
              <p>{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Stop 7: the info slide. Taller than the viewport; scrolls vertically inside the ride. */
export function DawnSlide({ countdown }: { countdown: Countdown }) {
  const stop = STOPS[DAWN_INDEX];
  const { season, pricing, kidsDay, community, address } = business;
  const opening = season.nights[0];
  return (
    <section className="c15-slide c15-slide--dawn" id={stop.id} data-slide={DAWN_INDEX} aria-label={`Stop ${DAWN_INDEX + 1}: ${stop.name}`}>
      <div className="c15-dawn-scroll" data-vscroll>
        <header className="c15-dawn-sky">
          <DawnHorizon />
          <div className="c15-dawn-head">
            <p className="c15-eyebrow">
              Stop {DAWN_INDEX + 1} · {stop.eyebrow}
            </p>
            <h2>You made it out.</h2>
            <p className="c15-lede">
              The sky goes grey over the Crow River and the wagon heads back for the next load. Here is everything you need to come ride it yourself.
            </p>
            <div className="c15-cta">
              <a className="c15-btn c15-btn--primary" href={business.ticketUrl} target="_blank" rel="noreferrer">
                Get Tickets
              </a>
            </div>
          </div>
        </header>

        <div className="c15-info">
          {/* Nights */}
          <section aria-labelledby="c15-nights-h">
            <p className="c15-eyebrow">{season.year} season</p>
            <h3 id="c15-nights-h">Four nights. That's it.</h3>
            <ol className="c15-nights">
              {season.nights.map((n) => {
                const fireworks = "fireworks" in n ? n.fireworks : undefined;
                return (
                  <li key={n.id} className={fireworks ? "c15-night c15-night--fw" : "c15-night"}>
                    <span className="c15-night__day">{n.label}</span>
                    <span className="c15-night__time">
                      {n.start} – {n.end}
                    </span>
                    <span className="c15-night__note">{n.note}</span>
                    <span className="c15-night__entry">Last entry {season.lastEntry}</span>
                    {fireworks && <span className="c15-night__fw">Fireworks at {fireworks}, then the haunt opens</span>}
                  </li>
                );
              })}
            </ol>
            <p className="c15-muted">
              Gates open {season.hours} each night. Food on site from {business.foodTrucks.join(" and ")}.
            </p>
          </section>

          <div className="c15-grid2">
            {/* Pricing */}
            <section aria-labelledby="c15-price-h" className="c15-card c15-card--price">
              <p className="c15-eyebrow">Pricing, out loud</p>
              <h3 id="c15-price-h">Haunted Trail</h3>
              <p className="c15-price">
                <span className="c15-price__was" aria-label={`Regular price ${pricing.trail} dollars`}>
                  ${pricing.trail}
                </span>
                <span className="c15-price__now">${pricing.withDonation}</span>
                <span className="c15-price__with">with a donation</span>
              </p>
              <p>{pricing.donationNote}</p>
              <p className="c15-muted">
                Kids Day is ${pricing.kidsDay}. {pricing.kidsDayCredit}
              </p>
              <a className="c15-btn c15-btn--primary" href={business.ticketUrl} target="_blank" rel="noreferrer">
                Get Tickets
              </a>
            </section>

            {/* Kids Day */}
            <section aria-labelledby="c15-kids-h" className="c15-card">
              <p className="c15-eyebrow">
                {kidsDay.label} · {kidsDay.time}
              </p>
              <h3 id="c15-kids-h">Kids Day, lights on</h3>
              <p>{kidsDay.blurb}</p>
              <p className="c15-price c15-price--small">
                <span className="c15-price__now">${pricing.kidsDay}</span>
                <span className="c15-price__with">per kid, and it comes back as ${pricing.trail - pricing.withDonation} off tonight</span>
              </p>
              <div className="c15-photo">PHOTO: Kids Day trick-or-treating on the lit trail</div>
            </section>
          </div>

          {/* Community */}
          <section aria-labelledby="c15-give-h" className="c15-give">
            <p className="c15-eyebrow">Community</p>
            <h3 id="c15-give-h">{community.headline}</h3>
            <p className="c15-lede">
              {business.origin} Every ticket still feeds the food shelf and fills the coat drive, alongside our friends at {community.partners[0]}.
            </p>
            <div className="c15-give__cols">
              <div>
                <h4>Bring one of these</h4>
                <ul className="c15-list">
                  {community.accepts.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Where it goes</h4>
                <ul className="c15-list">
                  {community.partners.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Crew */}
          <section aria-labelledby="c15-crew-h" className="c15-crew">
            <p className="c15-eyebrow">Join the Crew</p>
            <h3 id="c15-crew-h">The trail is built by neighbors. Be one.</h3>
            <p>
              Actors, builders, ticket-takers and flashlight-wavers. No experience needed, just a free October evening and a willingness to lurk. You'll
              work alongside people like these:
            </p>
            <ul className="c15-crewlist">
              {business.crew.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </li>
              ))}
            </ul>
            <a className="c15-btn c15-btn--ghost" href={business.socials[0].href}>
              Message us to volunteer
            </a>
          </section>

          {/* FAQ */}
          <section aria-labelledby="c15-faq-h">
            <p className="c15-eyebrow">Before you ride</p>
            <h3 id="c15-faq-h">Questions from the wagon</h3>
            <Faq />
          </section>

          {/* Directions */}
          <section aria-labelledby="c15-dir-h" className="c15-grid2 c15-dir">
            <div>
              <p className="c15-eyebrow">Directions</p>
              <h3 id="c15-dir-h">Find the field</h3>
              <address className="c15-address">
                {address.street}
                <br />
                {address.city}, {address.state} {address.zip}
              </address>
              <p>
                West metro, about 35 minutes from Minneapolis, right by the Crow River. Park in the field and follow the volunteers with flashlights to
                the wagon.
              </p>
              <a className="c15-btn c15-btn--ghost" href={address.mapsUrl} target="_blank" rel="noreferrer">
                Open in Maps
              </a>
            </div>
            <div className="c15-photo c15-photo--map">MAP: {address.full}</div>
          </section>

          {/* Countdown */}
          <section aria-labelledby="c15-count-h" className="c15-countdown">
            <p className="c15-eyebrow">Opening night · {opening.label}</p>
            <h3 id="c15-count-h">The wagon leaves in</h3>
            <CountdownBlock c={countdown} />
            <a className="c15-btn c15-btn--primary" href={business.ticketUrl} target="_blank" rel="noreferrer">
              Get Tickets
            </a>
          </section>
        </div>

        <footer className="c15-footer">
          <div className="c15-footer__brand">
            <p className="c15-footer__name">{business.name}</p>
            <p className="c15-muted">{business.tagline}</p>
          </div>
          <p className="c15-muted">{address.full}</p>
          <ul className="c15-socials" aria-label="Social links">
            {business.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href}>{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="c15-muted c15-footer__fine">
            © {season.year} {business.name}. Three neighbors, one hayride, a lot of crows.
          </p>
        </footer>
      </div>
    </section>
  );
}
