import { useEffect, useRef, useState } from "react";

/**
 * Eases a displayed number toward `target` over `ms`. When motion is reduced
 * (or the tab is hidden) it snaps instead. Always returns a finite number.
 */
export function useCountUp(target: number, reduced: boolean, ms = 420): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (reduced || from === target || document.visibilityState === "hidden") {
      shownRef.current = target;
      setShown(target);
      return;
    }
    let raf = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = t < 1 ? from + (target - from) * eased : target;
      shownRef.current = value;
      setShown(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms]);

  return shown;
}
