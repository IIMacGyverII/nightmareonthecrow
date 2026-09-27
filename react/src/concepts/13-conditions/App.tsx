/**
 * Concept #13 — "Trail Conditions"
 * The haunt as a live status dashboard, like a ski resort's conditions page.
 */
import { useId, useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { Board, BusyBar } from "./Board";
import { hashString } from "./sim";
import "./styles.css";

const NAV = [
  { href: "#conditions", label: "Conditions" },
  { href: "#nights", label: "Nights" },
  { href: "#scenes", label: "Scenes" },
  { href: "#pricing", label: "Pricing" },
  { href: "#kids", label: "Kids Day" },
  { href: "#crew", label: "Crew" },
  { href: "#faq", label: "FAQ" },
  { href: "#directions", label: "Directions" },
];

/* ------------------------------------------------------------------ */
/* Layout bits                                                         */
/* ------------------------------------------------------------------ */

function SectionHead({ id, code, title, note }: { id: string; code: string; title: string; note?: string }) {
  return (
    <header className="sec-h">
      <span className="lbl code">{code}</span>
      <h2 id={id}>{title}</h2>
      {note && <p className="sec-note">{note}</p>}
    </header>
  );
}

function Placeholder({ kind, text }: { kind: "PHOTO" | "MAP"; text: string }) {
  return (
    <div className="ph" role="img" aria-label={`${kind} placeholder: ${text}`}>
      <span className="lbl">{kind}</span>
      <span>{text}</span>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <nav className="nav" aria-label="Primary">
      <a className="brand" href="#conditions">
        <CrowMark />
        <span>{business.name}</span>
      </a>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        Menu
      </button>
      <ul id={menuId} className={`nav-links${open ? " open" : ""}`}>
        {NAV.map((n) => (
          <li key={n.href}>
            <a href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          </li>
        ))}
        <li className="nav-cta">
          <a className="btn btn-primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </li>
      </ul>
    </nav>
  );
}

function CrowMark() {
  return (
    <svg className="crow" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M2 14c5-1 8-3 11-7 2-3 5-4 8-3l4-2-2 4c2 1 3 3 3 6 0 5-4 9-10 9-3 0-5-1-7-3l-6 5 3-7c-2 0-3-1-4-2z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Terrain() {
  return (
    <section className="sec" id="terrain" aria-labelledby="terrain-h">
      <SectionHead id="terrain-h" code="01" title="Terrain report" note="What you're walking into. Five legs, one wagon, no shortcuts." />
      <div className="terrain">
        <ol className="terrain-list">
          {business.attractions.map((a, i) => (
            <li key={a.title} className="panel terrain-row">
              <span className="lbl code">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.blurb}</p>
              </div>
            </li>
          ))}
        </ol>
        <Placeholder kind="PHOTO" text="Trail entrance at dusk, wagon lights in the fog" />
      </div>
    </section>
  );
}

/** Sample "how busy" level per night, deterministic from the night id. */
const busyLevel = (id: string) => 2 + (hashString(id) % 4);

function Nights() {
  const { season, kidsDay } = business;
  return (
    <section className="sec" id="nights" aria-labelledby="nights-h">
      <SectionHead id="nights-h" code="02" title="Night by night" note={`Four nights. ${season.hours}, last entry ${season.lastEntry}.`} />
      <div className="nights">
        {season.nights.map((n) => (
          <article key={n.id} className={`panel night${"fireworks" in n ? " has-fx" : ""}`}>
            <header className="tile-h">
              <span className="lbl">{n.note}</span>
              <span className="tag tag-live">LIVE</span>
            </header>
            <h3>{n.label}</h3>
            <p className="night-hours">
              {n.start} – {n.end}
            </p>
            <p className="muted">Last entry {season.lastEntry}</p>
            {"fireworks" in n && <span className="pill pill-accent">Fireworks {n.fireworks}</span>}
            {kidsDay.date === n.date && (
              <p className="muted">
                Kids Day {kidsDay.time}. Come back at dark for fireworks.
              </p>
            )}
            <div className="night-busy">
              <span className="lbl">
                How busy <span className="tag tag-sample">SAMPLE</span>
              </span>
              <BusyBar level={busyLevel(n.id)} label={`Expected crowd on ${n.label}`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type SceneStatus = "open" | "rebuilding" | "moved";
const SCENE_STATUS: Record<SceneStatus, { text: string; glyph: string }> = {
  open: { text: "Open", glyph: "●" },
  rebuilding: { text: "Rebuilding", glyph: "◐" },
  moved: { text: "Something moved", glyph: "▲" },
};

/** Sample status per scene, deterministic from the name. Mostly open. */
function sceneStatus(name: string): SceneStatus {
  const r = hashString(name) % 10;
  return r < 7 ? "open" : r < 9 ? "rebuilding" : "moved";
}

function Scenes() {
  return (
    <section className="sec" id="scenes" aria-labelledby="scenes-h">
      <SectionHead
        id="scenes-h"
        code="03"
        title="Scene report"
        note="Every scene on the trail, by zone. Statuses here are sample data until the crew posts real ones."
      />
      <div className="zones">
        {business.scenes.map((z) => (
          <div key={z.zone} className="panel zone">
            <header className="tile-h">
              <span className="lbl">{z.zone}</span>
              <span className="tag tag-sample">SAMPLE</span>
            </header>
            <ul className="scene-list">
              {z.names.map((name) => {
                const s = sceneStatus(name);
                return (
                  <li key={name}>
                    <span>{name}</span>
                    <span className={`pill pill-${s}`}>
                      <span aria-hidden="true">{SCENE_STATUS[s].glyph}</span> {SCENE_STATUS[s].text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const { pricing, ticketUrl } = business;
  return (
    <section className="sec" id="pricing" aria-labelledby="pricing-h">
      <SectionHead id="pricing-h" code="04" title="Rates" note="Posted right here, not behind a ticket vendor." />
      <div className="rates">
        <article className="panel rate rate-hot">
          <header className="tile-h">
            <span className="lbl">Best rate</span>
            <span className="tag tag-accent">Bring a donation</span>
          </header>
          <p className="big">
            <span className="unit unit-lead">$</span>
            {pricing.withDonation}
          </p>
          <p>{pricing.donationNote}</p>
          <a className="btn btn-primary" href={ticketUrl} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
        </article>
        <article className="panel rate">
          <header className="tile-h">
            <span className="lbl">Haunted trail</span>
          </header>
          <p className="big">
            <span className="unit unit-lead">$</span>
            {pricing.trail}
          </p>
          <p>Standard entry. Hayride, trail, tunnels, buildings and corn, all included.</p>
        </article>
        <article className="panel rate">
          <header className="tile-h">
            <span className="lbl">Kids Day</span>
          </header>
          <p className="big">
            <span className="unit unit-lead">$</span>
            {pricing.kidsDay}
          </p>
          <p>{pricing.kidsDayCredit}</p>
        </article>
      </div>
    </section>
  );
}

function KidsDay() {
  const { kidsDay, pricing } = business;
  return (
    <section className="sec" id="kids" aria-labelledby="kids-h">
      <SectionHead id="kids-h" code="05" title="Kids Day" note="The lights-on version. Same trail, zero nightmares." />
      <div className="panel kids">
        <div className="kids-grid">
          <Stat label="Date" value={kidsDay.label} />
          <Stat label="Hours" value={kidsDay.time} />
          <Stat label="Ticket" value={`$${pricing.kidsDay}`} />
          <Stat label="Credit" value={`$${pricing.trail - pricing.withDonation} off tonight`} />
        </div>
        <p>{kidsDay.blurb}</p>
        <p className="muted">{pricing.kidsDayCredit}</p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="lbl">{label}</span>
      <span className="stat-v">{value}</span>
    </div>
  );
}

function Community() {
  const { community, pricing } = business;
  return (
    <section className="sec" id="community" aria-labelledby="community-h">
      <SectionHead id="community-h" code="06" title={community.headline} note="Three neighbors started this to give back. The trail is the excuse." />
      <div className="two">
        <div className="panel">
          <header className="tile-h">
            <span className="lbl">We accept</span>
          </header>
          <ul className="checks">
            {community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="muted">Drop it at the ticket window and pay ${pricing.withDonation} instead of ${pricing.trail}.</p>
        </div>
        <div className="panel">
          <header className="tile-h">
            <span className="lbl">Partners</span>
          </header>
          <ul className="checks">
            {community.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="muted">{business.origin}</p>
        </div>
      </div>
    </section>
  );
}

function Crew() {
  return (
    <section className="sec" id="crew" aria-labelledby="crew-h">
      <SectionHead id="crew-h" code="07" title="Join the Crew" note="Volunteer actors, builders and flashlight-wavers. Unpaid, unforgettable." />
      <div className="two">
        <div className="panel">
          <header className="tile-h">
            <span className="lbl">On the roster</span>
          </header>
          <ul className="crew-list">
            {business.crew.map((c) => (
              <li key={c.name}>
                <strong>{c.name}</strong>
                <span>{c.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel crew-cta">
          <header className="tile-h">
            <span className="lbl">Open positions</span>
            <span className="tag tag-amber">Need actors</span>
          </header>
          <p>
            Scenes need bodies every night. No experience required, just a willingness to stand in the dark and wait for
            the right moment.
          </p>
          <div className="btn-row">
            <a className="btn btn-primary" href="#crew">
              Sign up to volunteer
            </a>
            <a className="btn btn-ghost" href="#crew">
              Already on the crew? Log in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section className="sec" id="faq" aria-labelledby="faq-h">
      <SectionHead id="faq-h" code="08" title="Known issues" note="The questions we get every night, answered once." />
      <ul className="faq">
        {business.faq.map((f, i) => {
          const isOpen = open === i;
          const panelId = `${base}-p${i}`;
          const btnId = `${base}-b${i}`;
          return (
            <li key={f.q} className="panel faq-item">
              <h3>
                <button
                  id={btnId}
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="lbl code">{String(i + 1).padStart(2, "0")}</span>
                  <span>{f.q}</span>
                  <span className="faq-caret" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={btnId} className="faq-a" hidden={!isOpen}>
                <p>{f.a}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Directions() {
  const { address } = business;
  return (
    <section className="sec" id="directions" aria-labelledby="directions-h">
      <SectionHead id="directions-h" code="09" title="Getting here" note="Free parking in the field. Follow the volunteers with flashlights." />
      <div className="two">
        <div className="panel">
          <header className="tile-h">
            <span className="lbl">Address</span>
          </header>
          <p className="addr">
            {address.street}
            <br />
            {address.city}, {address.state} {address.zip}
          </p>
          <a className="btn btn-ghost" href={address.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
        <Placeholder kind="MAP" text={address.full} />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-grid">
        <div>
          <p className="brand">
            <CrowMark />
            <span>{business.name}</span>
          </p>
          <p className="muted">{business.tagline}</p>
          <p className="muted">{business.address.full}</p>
        </div>
        <ul className="foot-links" aria-label="Social links">
          {business.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
          <li>
            <a href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              Tickets
            </a>
          </li>
        </ul>
      </div>
      <p className="lbl foot-note">
        Fog, wait, temp and crow counts on this page are simulated for the concept demo. Replace with live data before launch.
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function Main({ children }: { children: ReactNode }) {
  return <main id="main">{children}</main>;
}

export function App() {
  return (
    <div className="c13">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <Main>
        <Board />
        <Terrain />
        <Nights />
        <Scenes />
        <Pricing />
        <KidsDay />
        <Community />
        <Crew />
        <Faq />
        <Directions />
      </Main>
      <Footer />
      <ConceptBadge number={13} name="Trail Conditions" />
    </div>
  );
}
