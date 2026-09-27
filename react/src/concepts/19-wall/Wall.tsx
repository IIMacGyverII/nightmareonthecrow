import { useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { business } from "@/data/business";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { Composer } from "./Composer";
import { FearIndex } from "./FearIndex";
import { isFear, isNightId, NIGHTS, SCENE_NAMES, WALL_CAP, type Fear, type NightId, type Note, type SceneName } from "./notes";
import { Skull, Skulls } from "./Skulls";
import { useWall } from "./useWall";

type SceneFilter = "all" | SceneName;
type NightFilter = "all" | NightId;
type Sort = "newest" | "scariest";

const nightShort = (id: NightId) => NIGHTS.find((n) => n.id === id)?.short ?? id;

/** One sticky note on the wall. */
function NoteCard({ note }: { note: Note }) {
  const cls = ["note", `tone-${note.tone}`, note.pin ? "pinned" : "taped", note.fresh ? "fresh" : "", note.leaving ? "leaving" : "", note.mine ? "mine" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <li className={cls} style={{ "--rot": `${note.rot}deg` } as CSSProperties}>
      {note.mine && <span className="you">you</span>}
      <p className="note-text">{note.text}</p>
      <div className="note-meta">
        <span className="tag">{note.scene}</span>
        <span className="night">{nightShort(note.night)}</span>
        <Skulls fear={note.fear} />
      </div>
    </li>
  );
}

/** A toggle chip; pressed state is exposed to assistive tech. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`chip ${on ? "on" : ""}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

/** The Scream Wall: filters, sort, composer, fear index and the masonry of notes. */
export function Wall() {
  const id = useId();
  const reduced = useReducedMotion();
  const { notes, addScream, announcement } = useWall(reduced);

  const [scene, setScene] = useState<SceneFilter>("all");
  const [night, setNight] = useState<NightFilter>("all");
  const [minFear, setMinFear] = useState<Fear>(1);
  const [sort, setSort] = useState<Sort>("newest");

  const visible = useMemo(() => {
    const list = notes.filter((n) => (scene === "all" || n.scene === scene) && (night === "all" || n.night === night) && n.fear >= minFear);
    return sort === "newest" ? list.sort((a, b) => b.ts - a.ts) : list.sort((a, b) => b.fear - a.fear || b.ts - a.ts);
  }, [notes, scene, night, minFear, sort]);

  const filtering = scene !== "all" || night !== "all" || minFear > 1;
  const liveCount = notes.filter((n) => !n.leaving).length;

  return (
    <section className="wall-section" aria-labelledby={`${id}-h`} id="wall">
      <div className="wall-head">
        <h2 id={`${id}-h`} className="wall-title">
          The Scream Wall
        </h2>
        <p className="wall-sub">
          Anonymous notes from the trail. New ones land as they come in. <strong className="sample">Sample reactions — demo data.</strong>
        </p>
      </div>

      <div className="wall-grid">
        <aside className="wall-side">
          <Composer onSubmit={addScream} />
          <FearIndex notes={notes} />
        </aside>

        <div className="wall-main" aria-live="polite">
          {/* Throttled announcement for screen readers; the list itself is aria-live="off". */}
          <p className="sr-only" role="status">
            {announcement}
          </p>

          <div className="filters">
            <div className="filter-group" role="group" aria-label="Filter by scene">
              <span className="filter-l">Scene</span>
              <div className="chips">
                <Chip on={scene === "all"} onClick={() => setScene("all")}>
                  All
                </Chip>
                {SCENE_NAMES.map((s) => (
                  <Chip key={s} on={scene === s} onClick={() => setScene(s)}>
                    {s.replace(/^The /, "")}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group" role="group" aria-label="Filter by night">
                <span className="filter-l">Night</span>
                <div className="chips">
                  <Chip on={night === "all"} onClick={() => setNight("all")}>
                    All
                  </Chip>
                  {NIGHTS.map((n) => (
                    <Chip key={n.id} on={night === n.id} onClick={() => isNightId(n.id) && setNight(n.id)}>
                      {n.short}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="filter-group" role="group" aria-label="Minimum fear rating">
                <span className="filter-l">At least</span>
                <div className="chips">
                  {[1, 2, 3, 4, 5].map((f) => (
                    <Chip key={f} on={minFear === f} onClick={() => isFear(f) && setMinFear(f)}>
                      {f} <Skull filled />
                      <span className="sr-only"> skull{f === 1 ? "" : "s"}</span>
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="filter-group" role="group" aria-label="Sort">
                <span className="filter-l">Sort</span>
                <div className="chips seg">
                  <Chip on={sort === "newest"} onClick={() => setSort("newest")}>
                    Newest
                  </Chip>
                  <Chip on={sort === "scariest"} onClick={() => setSort("scariest")}>
                    Scariest
                  </Chip>
                </div>
              </div>
            </div>

            <p className="filter-status">
              Showing {visible.length} of {liveCount} notes{filtering ? " (filtered)" : ""}. The wall keeps the newest {WALL_CAP}.
              {filtering && (
                <>
                  {" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setScene("all");
                      setNight("all");
                      setMinFear(1);
                    }}
                  >
                    Clear filters
                  </button>
                </>
              )}
            </p>
          </div>

          {visible.length === 0 ? (
            <p className="empty">Nobody has screamed about that yet. Loosen the filters, or be the first.</p>
          ) : (
            <ul className="wall" aria-live="off" aria-label="Survivor notes">
              {visible.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </ul>
          )}

          <p className="wall-foot">
            Scenes named here are real. Read about them in <a href="#attractions">what to expect</a>, then{" "}
            <a href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
              get tickets
            </a>{" "}
            and add your own.
          </p>
        </div>
      </div>
    </section>
  );
}
