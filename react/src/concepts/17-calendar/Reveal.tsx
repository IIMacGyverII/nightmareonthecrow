/** The stage beside the calendar: full content for whichever opened door is selected. */
import { business } from "@/data/business";
import { type Door, type HauntDoor, fireworksOf, longDate, monthName } from "./doors";
import { ArrowIcon, BootIcon, ClockIcon, CrowIcon, FireworkIcon, GiftIcon, MaskIcon, PumpkinIcon, SunIcon, TruckIcon } from "./icons";

export function Reveal({ door }: { door: Door | null }) {
  if (!door) return <EmptyStage />;
  return (
    <div className="c17-reveal" key={door.day} aria-live="polite">
      <p className="c17-reveal-date">
        Door {door.day} · {longDate(door.day)}
      </p>
      <DoorContent door={door} />
    </div>
  );
}

function EmptyStage() {
  return (
    <div className="c17-reveal c17-reveal--empty" aria-live="polite">
      <CrowIcon className="c17-reveal-icon" />
      <h3 className="c17-reveal-title">Pick a door.</h3>
      <p>
        One door a day, all {monthName}. Haunt nights are the red ones. Everything else is a rumor from the trail. Doors you've opened stay open on this
        device.
      </p>
    </div>
  );
}

function DoorContent({ door }: { door: Door }) {
  switch (door.kind) {
    case "haunt":
      return <HauntCard door={door} />;
    case "scene":
      return (
        <>
          <CrowIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">
            Day {door.day}: {door.line}
          </h3>
          <p className="c17-zone">{door.zone}</p>
          <a className="c17-link" href="#trail">
            Find it on the trail <ArrowIcon />
          </a>
        </>
      );
    case "welcome":
      return (
        <>
          <PumpkinIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">{monthName}. The doors are open.</h3>
          <p>
            {business.season.nights.length} haunt nights, one Kids Day, one trail through the woods on the Crow River. {business.tagline}
          </p>
          <a className="c17-btn" href={business.ticketUrl}>
            Get Tickets
          </a>
        </>
      );
    case "donate":
      return (
        <>
          <GiftIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">${business.pricing.withDonation} if you bring something.</h3>
          <p>{business.pricing.donationNote}</p>
          <ul className="c17-list">
            {business.community.accepts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <a className="c17-link" href="#tickets">
            See pricing <ArrowIcon />
          </a>
        </>
      );
    case "crew":
      return (
        <>
          <MaskIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">We need actors.</h3>
          <p>
            Every scare on the trail is a volunteer neighbor in a mask. {business.crew[0].name} plays Beetlejuice. {business.crew[1].name} builds
            the sets. There's a spot in the woods with your name on it.
          </p>
          <a className="c17-link" href="#crew">
            Join the Crew <ArrowIcon />
          </a>
        </>
      );
    case "trail":
      return (
        <>
          <BootIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">Walk the trail.</h3>
          <p>{business.attractions[1].blurb}</p>
          <p className="c17-muted">{business.faq[3].a}</p>
          <a className="c17-link" href="#trail">
            What to expect <ArrowIcon />
          </a>
        </>
      );
    case "food":
      return (
        <>
          <TruckIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">Eat first. Or after.</h3>
          <p>
            {business.foodTrucks.join(" and ")} park on site every haunt night. Nobody screams well on an empty stomach.
          </p>
        </>
      );
    case "halloween":
      return (
        <>
          <PumpkinIcon className="c17-reveal-icon" />
          <h3 className="c17-reveal-title">Halloween. The trail is dark again.</h3>
          <p>
            Thanks for feeding the food shelf and filling the coat bins. The crows keep the woods until next {monthName}.
          </p>
          <p className="c17-muted">{business.voice}</p>
        </>
      );
  }
}

/** Big ticket card for a haunt night; Oct 10 gets the fireworks line and a Kids Day panel. */
function HauntCard({ door }: { door: HauntDoor }) {
  const { night } = door;
  const fireworks = fireworksOf(night);
  return (
    <>
      <div className="c17-ticket">
        <div className="c17-ticket-head">
          <CrowIcon />
          <span>Haunt Night · {night.note}</span>
        </div>
        <div className="c17-ticket-body">
          <p className="c17-ticket-date">{night.label}</p>
          <p className="c17-ticket-hours">
            <ClockIcon /> {night.start} – {night.end}
            <span className="c17-muted"> · last entry {business.season.lastEntry}</span>
          </p>
          {fireworks && (
            <p className="c17-ticket-fireworks">
              <FireworkIcon /> Fireworks at {fireworks}, then the haunt runs {night.start} – {night.end}.
            </p>
          )}
          <p className="c17-ticket-price">
            <strong>${business.pricing.trail}</strong> · <strong className="c17-red">${business.pricing.withDonation}</strong> with a donation
          </p>
          <a className="c17-btn" href={business.ticketUrl}>
            Get Tickets
          </a>
        </div>
        <div className="c17-ticket-stub" aria-hidden="true">
          <span>ADMIT ONE</span>
        </div>
      </div>
      {door.kidsDay && (
        <div className="c17-kids-panel">
          <div className="c17-kids-head">
            <SunIcon />
            <span>Kids Day · same door, daylight</span>
          </div>
          <p>
            <strong>{business.kidsDay.time}</strong> · ${business.pricing.kidsDay}
          </p>
          <p>{business.kidsDay.blurb}</p>
          <p className="c17-muted">{business.pricing.kidsDayCredit}</p>
        </div>
      )}
    </>
  );
}
