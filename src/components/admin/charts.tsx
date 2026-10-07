/**
 * Zero-dependency charts. Recharts would need a new install (and this project's
 * network is flaky), and these two shapes cover everything the admin panel shows.
 * Pure server components: no client JS, and they print correctly.
 */

export type Point = { label: string; value: number };

/** Horizontal bars: readable with long course names and on a phone. */
export function BarList({ points, unit = "", max: forcedMax }: { points: Point[]; unit?: string; max?: number }) {
  if (points.length === 0) return <p className="text-muted-foreground">—</p>;
  const max = Math.max(forcedMax ?? 0, ...points.map((p) => p.value), 1);
  return (
    <ul className="space-y-2.5">
      {points.map((p) => {
        const pct = Math.round((p.value / max) * 100);
        return (
          <li key={p.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-semibold">{p.label}</span>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {p.value}{unit}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${p.label}: ${p.value}${unit}`}
              className="h-4 w-full overflow-hidden rounded-full bg-secondary"
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Vertical columns with a value label on top: good for a short daily series. */
export function ColumnChart({ points, unit = "", height = 160 }: { points: Point[]; unit?: string; height?: number }) {
  if (points.length === 0) return <p className="text-muted-foreground">—</p>;
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={points.map((p) => `${p.label}: ${p.value}${unit}`).join(", ")}>
        {points.map((p) => {
          const h = Math.max(2, Math.round((p.value / max) * (height - 28)));
          return (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-bold tabular-nums">{p.value}</span>
              <div className="w-full rounded-t-lg bg-primary" style={{ height: h }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {points.map((p) => (
          <span key={p.label} className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground">{p.label}</span>
        ))}
      </div>
    </div>
  );
}