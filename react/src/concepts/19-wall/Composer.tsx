import { useId, useState, type FormEvent } from "react";
import { business } from "@/data/business";
import { isFear, isNightId, isSceneName, MAX_CHARS, NIGHTS, type Fear, type NightId, type SceneName } from "./notes";
import { Skulls } from "./Skulls";
import type { NewScream } from "./useWall";

const FEAR_WORDS: Record<Fear, string> = {
  1: "Cute",
  2: "Jumpy",
  3: "Sweaty",
  4: "Screaming",
  5: "Never again (going again)",
};

/** "Leave your scream": a 120-character note with scene, fear rating and night. */
export function Composer({ onSubmit }: { onSubmit: (s: NewScream) => void }) {
  const id = useId();
  const [text, setText] = useState("");
  const [scene, setScene] = useState<SceneName>(business.scenes[1].names[4]);
  const [fear, setFear] = useState<Fear>(4);
  const [night, setNight] = useState<NightId>(NIGHTS[0].id);
  const [pinned, setPinned] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const canSubmit = text.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ text: text.trim().slice(0, MAX_CHARS), scene, fear, night });
    setText("");
    setPinned(true);
  };

  return (
    <form className="composer" onSubmit={submit} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="panel-h">
        Leave your scream
      </h2>
      <p className="panel-sub">Anonymous. {MAX_CHARS} characters. One line about the moment you lost it.</p>

      <label className="lbl" htmlFor={`${id}-text`}>
        Your note
      </label>
      <textarea
        id={`${id}-text`}
        className="note-input"
        value={text}
        maxLength={MAX_CHARS}
        rows={3}
        placeholder="I held a stranger's hand in the Tunnel…"
        onChange={(e) => {
          setText(e.target.value);
          setPinned(false);
        }}
        aria-describedby={`${id}-count`}
        required
      />
      <p id={`${id}-count`} className={`count ${remaining <= 15 ? "low" : ""}`} aria-live="polite">
        {remaining} left
      </p>

      <div className="composer-row">
        <div>
          <label className="lbl" htmlFor={`${id}-scene`}>
            Where it happened
          </label>
          <select id={`${id}-scene`} value={scene} onChange={(e) => isSceneName(e.target.value) && setScene(e.target.value)}>
            {business.scenes.map((z) => (
              <optgroup key={z.zone} label={z.zone}>
                {z.names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="lbl" htmlFor={`${id}-night`}>
            Which night
          </label>
          <select id={`${id}-night`} value={night} onChange={(e) => isNightId(e.target.value) && setNight(e.target.value)}>
            {NIGHTS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="lbl" htmlFor={`${id}-fear`}>
        Fear rating: <span className="fear-word">{FEAR_WORDS[fear]}</span>
      </label>
      <div className="fear-row">
        <input
          id={`${id}-fear`}
          type="range"
          min={1}
          max={5}
          step={1}
          value={fear}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (isFear(v)) setFear(v);
          }}
          aria-valuetext={`${fear} of 5 skulls, ${FEAR_WORDS[fear]}`}
        />
        <Skulls fear={fear} size="lg" />
      </div>

      <button type="submit" className="btn btn-orange btn-block" disabled={!canSubmit}>
        Pin it to the wall
      </button>
      <p className="demo-note" role="status">
        {pinned ? "Pinned at the top with a “you” badge. " : ""}
        Demo — saved on this device only.
      </p>
    </form>
  );
}
