/**
 * CONCEPT #15 — THE RIDE
 * The homepage is a horizontal, full-viewport, snap-scrolling hayride. Seven stops:
 * Harff Road → The Wagon → The Bridge → The Tunnel → The Corn Field → The Graveyard → Dawn (info).
 * On phones the stops stack vertically and the document scrolls with native snapping.
 */
import { business } from "@/data/business";
import { ConceptBadge } from "@/shared/ConceptBadge";
import { useCountdown } from "@/shared/useCountdown";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { DawnSlide } from "./Dawn";
import { Lantern } from "./Lantern";
import { Rail } from "./Rail";
import { RideSlides } from "./slides";
import { STOPS } from "./stops";
import { useRide } from "./useRide";
import "./styles.css";

export function App() {
  const reduced = useReducedMotion();
  const countdown = useCountdown(business.season.opensAt);
  const { trackRef, wheelRef, active, horizontal, goTo, step } = useRide(STOPS.length, reduced);

  return (
    <div className={reduced ? "c15 c15--reduced" : "c15"}>
      <Lantern index={active} total={STOPS.length} name={STOPS[active].name} />
      <Rail active={active} stops={STOPS} wheelRef={wheelRef} ticketUrl={business.ticketUrl} onStep={step} onGo={goTo} />

      <main className="c15-track" ref={trackRef} aria-label="The ride">
        <RideSlides countdown={countdown} horizontal={horizontal} onGo={goTo} />
        <DawnSlide countdown={countdown} />
      </main>

      <ConceptBadge number={15} name="The Ride" corner="top-right" />
    </div>
  );
}
