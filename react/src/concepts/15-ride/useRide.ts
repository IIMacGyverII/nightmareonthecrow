import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Desktop = horizontal ride. Below this the slides stack vertically and the document scrolls. */
const DESKTOP = "(min-width: 900px)";
/** How many full turns the wagon wheel makes over the whole ride. */
const WHEEL_TURNS = 3;

export interface Ride {
  trackRef: RefObject<HTMLDivElement | null>;
  wheelRef: RefObject<SVGGElement | null>;
  /** Index of the slide currently under the viewport centre (React state, from IntersectionObserver). */
  active: number;
  horizontal: boolean;
  goTo: (index: number) => void;
  step: (dir: 1 | -1) => void;
}

/**
 * Drives the ride: which slide is active (state), snap navigation (prev/next/keys/wheel),
 * and the parallax + wheel rotation, which are written straight to the DOM from a
 * requestAnimationFrame so React never re-renders per scroll frame.
 */
export function useRide(count: number, reduced: boolean): Ride {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<SVGGElement | null>(null);
  const [active, setActive] = useState(0);
  const [horizontal, setHorizontal] = useState(() => typeof window !== "undefined" && window.matchMedia(DESKTOP).matches);
  /** Timestamp until which wheel-to-step is ignored, so one gesture = one slide. */
  const wheelLock = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = () => setHorizontal(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const slides = useCallback(() => Array.from(trackRef.current?.children ?? []) as HTMLElement[], []);

  /** Slide nearest the viewport origin, from live geometry, so handlers are never stale. */
  const nearest = useCallback(() => {
    let best = 0;
    let bestDist = Infinity;
    slides().forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(horizontal ? r.left : r.top);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, [slides, horizontal]);

  const goTo = useCallback(
    (index: number) => {
      const el = slides()[Math.max(0, Math.min(count - 1, index))];
      if (!el) return;
      const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
      if (horizontal) trackRef.current?.scrollTo({ left: el.offsetLeft, behavior });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior });
    },
    [slides, count, reduced, horizontal],
  );

  const step = useCallback((dir: 1 | -1) => goTo(nearest() + dir), [goTo, nearest]);

  /* Active slide: whichever slide crosses the centre line of the viewport. A thin
     centre strip (rather than a 50% threshold) also works for the tall Dawn slide. */
  useEffect(() => {
    const list = slides();
    if (!list.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.slide);
          if (!Number.isNaN(i)) setActive(i);
        }
      },
      {
        root: horizontal ? trackRef.current : null,
        rootMargin: horizontal ? "0px -49.5% 0px -49.5%" : "-49.5% 0px -49.5% 0px",
        threshold: 0,
      },
    );
    list.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slides, horizontal, count]);

  /* Parallax + wheel: one rAF per scroll burst, writes CSS vars and an SVG transform. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (reduced) {
      slides().forEach((el) => el.style.removeProperty("--p"));
      wheelRef.current?.removeAttribute("transform");
      return;
    }
    let frame = 0;
    const paint = () => {
      frame = 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (const el of slides()) {
        const r = el.getBoundingClientRect();
        const p = horizontal ? r.left / vw : r.top / vh;
        el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
      }
      const max = horizontal ? track.scrollWidth - track.clientWidth : document.documentElement.scrollHeight - vh;
      const pos = horizontal ? track.scrollLeft : window.scrollY;
      const progress = max > 0 ? Math.max(0, Math.min(1, pos / max)) : 0;
      wheelRef.current?.setAttribute("transform", `rotate(${(progress * 360 * WHEEL_TURNS).toFixed(1)} 20 20)`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [slides, horizontal, reduced]);

  /* Keyboard: ← → step, Home/End jump. Left alone inside form fields. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      switch (e.key) {
        case "ArrowRight":
          step(1);
          break;
        case "ArrowLeft":
          step(-1);
          break;
        case "Home":
          goTo(0);
          break;
        case "End":
          goTo(count - 1);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, goTo, count]);

  /* Desktop mouse wheel: a vertical wheel on a horizontal track would do nothing, so
     one flick = one slide. Inside the Dawn slide's own vertical scroller the wheel
     scrolls the info normally until it hits an end. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !horizontal) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal gesture: let it snap natively
      const now = performance.now();
      if (now < wheelLock.current) {
        e.preventDefault();
        return;
      }
      const scroller = (e.target as Element | null)?.closest<HTMLElement>("[data-vscroll]");
      if (scroller) {
        const canDown = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
        const canUp = scroller.scrollTop > 0;
        if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) return;
      }
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      wheelLock.current = now + 700;
      step(e.deltaY > 0 ? 1 : -1);
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [horizontal, step]);

  return { trackRef, wheelRef, active, horizontal, goTo, step };
}
