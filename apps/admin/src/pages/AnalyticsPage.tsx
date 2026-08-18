import { useState } from 'react';
import { Eye, Globe, MousePointerClick, Users } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAnalyticsReport } from '@/hooks/queries/use-analytics';
import { formatNumber } from '@/lib/format';
import { countryFlag, countryName, type AnalyticsTally } from '@/types/analytics';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAnalyticsReport(days);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Visitors to fmtsoftware.com, where they come from and what they read."
        actions={
          <div className="flex gap-1">
            {RANGES.map((range) => (
              <Button
                key={range.days}
                size="sm"
                variant={days === range.days ? 'default' : 'outline'}
                onClick={() => setDays(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        }
      />

      {data?.unavailable && (
        <Card className="mb-6 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">Analytics tables missing</CardTitle>
            <CardDescription>
              Run{' '}
              <code className="font-mono text-xs">
                supabase_migrations/20260817_website_analytics.sql
              </code>{' '}
              in the main project, then deploy the website so the tracking beacon starts sending
              page views.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page views"
          value={formatNumber(data?.summary.views)}
          icon={Eye}
          loading={isLoading}
        />
        <StatCard
          label="Unique visitors"
          value={formatNumber(data?.summary.uniques)}
          hint="Counted per day, never across days"
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          label="Sessions"
          value={formatNumber(data?.summary.sessions)}
          hint={data ? `${data.summary.viewsPerSession} pages each` : undefined}
          icon={MousePointerClick}
          loading={isLoading}
        />
        <StatCard
          label="Countries"
          value={formatNumber(data?.summary.countries)}
          icon={Globe}
          loading={isLoading}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Traffic</CardTitle>
          <CardDescription>Page views and unique visitors per day.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-44 w-full" />
          ) : (
            <TrafficChart points={data?.timeseries ?? []} />
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TallyCard
          title="Top pages"
          description="Which pages and sections visitors read."
          items={data?.pages}
          loading={isLoading}
          renderKey={(key) => <span className="font-mono text-xs">{key}</span>}
        />
        <TallyCard
          title="Countries"
          description="Where visitors are browsing from."
          items={data?.countries}
          loading={isLoading}
          renderKey={(key) => (
            <span className="flex items-center gap-2">
              <span aria-hidden>{countryFlag(key)}</span>
              {countryName(key)}
            </span>
          )}
        />
        <TallyCard
          title="Referrers"
          description="How visitors arrived."
          items={data?.referrers}
          loading={isLoading}
        />
        <TallyCard
          title="Devices and browsers"
          description="What they are browsing on."
          items={[...(data?.devices ?? []), ...(data?.browsers ?? [])]}
          loading={isLoading}
          renderKey={(key) => <span className="capitalize">{key}</span>}
        />
      </div>
    </>
  );
}

function TrafficChart({ points }: { points: { date: string; views: number; uniques: number }[] }) {
  if (!points.length) {
    return (
      <EmptyState
        title="No page views recorded yet"
        description="Once the website is deployed with the tracking beacon, traffic appears here."
      />
    );
  }

  const max = Math.max(...points.map((point) => point.views), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-1">
        {points.map((point) => (
          <div
            key={point.date}
            className="group relative flex h-full flex-1 flex-col justify-end"
            title={`${point.date}\n${point.views} views\n${point.uniques} unique visitors`}
          >
            <div
              className="w-full rounded-sm bg-primary/25 transition-colors group-hover:bg-primary/40"
              style={{ height: `${(point.views / max) * 100}%` }}
            >
              <div
                className="w-full rounded-sm bg-primary"
                style={{ height: `${point.views ? (point.uniques / point.views) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span className="flex items-center gap-3">
          <Legend className="bg-primary" label="Unique visitors" />
          <Legend className="bg-primary/25" label="Page views" />
        </span>
        <span>{points[points.length - 1]?.date}</span>
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

function TallyCard({
  title,
  description,
  items,
  loading,
  renderKey,
}: {
  title: string;
  description: string;
  items: AnalyticsTally[] | undefined;
  loading?: boolean;
  renderKey?: (key: string) => React.ReactNode;
}) {
  const max = Math.max(...(items ?? []).map((item) => item.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <Skeleton className="h-32 w-full" />}
        {!loading && !items?.length && (
          <p className="py-4 text-center text-sm text-muted-foreground">Nothing recorded yet.</p>
        )}
        {!loading &&
          items?.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {renderKey ? renderKey(item.key) : item.key}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatNumber(item.count)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
