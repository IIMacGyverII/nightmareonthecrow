/**
 * The interactive centerpiece: a fanned face-down deck, three positions
 * (Past · Present · Your Night), 3D flips, the fate paragraph, reshuffle.
 * All deck state is React state; the last reading is remembered in localStorage.
 */
import { useEffect, useReducer, useState, type CSSProperties } from "react";
import { business } from "@/data/business";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { ALL_IDS, POSITIONS, cardById, composeFate, loadSaved, readingLines, saveReading, shuffle, type Position, type TarotCard } from "./cards";
import { CardBack, Emblem } from "./Art";

interface DeckState {
  /** Card ids still in the fan, in fan order. */
  order: number[];
  /** Card id per position, or null while empty. */
  slots: (number | null)[];
  fateOpen: boolean;
  /** Bumped on every reshuffle so the fan re-animates. */
  shuffleKey: number;
  /** Ids restored from storage: shown face-up with no flip animation. */
  quiet: number[];
  /** True when the initial state came from a remembered reading. */
  remembered: boolean;
}

type Action = { type: "draw"; id: number } | { type: "drawNext" } | { type: "undraw"; slot: number } | { type: "shuffle" } | { type: "fate" };

function init(): DeckState {
  const saved = loadSaved();
  const drawn = saved ? saved.slots.filter((v): v is number => v !== null) : [];
  return {
    order: shuffle(ALL_IDS.filter((id) => !drawn.includes(id))),
    slots: saved ? saved.slots : POSITIONS.map(() => null),
    fateOpen: saved?.fateOpen ?? false,
    shuffleKey: 0,
    quiet: drawn,
    remembered: drawn.length > 0,
  };
}

function reducer(state: DeckState, action: Action): DeckState {
  switch (action.type) {
    case "draw":
    case "drawNext": {
      const slot = state.slots.indexOf(null);
      const id = action.type === "draw" ? action.id : state.order[0];
      if (slot === -1 || id === undefined || !state.order.includes(id)) return state;
      const slots = state.slots.slice();
      slots[slot] = id;
      return { ...state, slots, order: state.order.filter((v) => v !== id), remembered: false };
    }
    case "undraw": {
      const id = state.slots[action.slot];
      if (id === null || id === undefined) return state;
      const slots = state.slots.slice();
      slots[action.slot] = null;
      return { ...state, slots, order: [...state.order, id], fateOpen: false, quiet: state.quiet.filter((v) => v !== id), remembered: false };
    }
    case "shuffle":
      return { order: shuffle(ALL_IDS), slots: POSITIONS.map(() => null), fateOpen: false, shuffleKey: state.shuffleKey + 1, quiet: [], remembered: false };
    case "fate":
      return { ...state, fateOpen: true };
  }
}

export function Deck() {
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [announce, setAnnounce] = useState("");

  const drawnCount = state.slots.filter((v) => v !== null).length;
  const full = drawnCount === POSITIONS.length;
  const nextSlot = state.slots.indexOf(null);
  const nextPosition: Position | null = nextSlot === -1 ? null : POSITIONS[nextSlot];

  // Remember the reading (or forget it once the table is cleared).
  useEffect(() => {
    saveReading({ slots: state.slots, fateOpen: state.fateOpen });
  }, [state.slots, state.fateOpen]);

  const draw = (id: number) => {
    if (nextPosition === null) return;
    dispatch({ type: "draw", id });
    setAnnounce(`${nextPosition}: ${cardById(id).name}.`);
  };

  const fate = full ? composeFate(state.slots as [number, number, number]) : null;

  return (
    <div className={`c14-deck${reduced ? " is-reduced" : ""}`}>
      <p className="c14-deck-hint" aria-live="polite">
        {state.remembered
          ? "The deck remembers your last reading. Draw again to clear the table."
          : nextPosition
            ? `Choose a card for ${nextPosition}. ${drawnCount} of ${POSITIONS.length} drawn.`
            : "Three cards on the table. Read your fate, or put one back."}
      </p>
      <span className="c14-visually-hidden" aria-live="polite">{announce}</span>

      {/* ---- the fan ---- */}
      <div className="c14-fan" key={state.shuffleKey} role="group" aria-label="Face-down deck">
        {state.order.map((id, i, all) => {
          const a = all.length > 1 ? i / (all.length - 1) - 0.5 : 0;
          return (
            <button
              key={id}
              type="button"
              className="c14-fan-card"
              style={{ "--a": a, "--i": i, zIndex: i + 1 } as CSSProperties}
              aria-pressed={false}
              aria-label={`Face-down card ${i + 1} of ${all.length}${nextPosition ? `, draw it for ${nextPosition}` : ""}`}
              aria-disabled={full || undefined}
              onClick={() => draw(id)}
            >
              <span className="c14-fan-in">
                <CardBack className="c14-back-svg" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="c14-deck-tools">
        <button type="button" className="c14-btn ghost small" onClick={() => draw(state.order[0] ?? -1)} disabled={full}>
          Draw the next card
        </button>
        <button type="button" className="c14-btn ghost small" onClick={() => dispatch({ type: "shuffle" })} disabled={drawnCount === 0}>
          Draw again
        </button>
      </div>

      {/* ---- the three positions ---- */}
      <div className="c14-slots">
        {POSITIONS.map((position, slot) => {
          const id = state.slots[slot] ?? null;
          const card = id === null ? null : cardById(id);
          return (
            <div className="c14-slot" key={position}>
              <div className="c14-slot-label">{position}</div>
              {card ? (
                <SlotCard card={card} position={position} quiet={reduced || state.quiet.includes(card.id)} onReturn={() => dispatch({ type: "undraw", slot })} />
              ) : (
                <div className={`c14-slot-empty${nextSlot === slot ? " is-next" : ""}`} aria-hidden="true">
                  <span>?</span>
                </div>
              )}
              {card && (
                <div className="c14-reading">
                  {readingLines(card, position).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- the fate ---- */}
      {full && !state.fateOpen && (
        <div className="c14-fate-cta">
          <button type="button" className="c14-btn" onClick={() => dispatch({ type: "fate" })}>
            Read my fate
          </button>
        </div>
      )}
      {full && state.fateOpen && fate && (
        <div className="c14-fate" role="region" aria-label="Your reading">
          <h3>What the cards say</h3>
          <p className="c14-fate-text">{fate.text}</p>
          <div className="c14-fate-night">
            <span className="c14-chip">{fate.night.label}</span>
            <span className="c14-chip">
              {fate.night.start} – {fate.night.end}
            </span>
            <span className="c14-chip gold">
              ${business.pricing.withDonation} with a donation
            </span>
          </div>
          <div className="c14-fate-actions">
            <a className="c14-btn" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get Tickets for {fate.night.short}
            </a>
            <button type="button" className="c14-btn ghost" onClick={() => dispatch({ type: "shuffle" })}>
              Draw again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SlotCard({ card, position, quiet, onReturn }: { card: TarotCard; position: Position; quiet: boolean; onReturn: () => void }) {
  return (
    <button
      type="button"
      className="c14-slot-card"
      aria-pressed={true}
      aria-label={`${position}: ${card.name}, card ${card.numeral}. Press to return it to the deck.`}
      onClick={onReturn}
    >
      <span className={`c14-card3d${quiet ? " is-static" : ""}`}>
        <span className="c14-back">
          <CardBack className="c14-back-svg" />
        </span>
        <span className="c14-face">
          <span className="c14-face-numeral">{card.numeral}</span>
          <Emblem kind={card.emblem} className="c14-face-emblem" />
          <span className="c14-face-name">{card.name}</span>
          <span className="c14-face-zone">{card.zone}</span>
        </span>
      </span>
    </button>
  );
}
