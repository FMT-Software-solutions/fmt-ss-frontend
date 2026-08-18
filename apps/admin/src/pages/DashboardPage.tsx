import { Link } from 'react-router-dom';
import { Building2, MessageSquare, Quote, Receipt, Send, ShieldAlert, Star, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { useSiteStats } from '@/hooks/queries/use-site-data';
import { useAppSummary } from '@/hooks/queries/use-organizations';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useAuth } from '@/hooks/use-auth';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useSiteStats();
  const { data: summary, isLoading: summaryLoading } = useAppSummary();

  const totals = (summary?.data ?? []).reduce(
    (acc, app) => ({
      organizations: acc.organizations + (app.organizations ?? 0),
      smsCredits: acc.smsCredits + (app.smsCredits ?? 0),
    }),
    { organizations: 0, smsCredits: 0 },
  );
  const summaryErrors = Object.entries(summary?.errors ?? {});

  return (
    <>
      <PageHeader title="Dashboard" description={`Signed in as ${user?.email ?? ''}`} />

      {error && (
        <Card className="mb-6 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base">Could not load statistics</CardTitle>
            <CardDescription>{(error as Error).message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/site/messages">
          <StatCard
            label="Unread messages"
            value={formatNumber(stats?.unreadMessages)}
            icon={MessageSquare}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/site/quotes">
          <StatCard
            label="Open quote requests"
            value={formatNumber(stats?.pendingQuotes)}
            icon={Quote}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/site/reviews">
          <StatCard
            label="Reviews awaiting moderation"
            value={formatNumber(stats?.pendingReviews)}
            icon={Star}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/site/purchases">
          <StatCard
            label="Revenue (30 days)"
            value={formatCurrency(stats?.revenue30d)}
            hint={
              stats ? `${formatNumber(stats.purchases30d)} completed purchases` : undefined
            }
            icon={Receipt}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/site/newsletter">
          <StatCard
            label="Newsletter subscribers"
            value={formatNumber(stats?.subscribers)}
            icon={Users}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/site/issues">
          <StatCard
            label="Open issues"
            value={formatNumber(stats?.openIssues)}
            icon={ShieldAlert}
            loading={isLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <Link to="/organizations">
          <StatCard
            label="Organizations"
            value={formatNumber(totals.organizations)}
            hint={`Across ${summary?.data.length ?? 0} product apps`}
            icon={Building2}
            loading={summaryLoading}
            className="transition-colors hover:border-primary/50"
          />
        </Link>
        <StatCard
          label="Organization SMS credits"
          value={formatNumber(totals.smsCredits)}
          hint="Balance comparison in Phase 6"
          icon={Send}
          loading={summaryLoading}
        />
      </div>

      {summaryErrors.length > 0 && (
        <Card className="mt-6 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">Some apps could not be reached</CardTitle>
            <CardDescription>
              {summaryErrors.map(([appId, message]) => `${appId}: ${message}`).join(' · ')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
}
