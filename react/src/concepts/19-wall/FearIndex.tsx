import { useId, useMemo } from "react";
import type { Note } from "./notes";

interface SceneStat {
  scene: string;
  avg: number;
  count: number;
}

const MAX_ROWS = 8;

/** Average fear per scene, computed from whatever is on the wall right now. */
export function useFearIndex(notes: Note[]) {
  return useMemo(() => {
    const live = notes.filter((n) => !n.leaving);
    const totals = new Map<string, { sum: number; count: number }>();
    let sum = 0;
    for (const n of live) {
      sum += n.fear;
      const t = totals.get(n.scene) ?? { sum: 0, count: 0 };
      t.sum += n.fear;
      t.count += 1;
      totals.set(n.scene, t);
    }
    const scenes: SceneStat[] = [...totals.entries()]
      .map(([scene, t]) => ({ scene, avg: t.sum / t.count, count: t.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count || a.scene.localeCompare(b.scene));
    return {
      count: live.length,
      avg: live.length ? sum / live.length : 0,
      mostFeared: scenes[0] ?? null,
      scenes: scenes.slice(0, MAX_ROWS),
    };
  }, [notes]);
}

const W = 320;
const ROW = 26;
const LABEL_W = 118;
const PAD_R = 34;
const BAR_H = 10;

/** Fear index panel: headline numbers plus a single-series SVG horizontal bar chart. */
export function FearIndex({ notes }: { notes: Note[] }) {
  const id = useId();
  const { count, avg, mostFeared, scenes } = useFearIndex(notes);
  const plotW = W - LABEL_W - PAD_R;
  const h = scenes.length * ROW + 6;

  return (
    <section className="fear-index" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="panel-h">
        Fear index
      </h2>
      <p className="panel-sub">Live from the {count} notes on the wall.</p>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-n">{avg.toFixed(1)}</span>
          <span className="stat-l">avg skulls / 5</span>
        </div>
        <div className="stat">
          <span className="stat-n stat-scene">{mostFeared ? mostFeared.scene : "—"}</span>
          <span className="stat-l">most feared scene</span>
        </div>
      </div>

      <figure className="chart">
        <figcaption id={`${id}-cap`} className="chart-cap">
          Average fear by scene, top {scenes.length}
        </figcaption>
        <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-labelledby={`${id}-cap`} aria-describedby={`${id}-tbl`} className="bars">
          {/* recessive baseline */}
          <line x1={LABEL_W} y1={2} x2={LABEL_W} y2={h - 2} className="axis" />
          {scenes.map((s, i) => {
            const y = i * ROW + 4;
            const w = Math.max(4, (s.avg / 5) * plotW);
            return (
              <g key={s.scene} className="bar-row">
                <title>{`${s.scene}: ${s.avg.toFixed(1)} of 5 from ${s.count} note${s.count === 1 ? "" : "s"}`}</title>
                {/* hit target larger than the mark */}
                <rect x={0} y={y - 4} width={W} height={ROW} className="hit" />
                <text x={LABEL_W - 8} y={y + BAR_H / 2 + 4} textAnchor="end" className="bar-label">
                  {s.scene.replace(/^The /, "")}
                </text>
                <rect x={LABEL_W} y={y} width={w} height={BAR_H} rx={0} className="bar-base" />
                <rect x={LABEL_W + Math.max(0, w - 6)} y={y} width={Math.min(6, w)} height={BAR_H} rx={3} className="bar-end" />
                <text x={LABEL_W + w + 6} y={y + BAR_H / 2 + 4} className="bar-value">
                  {s.avg.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </figure>

      <details className="chart-table">
        <summary>Table view</summary>
        <table id={`${id}-tbl`}>
          <thead>
            <tr>
              <th scope="col">Scene</th>
              <th scope="col">Avg</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {scenes.map((s) => (
              <tr key={s.scene}>
                <th scope="row">{s.scene}</th>
                <td>{s.avg.toFixed(1)}</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
