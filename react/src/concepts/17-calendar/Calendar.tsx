/** The 31-door month grid: roving-tabindex keyboard nav, flip doors, lock tooltips. */
import { useId, useRef, type KeyboardEvent } from "react";
import { type Door, daysInMonth, fireworksOf, firstWeekday, longDate, monthName, monthShort, peekLabel, season, weekdayNames } from "./doors";
import { CrowIcon, FireworkIcon, GiftIcon, LockIcon, MaskIcon, PumpkinIcon, SunIcon, TruckIcon, BootIcon } from "./icons";

export interface CalendarProps {
  doors: Door[];
  opened: ReadonlySet<number>;
  isLocked: (day: number) => boolean;
  isToday: (day: number) => boolean;
  selected: number | null;
  focusDay: number;
  shakingDay: number | null;
  onActivate: (day: number) => void;
  onFocusDay: (day: number) => void;
}

const KEY_STEPS = new Map<string, number>([
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["ArrowUp", -7],
  ["ArrowDown", 7],
]);

export function Calendar({ doors, opened, isLocked, isToday, selected, focusDay, shakingDay, onActivate, onFocusDay }: CalendarProps) {
  const refs = useRef(new Map<number, HTMLButtonElement>());

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    const step = KEY_STEPS.get(e.key);
    if (step !== undefined) next = Math.min(daysInMonth, Math.max(1, focusDay + step));
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = daysInMonth;
    if (next === null) return;
    e.preventDefault();
    onFocusDay(next);
    refs.current.get(next)?.focus();
  }

  return (
    <div className="c17-grid-wrap">
      <div className="c17-weekdays" aria-hidden="true">
        {weekdayNames.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="c17-grid" role="group" aria-label={`${monthName} ${season.year} doors. Use arrow keys to move, Enter to open.`} onKeyDown={onKeyDown}>
        {doors.map((door) => (
          <DoorCell
            key={door.day}
            door={door}
            open={opened.has(door.day)}
            locked={isLocked(door.day)}
            today={isToday(door.day)}
            selected={selected === door.day}
            focusable={focusDay === door.day}
            shaking={shakingDay === door.day}
            onActivate={onActivate}
            onFocusDay={onFocusDay}
            register={(el) => {
              if (el) refs.current.set(door.day, el);
              else refs.current.delete(door.day);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  door: Door;
  open: boolean;
  locked: boolean;
  today: boolean;
  selected: boolean;
  focusable: boolean;
  shaking: boolean;
  onActivate: (day: number) => void;
  onFocusDay: (day: number) => void;
  register: (el: HTMLButtonElement | null) => void;
}

function DoorCell({ door, open, locked, today, selected, focusable, shaking, onActivate, onFocusDay, register }: CellProps) {
  const tipId = useId();
  const { day } = door;
  const haunt = door.kind === "haunt";
  const kids = haunt && door.kidsDay;
  const cls = [
    "c17-cell",
    open && "is-open",
    locked && "is-locked",
    today && "is-today",
    selected && "is-selected",
    shaking && "is-shaking",
    haunt && "is-haunt",
    kids && "is-kids",
  ]
    .filter(Boolean)
    .join(" ");

  const state = locked ? "locked" : open ? "opened" : "closed";
  const what = haunt ? (kids ? "haunt night and Kids Day" : "haunt night") : "teaser";
  const label = `Door ${day}, ${longDate(day)}, ${what}, ${state}`;

  return (
    <div className={cls} style={day === 1 ? { gridColumnStart: firstWeekday + 1 } : undefined}>
      <button
        ref={register}
        type="button"
        className="c17-door"
        tabIndex={focusable ? 0 : -1}
        aria-label={label}
        aria-expanded={locked ? undefined : open}
        aria-disabled={locked || undefined}
        aria-describedby={locked ? tipId : undefined}
        onClick={() => onActivate(day)}
        onFocus={() => onFocusDay(day)}
      >
        {/* What's under the flap */}
        <span className="c17-under" aria-hidden="true">
          <span className="c17-peek-icon">
            <PeekIcon door={door} />
          </span>
          <span className="c17-peek-label">{peekLabel(door)}</span>
        </span>
        {/* The flap itself: two faces so the back of the door looks like paper too */}
        <span className="c17-flap" aria-hidden="true">
          <span className="c17-face c17-face-front">
            <span className="c17-num">{day}</span>
            {haunt && !locked && <CrowIcon className="c17-mark" />}
            {kids && <SunIcon className="c17-kids-mark" />}
            {locked && <LockIcon className="c17-lock" />}
          </span>
          <span className="c17-face c17-face-back" />
        </span>
      </button>
      {locked && (
        <span className="c17-tip" role="tooltip" id={tipId}>
          Opens {monthShort} {day}
        </span>
      )}
    </div>
  );
}

/** Icon shown under a lifted flap. */
function PeekIcon({ door }: { door: Door }) {
  switch (door.kind) {
    case "haunt":
      return fireworksOf(door.night) ? <FireworkIcon /> : <CrowIcon />;
    case "scene":
      return <CrowIcon />;
    case "welcome":
      return <PumpkinIcon />;
    case "donate":
      return <GiftIcon />;
    case "crew":
      return <MaskIcon />;
    case "trail":
      return <BootIcon />;
    case "food":
      return <TruckIcon />;
    case "halloween":
      return <PumpkinIcon />;
  }
}
