import { cn } from '@repo/ui';
import { formatNumber } from '@/lib/format';
import type { UsagePoint } from '@/types/sms';

/**
 * Small dependency-free bar chart. The dataset is one bar per day over a
 * month, which does not justify pulling in a charting library.
 */
export function UsageChart({ series }: { series: UsagePoint[] }) {
  if (!series.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No credit activity in this period.
      </p>
    );
  }

  const max = Math.max(...series.map((point) => Math.max(point.used, point.purchased)), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-1">
        {series.map((point) => (
          <div
            key={point.date}
            className="group relative flex h-full flex-1 flex-col justify-end gap-0.5"
            title={`${point.date}\nused ${point.used}\npurchased ${point.purchased}\nbonus ${point.bonus}`}
          >
            {point.purchased > 0 && (
              <div
                className="w-full rounded-sm bg-emerald-500/70 transition-colors group-hover:bg-emerald-500"
                style={{ height: `${(point.purchased / max) * 100}%` }}
              />
            )}
            {point.used > 0 && (
              <div
                className="w-full rounded-sm bg-primary/70 transition-colors group-hover:bg-primary"
                style={{ height: `${(point.used / max) * 100}%` }}
              />
            )}
            {point.used === 0 && point.purchased === 0 && (
              <div className="h-0.5 w-full rounded-sm bg-muted" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{series[0]?.date}</span>
        <span className="flex items-center gap-3">
          <Legend className="bg-primary/70" label="Used" />
          <Legend className="bg-emerald-500/70" label="Purchased" />
        </span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-2.5 rounded-sm', className)} />
      {label}
    </span>
  );
}

export function UsageTotals({ totals }: { totals: { used: number; purchased: number; bonus: number } }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <span>
        Used <span className="font-medium tabular-nums">{formatNumber(totals.used)}</span>
      </span>
      <span>
        Purchased <span className="font-medium tabular-nums">{formatNumber(totals.purchased)}</span>
      </span>
      <span>
        Bonus <span className="font-medium tabular-nums">{formatNumber(totals.bonus)}</span>
      </span>
    </div>
  );
}
