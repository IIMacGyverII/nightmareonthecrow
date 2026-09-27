import { useEffect, useRef, type CSSProperties } from "react";
import { readLevel } from "./audio";

interface MeterProps {
  analyser: AnalyserNode | null;
  /** When true, the meter updates a few times a second instead of every frame. */
  reduced: boolean;
  label: string;
}

const SEGMENTS = 12;

/**
 * A small segmented LED level meter. Reads an AnalyserNode on a rAF loop
 * (or a slow interval under reduced motion) and lights segments via a CSS
 * custom property on the element, so React never re-renders per frame.
 */
export function Meter({ analyser, reduced, label }: MeterProps) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (!analyser) {
      node.style.setProperty("--lit", "0");
      return;
    }
    const scratch = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let interval = 0;
    let smoothed = 0;
    const paint = () => {
      const level = readLevel(analyser, scratch);
      smoothed = level > smoothed ? level : smoothed * 0.85 + level * 0.15; // fast attack, slow release
      node.style.setProperty("--lit", String(Math.round(smoothed * SEGMENTS)));
    };
    const loop = () => {
      paint();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      stop();
      if (document.hidden) return;
      if (reduced) interval = window.setInterval(paint, 250);
      else raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", run);
      node.style.setProperty("--lit", "0");
    };
  }, [analyser, reduced]);

  return (
    <div className="meter" ref={el} role="img" aria-label={`${label} level meter`}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} className="meter__seg" style={{ "--i": SEGMENTS - i } as CSSProperties} />
      ))}
    </div>
  );
}
