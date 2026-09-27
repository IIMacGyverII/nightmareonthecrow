import { useCallback, useEffect, useId, useRef, useState } from "react";
import { business } from "@/data/business";
import { useReducedMotion } from "@/shared/useReducedMotion";
import { AmbienceEngine, CHANNEL_IDS, CHANNEL_META, DEFAULT_MIX, isWebAudioSupported, type ChannelId, type Mix } from "./audio";
import { Knob } from "./Knob";
import { Meter } from "./Meter";
import { Visualizer } from "./Visualizer";

const STORAGE_KEY = "notc18-mix";

/* ---------------------------------------------------------------- presets */
interface Preset {
  name: string;
  blurb: string;
  mix: Mix;
}

const allScenes = business.scenes.flatMap((z) => z.names);
/** Use the real scene name when the owner-approved list has it; otherwise the fallback label. */
const sceneName = (wanted: string, fallback: string) => allScenes.find((n) => n.toLowerCase() === wanted.toLowerCase()) ?? fallback;

const preset = (name: string, blurb: string, levels: Record<ChannelId, number>, fear: number): Preset => ({
  name,
  blurb,
  mix: {
    channels: {
      wind: { on: levels.wind > 0, level: levels.wind },
      crows: { on: levels.crows > 0, level: levels.crows },
      heartbeat: { on: levels.heartbeat > 0, level: levels.heartbeat },
      corn: { on: levels.corn > 0, level: levels.corn },
      fog: { on: levels.fog > 0, level: levels.fog },
    },
    fear,
  },
});

const PRESETS: Preset[] = [
  preset("Parking lot", "Wagon's loading. You can still leave.", { wind: 35, crows: 20, heartbeat: 12, corn: 8, fog: 0 }, 12),
  preset(sceneName("The Tunnel", "The Tunnel"), "Low, tight, black. Your pulse is the only light.", { wind: 8, crows: 0, heartbeat: 75, corn: 0, fog: 65 }, 70),
  preset(sceneName("The Corn Field", "The Corn Field"), "Taller than you. It doesn't want you to leave.", { wind: 40, crows: 45, heartbeat: 35, corn: 90, fog: 20 }, 50),
  preset(sceneName("The Last Woods", "The Last Woods"), "Everything at once. Nobody walks out slow.", { wind: 65, crows: 75, heartbeat: 85, corn: 35, fog: 70 }, 92),
];

/* ---------------------------------------------------------------- storage */
function isMix(v: unknown): v is Mix {
  if (typeof v !== "object" || v === null) return false;
  const m = v as Partial<Mix>;
  if (typeof m.fear !== "number" || typeof m.channels !== "object" || m.channels === null) return false;
  return CHANNEL_IDS.every((id) => {
    const c = (m.channels as Partial<Record<ChannelId, unknown>>)[id];
    return typeof c === "object" && c !== null && typeof (c as { on?: unknown }).on === "boolean" && typeof (c as { level?: unknown }).level === "number";
  });
}
function loadMix(): Mix {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isMix(parsed)) return parsed;
    }
  } catch {
    /* private mode, blocked storage, bad JSON */
  }
  return DEFAULT_MIX;
}
function saveMix(mix: Mix) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mix));
  } catch {
    /* ignore */
  }
}

/* ----------------------------------------------------------------- strip */
interface StripProps {
  id: ChannelId;
  state: Mix["channels"][ChannelId];
  meter: AnalyserNode | null;
  reduced: boolean;
  onToggle(): void;
  onLevel(level: number): void;
}

function ChannelStrip({ id, state, meter, reduced, onToggle, onLevel }: StripProps) {
  const uid = useId();
  const meta = CHANNEL_META[id];
  return (
    <div className={`strip${state.on ? " is-on" : ""}`} data-channel={id}>
      <div className="strip__head">
        <button
          type="button"
          className="led-btn"
          aria-pressed={state.on}
          aria-label={`${meta.label} channel ${state.on ? "on" : "off"}`}
          onClick={onToggle}
        >
          <span className="led" aria-hidden="true" />
        </button>
        <label className="strip__label" htmlFor={uid}>
          {meta.label}
          {meta.fearLinked && (
            <span className="strip__link" title="Scaled by the FEAR knob">
              fear
            </span>
          )}
        </label>
        <span className="strip__readout" aria-hidden="true">
          {String(state.level).padStart(3, "0")}
        </span>
      </div>
      <div className="strip__body">
        <input
          id={uid}
          className="fader"
          type="range"
          min={0}
          max={100}
          step={1}
          value={state.level}
          onChange={(e) => onLevel(Number(e.target.value))}
          aria-valuetext={`${state.level} percent`}
          aria-describedby={`${uid}-hint`}
        />
        <Meter analyser={state.on ? meter : null} reduced={reduced} label={meta.label} />
      </div>
      <p className="strip__hint" id={`${uid}-hint`}>
        {meta.hint}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- mixer */
export function Mixer() {
  const reduced = useReducedMotion();
  const supported = isWebAudioSupported();
  const [mix, setMix] = useState<Mix>(loadMix);
  const [engine, setEngine] = useState<AmbienceEngine | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<AmbienceEngine | null>(null);
  const statusId = useId();

  // Push every mix change into the running graph, and remember it.
  useEffect(() => {
    engineRef.current?.setMix(mix);
    saveMix(mix);
  }, [mix]);

  // Tear the graph down if the component ever unmounts while playing.
  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    [],
  );

  const stop = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
    setEngine(null);
  }, []);

  const play = useCallback(async () => {
    if (engineRef.current || starting) return;
    setStarting(true);
    setError(null);
    try {
      const next = new AmbienceEngine(mix); // created inside the click: allowed to make sound
      engineRef.current = next;
      await next.start();
      if (engineRef.current !== next) return; // stopped while resuming
      setEngine(next);
    } catch {
      engineRef.current?.dispose();
      engineRef.current = null;
      setError("The browser wouldn't open an audio context. Try again, or unmute the tab.");
    } finally {
      setStarting(false);
    }
  }, [mix, starting]);

  const playing = engine !== null;
  const setChannel = (id: ChannelId, patch: Partial<Mix["channels"][ChannelId]>) =>
    setMix((m) => ({ ...m, channels: { ...m.channels, [id]: { ...m.channels[id], ...patch } } }));
  const activePreset = PRESETS.find((p) => JSON.stringify(p.mix) === JSON.stringify(mix))?.name ?? null;

  return (
    <section className="mixer" aria-labelledby="mixer-title">
      <div className="mixer__viz">
        <Visualizer analyser={engine?.analyser ?? null} reduced={reduced} />
      </div>

      <div className="mixer__panel">
        <header className="mixer__head">
          <div>
            <p className="eyebrow">Ambience synthesizer · model NOTC-18</p>
            <h2 id="mixer-title" className="mixer__title">
              Mix the trail before you walk it.
            </h2>
            <p className="mixer__lede">
              Five channels of synthesized dread, built live in your browser. No recordings. Turn up FEAR and hear the heartbeat catch up with you.
            </p>
          </div>
          <div className="transport">
            <button
              type="button"
              className={`play${playing ? " is-playing" : ""}`}
              onClick={playing ? stop : play}
              disabled={!supported || starting}
              aria-describedby={statusId}
            >
              <span className="play__led" aria-hidden="true" />
              <span className="play__label">{starting ? "Starting…" : playing ? "Stop" : "Play"}</span>
            </button>
            <p className="transport__status" id={statusId} role="status" aria-live="polite">
              {!supported
                ? "Web Audio unavailable. The panel is on display only."
                : error
                  ? error
                  : playing
                    ? "Running. Headphones recommended."
                    : "Silent until you press play. Nothing auto-plays."}
            </p>
          </div>
        </header>

        {!supported && (
          <div className="fallback" role="note">
            <strong>No synth in this browser.</strong> Your browser doesn't support the Web Audio API, so the mixer can't make sound here. The controls still work as a preview.
            The real thing is on the trail: {business.season.hours}, four nights in October.
          </div>
        )}

        <div className="presets" role="group" aria-label="Presets">
          <span className="presets__label">Presets</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset"
              aria-pressed={activePreset === p.name}
              onClick={() => setMix(p.mix)}
              title={p.blurb}
            >
              {p.name}
            </button>
          ))}
          <button type="button" className="preset preset--reset" onClick={() => setMix(DEFAULT_MIX)}>
            Reset
          </button>
        </div>

        <div className="mixer__grid">
          <div className="strips">
            {CHANNEL_IDS.map((id) => (
              <ChannelStrip
                key={id}
                id={id}
                state={mix.channels[id]}
                meter={engine?.meterFor(id) ?? null}
                reduced={reduced}
                onToggle={() => setChannel(id, { on: !mix.channels[id].on })}
                onLevel={(level) => setChannel(id, { level })}
              />
            ))}
          </div>
          <div className="master">
            <Knob label="Fear" value={mix.fear} onChange={(fear) => setMix((m) => ({ ...m, fear }))} caption={fearCaption(mix.fear)} />
            <dl className="master__stats">
              <div>
                <dt>Heart</dt>
                <dd>{Math.round(48 + (mix.fear / 100) * 95)} bpm</dd>
              </div>
              <div>
                <dt>Crows</dt>
                <dd>{mix.fear < 34 ? "sparse" : mix.fear < 67 ? "restless" : "swarming"}</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{mix.fear < 34 ? "breeze" : mix.fear < 67 ? "gusting" : "howling"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <footer className="mixer__foot">
          <a className="btn btn--primary" href={business.ticketUrl} target="_blank" rel="noopener noreferrer">
            Get Tickets
          </a>
          <span className="mixer__price">
            ${business.pricing.trail} · <strong>${business.pricing.withDonation} with a donation</strong>
          </span>
        </footer>
      </div>
    </section>
  );
}

function fearCaption(fear: number): string {
  if (fear === 0) return "Daylight";
  if (fear < 25) return "Uneasy";
  if (fear < 50) return "Nervous";
  if (fear < 75) return "Panicking";
  if (fear < 100) return "Running";
  return "Caught";
}
