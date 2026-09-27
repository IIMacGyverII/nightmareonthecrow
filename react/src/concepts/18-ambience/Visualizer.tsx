import { useEffect, useRef } from "react";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  reduced: boolean;
}

const ORANGE = "#ff6a00";
const BARS = 48;

/**
 * Canvas spectrum bars + oscilloscope trace behind the mixer. DPR capped at 2,
 * paused when the tab is hidden, and fully static (fixed bars) under reduced
 * motion or when nothing is playing.
 */
export function Visualizer({ analyser, reduced }: VisualizerProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Deterministic "idle" bar heights so the static frame looks like a paused analyser. */
    const idleHeight = (i: number) => 0.08 + 0.12 * Math.abs(Math.sin(i * 1.7)) + 0.05 * Math.abs(Math.cos(i * 0.4));

    const drawBars = (heights: (i: number) => number, alpha: number) => {
      const gap = 3;
      const bw = (width - gap * (BARS - 1)) / BARS;
      ctx.fillStyle = ORANGE;
      for (let i = 0; i < BARS; i++) {
        const h = Math.max(2, heights(i) * height * 0.9);
        ctx.globalAlpha = alpha * (0.25 + 0.75 * (1 - i / BARS));
        ctx.fillRect(i * (bw + gap), height - h, bw, h);
      }
      ctx.globalAlpha = 1;
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let y = height / 4; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
        ctx.stroke();
      }
    };

    const drawStatic = () => {
      drawGrid();
      drawBars(idleHeight, 0.35);
      ctx.strokeStyle = "rgba(255,106,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2 + 0.5);
      ctx.lineTo(width, height / 2 + 0.5);
      ctx.stroke();
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (!analyser || reduced) drawStatic();
    });
    ro.observe(canvas);

    if (!analyser || reduced) {
      drawStatic();
      return () => ro.disconnect();
    }

    const freq = new Uint8Array(analyser.frequencyBinCount);
    const wave = new Uint8Array(analyser.fftSize);
    let raf = 0;

    const frame = () => {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(wave);
      drawGrid();
      // Spectrum: average bins into BARS buckets, weighted toward the low end where the ambience lives.
      const usable = Math.floor(freq.length * 0.5);
      drawBars((i) => {
        const from = Math.floor((i / BARS) * usable);
        const to = Math.max(from + 1, Math.floor(((i + 1) / BARS) * usable));
        let sum = 0;
        for (let k = from; k < to; k++) sum += freq[k];
        return sum / (to - from) / 255;
      }, 0.9);
      // Oscilloscope trace.
      ctx.strokeStyle = "rgba(255,170,90,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const step = width / wave.length;
      for (let i = 0; i < wave.length; i++) {
        const y = (wave[i] / 255) * height;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", run);
      ro.disconnect();
    };
  }, [analyser, reduced]);

  return <canvas ref={ref} className="viz" aria-hidden="true" />;
}
