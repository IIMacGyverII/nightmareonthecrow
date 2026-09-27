/**
 * The conventional, readable half of the page: everything the board says,
 * laid out as plain sections so nobody depends on the flaps alone.
 */
import { useId, useState } from "react";
import { business, type Night } from "@/data/business";

const fireworksOf = (n: Night) => ("fireworks" in n ? n.fireworks : undefined);

function Kiosk({ compact = false }: { compact?: boolean }) {
  const { pricing, ticketUrl } = business;
  return (
    <a className={"kiosk" + (compact ? " kiosk-sm" : "")} href={ticketUrl} target="_blank" rel="noreferrer">
      <span className="kiosk-eyebrow">Ticket kiosk</span>
      <span className="kiosk-main">Buy ticket</span>
      <span className="kiosk-fare">
        <b>${pricing.trail}</b> · ${pricing.withDonation} with a donation
      </span>
    </a>
  );
}
export { Kiosk };

function Placeholder({ label }: { label: string }) {
  return (
    <div className="ph" role="img" aria-label={`Photo placeholder: ${label}`}>
      <span>PHOTO: {label}</span>
    </div>
  );
}

function CrowMark() {
  return (
    <svg className="crow" viewBox="0 0 64 48" role="img" aria-label="Crow silhouette" focusable="false">
      <path
        fill="currentColor"
        d="M8 30c6-2 12-2 18 1l-4-9c-2-4 0-9 4-11 5-2 9 0 12 4 1 2 3 3 6 3l14 1-9 3 3 5-8-2c-2 6-7 9-13 9l-5 9-3-1 3-8c-6 0-12 1-18-4z"
      />
    </svg>
  );
}
export { CrowMark };

function Manifest() {
  return (
    <section id="manifest" className="sec" aria-labelledby="manifest-h">
      <header className="sec-head">
        <p className="eyebrow">Manifest</p>
        <h2 id="manifest-h">What's on the route</h2>
        <p className="lede">{business.voice}</p>
      </header>
      <div className="grid attractions">
        {business.attractions.map((a, i) => (
          <article key={a.title} className="card">
            <span className="card-no">{String(i + 1).padStart(2, "0")}</span>
            <h3>{a.title}</h3>
            <p>{a.blurb}</p>
          </article>
        ))}
        <Placeholder label="the wagon at the trailhead, dusk" />
      </div>
      <div className="zones">
        {business.scenes.map((z) => (
          <div key={z.zone} className="zone">
            <h3>{z.zone}</h3>
            <ul className="chips">
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

function Timetable() {
  const { season } = business;
  return (
    <section id="nights" className="sec" aria-labelledby="nights-h">
      <header className="sec-head">
        <p className="eyebrow">Timetable</p>
        <h2 id="nights-h">Four nights. Last boarding {season.lastEntry}.</h2>
        <p className="lede">
          Gates open {season.hours} each night. The wagon leaves when it's full, and it fills fast.
        </p>
      </header>
      <ol className="nights">
        {season.nights.map((n) => {
          const fw = fireworksOf(n);
          return (
            <li key={n.id} className={"night" + (fw ? " has-fw" : "")}>
              <time dateTime={n.date} className="night-date">
                {n.label}
              </time>
              <p className="night-hours">
                {n.start} – {n.end}
              </p>
              <p className="night-note">{fw ? `Fireworks at ${fw}, then the haunt runs ${n.start} – ${n.end}.` : n.note}</p>
              <p className="night-last">Last entry {season.lastEntry}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Fares() {
  const { pricing, community } = business;
  return (
    <section id="fares" className="sec" aria-labelledby="fares-h">
      <header className="sec-head">
        <p className="eyebrow">Fares</p>
        <h2 id="fares-h">One price. Printed right here.</h2>
      </header>
      <div className="fares">
        <div className="fare">
          <p className="fare-name">Haunted Trail</p>
          <p className="fare-amt">${pricing.trail}</p>
          <p className="fare-sub">per person, any night</p>
        </div>
        <div className="fare fare-hot">
          <p className="fare-name">With a donation</p>
          <p className="fare-amt">${pricing.withDonation}</p>
          <p className="fare-sub">{pricing.donationNote}</p>
          <ul className="accepts">
            {community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="fare">
          <p className="fare-name">Kids Day</p>
          <p className="fare-amt">${pricing.kidsDay}</p>
          <p className="fare-sub">{pricing.kidsDayCredit}</p>
        </div>
      </div>
      <div className="fares-cta">
        <Kiosk />
      </div>
    </section>
  );
}

function KidsDay() {
  const { kidsDay, pricing, season } = business;
  const fwNight = season.nights.find((n) => fireworksOf(n));
  return (
    <section id="kids" className="sec" aria-labelledby="kids-h">
      <header className="sec-head">
        <p className="eyebrow">Daylight service</p>
        <h2 id="kids-h">Kids Day</h2>
      </header>
      <div className="split">
        <div>
          <p className="big">
            {kidsDay.label} · {kidsDay.time} · ${pricing.kidsDay}
          </p>
          <p>{kidsDay.blurb}</p>
          <p>{pricing.kidsDayCredit}</p>
          {fwNight && (
            <p className="callout">
              Come back at dark: fireworks at {fireworksOf(fwNight)}, then the haunt runs {fwNight.start} – {fwNight.end}.
            </p>
          )}
        </div>
        <Placeholder label="kids trick-or-treating on the lights-on trail" />
      </div>
    </section>
  );
}

function Community() {
  const { community, origin } = business;
  return (
    <section id="community" className="sec" aria-labelledby="community-h">
      <header className="sec-head">
        <p className="eyebrow">Give back</p>
        <h2 id="community-h">{community.headline}</h2>
        <p className="lede">{origin}</p>
      </header>
      <div className="split">
        <div>
          <h3>Bring one of these and the fare drops to ${business.pricing.withDonation}</h3>
          <ul className="list">
            {community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Partners on the platform</h3>
          <ul className="list">
            {community.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Crew() {
  return (
    <section id="crew" className="sec" aria-labelledby="crew-h">
      <header className="sec-head">
        <p className="eyebrow">Crew</p>
        <h2 id="crew-h">Join the crew</h2>
        <p className="lede">
          Every scare on the board is a neighbor in a costume. Actors, builders, ticket takers, flashlight wavers: we need all of them for
          every night.
        </p>
      </header>
      <div className="grid crew">
        {business.crew.map((c) => (
          <article key={c.name} className="card">
            <h3>{c.name}</h3>
            <p>{c.role}</p>
          </article>
        ))}
        <article className="card card-cta">
          <h3>Want in?</h3>
          <p>No experience needed. We'll teach you the route, the rules and how to stay in character when someone screams at you.</p>
          <a className="btn" href="#directions">
            Ask at the counter
          </a>
        </article>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="sec" aria-labelledby="faq-h">
      <header className="sec-head">
        <p className="eyebrow">Information desk</p>
        <h2 id="faq-h">Questions at the counter</h2>
      </header>
      <div className="faq">
        {business.faq.map((f, i) => {
          const isOpen = open === i;
          const panelId = `${base}-p${i}`;
          const btnId = `${base}-b${i}`;
          return (
            <div key={f.q} className={"qa" + (isOpen ? " is-open" : "")}>
              <h3>
                <button type="button" id={btnId} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
                  <span>{f.q}</span>
                  <span className="qa-mark" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                <p>{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Directions() {
  const { address, foodTrucks } = business;
  return (
    <section id="directions" className="sec" aria-labelledby="directions-h">
      <header className="sec-head">
        <p className="eyebrow">Platform</p>
        <h2 id="directions-h">Getting here</h2>
      </header>
      <div className="split">
        <div>
          <p className="big">{address.full}</p>
          <p>West metro, along the Crow River. Free parking in the field; follow the signs and the volunteers with flashlights.</p>
          <a className="btn" href={address.mapsUrl} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
          <h3>Food on site</h3>
          <ul className="list">
            {foodTrucks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <Placeholder label="map of the field, the gate and the trailhead" />
      </div>
    </section>
  );
}

export function Summary() {
  return (
    <>
      <Manifest />
      <Timetable />
      <Fares />
      <KidsDay />
      <Community />
      <Crew />
      <Faq />
      <Directions />
    </>
  );
}
