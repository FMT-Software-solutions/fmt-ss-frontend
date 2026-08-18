import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  Loader2,
  Send,
  TriangleAlert,
  Wallet,
  Wallet2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { UsageChart, UsageTotals } from '@/components/sms/UsageChart';
import {
  useAlertDryRun,
  useSmsBalances,
  useSmsOverview,
  useSmsTransactions,
  useSmsUsage,
  useSendLowBalanceAlert,
} from '@/hooks/queries/use-sms';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { AlertCandidate } from '@/types/sms';

export function SmsDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useSmsOverview();
  const { data: balances, isLoading: balancesLoading } = useSmsBalances();
  const { data: usage, isLoading: usageLoading } = useSmsUsage();
  const { data: transactions } = useSmsTransactions();
  const { data: dryRun } = useAlertDryRun();
  const sendAlert = useSendLowBalanceAlert();
  const [alertTarget, setAlertTarget] = useState<AlertCandidate | null>(null);

  const main = overview?.mainBalance;
  const lowBalanceRows = (balances?.rows ?? [])
    .filter((row) => row.belowThreshold)
    .sort((a, b) => a.creditBalance - b.creditBalance);

  const candidateFor = (organizationId: string) =>
    dryRun?.candidates.find((candidate) => candidate.organizationId === organizationId);

  return (
    <>
      <PageHeader
        title="SMS"
        description="Arkesel balance, organization credits and usage across every app."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Arkesel SMS balance"
          value={main?.available ? formatNumber(main.smsBalance ?? 0) : 'Unavailable'}
          hint={main?.cashBalance ? `Wallet ${main.cashBalance}` : undefined}
          icon={Wallet}
          loading={overviewLoading}
        />
        <StatCard
          label="Organization credits"
          value={formatNumber(overview?.totalOrgCredits)}
          hint="Owed to customers across all apps"
          icon={Wallet2}
          loading={overviewLoading}
        />
        <StatCard
          label="Coverage"
          value={overview?.coverage != null ? `${Math.round(overview.coverage * 100)}%` : '—'}
          hint={
            overview?.shortfall
              ? `${formatNumber(overview.shortfall)} credits short`
              : 'Balance covers outstanding credits'
          }
          icon={TriangleAlert}
          loading={overviewLoading}
          className={cn(overview?.shortfall ? 'border-amber-500/50' : undefined)}
        />
        <StatCard
          label="Low-balance organizations"
          value={formatNumber(overview?.lowBalanceOrganizations)}
          hint={overview ? `Below ${overview.threshold} credits` : undefined}
          icon={BellRing}
          loading={overviewLoading}
        />
      </div>

      {overview?.shortfall ? (
        <Card className="mt-4 border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Arkesel balance does not cover outstanding credits</CardTitle>
            <CardDescription>
              Customers hold {formatNumber(overview.totalOrgCredits)} credits but the Arkesel
              account only has {formatNumber(main?.smsBalance ?? 0)} SMS. If everyone sent at once,{' '}
              {formatNumber(overview.shortfall)} messages would fail. Top up Arkesel to close the
              gap.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {dryRun?.alertsUnavailable && (
        <Card className="mt-4 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">Alert history unavailable</CardTitle>
            <CardDescription>
              Run <code className="font-mono text-xs">supabase_migrations/20260817_sms_balance_alerts.sql</code>{' '}
              in the main project. Until then alerts can be sent but repeat-send cooldowns will not
              work.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Credit activity (30 days)</CardTitle>
            {usage && <UsageTotals totals={usage.totals} />}
          </CardHeader>
          <CardContent>
            {usageLoading ? <Skeleton className="h-40 w-full" /> : <UsageChart series={usage?.series ?? []} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By app</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overviewLoading && <Skeleton className="h-24 w-full" />}
            {overview?.byApp.map((app) => (
              <div key={app.appId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{app.appName}</span>
                  <span className="tabular-nums">{formatNumber(app.credits)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{app.organizations} organizations</span>
                  {app.lowBalanceOrganizations > 0 && (
                    <span className="text-amber-600">{app.lowBalanceOrganizations} low</span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${overview.totalOrgCredits ? (app.credits / overview.totalOrgCredits) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Organizations below {overview?.threshold ?? 20} credits</CardTitle>
          <CardDescription>
            The daily sweep messages these owners automatically; send one now if it is urgent.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {balancesLoading ? (
            <Skeleton className="m-6 h-32" />
          ) : lowBalanceRows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead className="w-40">App</TableHead>
                  <TableHead className="w-28 text-right">Credits</TableHead>
                  <TableHead className="w-36">Phone</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowBalanceRows.map((row) => {
                  const candidate = candidateFor(row.organizationId);
                  return (
                    <TableRow key={`${row.appId}-${row.organizationId}`}>
                      <TableCell>
                        <Link
                          to={`/organizations/${row.appId}/${row.organizationId}`}
                          className="font-medium hover:underline"
                        >
                          {row.organizationName ?? row.organizationId}
                        </Link>
                        <p className="text-xs text-muted-foreground">{row.organizationEmail ?? '—'}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.appName}</TableCell>
                      <TableCell className="text-right tabular-nums text-destructive">
                        {formatNumber(row.creditBalance)}
                      </TableCell>
                      <TableCell>
                        {row.organizationPhone ?? (
                          <Badge variant="outline" className="text-muted-foreground">
                            none
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!row.organizationPhone || sendAlert.isPending}
                            onClick={() =>
                              setAlertTarget(
                                candidate ?? {
                                  ...row,
                                  contactable: Boolean(row.organizationPhone),
                                  inCooldown: false,
                                  wouldAlert: Boolean(row.organizationPhone),
                                },
                              )
                            }
                          >
                            {sendAlert.isPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Send className="size-3.5" />
                            )}
                            Alert
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Every organization is above the threshold" />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Recent credit movements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">App</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="w-28 text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-44">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={`${transaction.appId}-${transaction.id}`}>
                    <TableCell className="text-muted-foreground">{transaction.appName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right tabular-nums',
                        transaction.amount < 0 ? 'text-destructive' : 'text-emerald-600',
                      )}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {formatNumber(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description ?? '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No credit movements yet" />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(alertTarget)}
        onOpenChange={(open) => !open && setAlertTarget(null)}
        title="Send a low-balance SMS?"
        description={
          alertTarget
            ? `${alertTarget.organizationName ?? 'This organization'} will receive a text at ${alertTarget.organizationPhone} telling them they have ${alertTarget.creditBalance} credits left. This uses one of your Arkesel SMS.`
            : undefined
        }
        confirmLabel="Send SMS"
        onConfirm={() => {
          if (!alertTarget) return;
          sendAlert.mutate({
            appId: alertTarget.appId,
            organizationId: alertTarget.organizationId,
          });
        }}
      />
    </>
  );
}
