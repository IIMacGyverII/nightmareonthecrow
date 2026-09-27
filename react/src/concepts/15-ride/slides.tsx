import type { ReactNode } from "react";
import { business } from "@/data/business";
import type { Countdown } from "@/shared/useCountdown";
import { BridgeScene, CornScene, GraveyardScene, RoadScene, TunnelScene, WagonScene } from "./scenes";
import { STOPS, siblingsOf } from "./stops";

interface SlideProps {
  index: number;
  className: string;
  scene: ReactNode;
  children: ReactNode;
}

/** One 100vw x 100vh stop on the ride (stacks vertically on phones). */
export function Slide({ index, className, scene, children }: SlideProps) {
  const stop = STOPS[index];
  return (
    <section className={`c15-slide ${className}`} id={stop.id} data-slide={index} aria-label={`Stop ${index + 1}: ${stop.name}`}>
      {scene}
      <div className="c15-scrim" aria-hidden="true" />
      <div className="c15-panel">{children}</div>
    </section>
  );
}

function Eyebrow({ index }: { index: number }) {
  const stop = STOPS[index];
  return (
    <p className="c15-eyebrow">
      Stop {index + 1} · {stop.eyebrow}
    </p>
  );
}

/** "Also in this zone" chips, straight from business.scenes. */
function ZoneChips({ index }: { index: number }) {
  const stop = STOPS[index];
  const others = siblingsOf(stop.name);
  if (!others.length) return null;
  return (
    <div className="c15-zone">
      <p className="c15-zone__label">Also in {stop.eyebrow}</p>
      <ul className="c15-chips">
        {others.map((n) => (
          <li key={n} className="c15-chip">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RideProps {
  countdown: Countdown;
  horizontal: boolean;
  onGo: (index: number) => void;
}

/** Stops 1–6. Stop 7 (Dawn) lives in Dawn.tsx. */
export function RideSlides({ countdown, horizontal, onGo }: RideProps) {
  const opening = business.season.nights[0];
  return (
    <>
      {/* 1 · Harff Road — the hero */}
      <Slide index={0} className="c15-slide--road c15-slide--hero" scene={<RoadScene />}>
        <Eyebrow index={0} />
        <h1>{business.name}</h1>
        <p className="c15-tagline">{business.tagline}</p>
        <p className="c15-lede">
          Headlights on gravel at the end of {STOPS[0].name}. A tractor idles by the field, the wagon is stacked with hay, and the trail behind it is
          already awake. {business.voice}
        </p>
        <div className="c15-cta">
          <a className="c15-btn c15-btn--primary" href={business.ticketUrl} target="_blank" rel="noreferrer">
            Get Tickets
          </a>
          <button type="button" className="c15-btn c15-btn--ghost" onClick={() => onGo(1)}>
            Take the ride
          </button>
        </div>
        <p className="c15-opening">
          {countdown.done ? (
            <>The wagon is rolling. See you at the field.</>
          ) : (
            <>
              <strong>{countdown.days}</strong> {countdown.days === 1 ? "day" : "days"} until opening night, {opening.label} · {business.season.hours}
            </>
          )}
        </p>
        <p className="c15-hint">
          <span className="c15-hint__arrow" aria-hidden="true">
            {horizontal ? "→" : "↓"}
          </span>
          {horizontal ? "Scroll, swipe or press → to ride" : "Swipe up to ride"}
        </p>
      </Slide>

      {/* 2 · The Wagon — what to expect */}
      <Slide index={1} className="c15-slide--wagon" scene={<WagonScene />}>
        <Eyebrow index={1} />
        <h2>{STOPS[1].name}</h2>
        <p className="c15-lede">
          Find a seat on the hay and hold the rail. The tractor drags you out past the last porch light, and every stop after this one is on foot.
        </p>
        <ul className="c15-stops">
          {business.attractions.map((a) => (
            <li key={a.title}>
              <strong>{a.title}</strong>
              <span>{a.blurb}</span>
            </li>
          ))}
        </ul>
      </Slide>

      {/* 3 · The Bridge */}
      <Slide index={2} className="c15-slide--bridge" scene={<BridgeScene />}>
        <Eyebrow index={2} />
        <h2>{STOPS[2].name}</h2>
        <p className="c15-lede">
          First you cross the water. The boards are older than the haunt, the river is louder than it should be, and whatever is on the far side has been
          waiting for the wagon to stop.
        </p>
        <ZoneChips index={2} />
      </Slide>

      {/* 4 · The Tunnel */}
      <Slide index={3} className="c15-slide--tunnel" scene={<TunnelScene />}>
        <Eyebrow index={3} />
        <h2>{STOPS[3].name}</h2>
        <p className="c15-lede">
          Low, tight and completely dark. Keep a hand on the shoulder in front of you and don't worry about what's behind you. It already knows where you
          are.
        </p>
        <ZoneChips index={3} />
      </Slide>

      {/* 5 · The Corn Field */}
      <Slide index={4} className="c15-slide--corn" scene={<CornScene />}>
        <Eyebrow index={4} />
        <h2>{STOPS[4].name}</h2>
        <p className="c15-lede">
          The stalks are taller than you and the rows don't go where you think they do. Somewhere in here a scarecrow keeps count of who went in and who
          came out.
        </p>
        <ZoneChips index={4} />
      </Slide>

      {/* 6 · The Graveyard */}
      <Slide index={5} className="c15-slide--grave" scene={<GraveyardScene />}>
        <Eyebrow index={5} />
        <h2>{STOPS[5].name}</h2>
        <p className="c15-lede">
          Our set designer's zombie graveyard, where the ground doesn't stay put. The skeleton in the cage has the best seat in the house. Get past the
          fence and you can see the porch light again.
        </p>
        <ZoneChips index={5} />
      </Slide>
    </>
  );
}
