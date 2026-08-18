import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  History,
  Send,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { BrandColorsPreview } from '@/components/shared/BrandColorsPreview';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { AdjustCreditsDialog } from '@/components/organizations/AdjustCreditsDialog';
import { OrganizationSettingsDialog } from '@/components/organizations/OrganizationSettingsDialog';
import { DefaultsCheckDialog } from '@/components/organizations/DefaultsCheckDialog';
import {
  useAuditLog,
  useOrganizationDetail,
  useOrganizationRoles,
  useOrganizationUsers,
  useUpdateMember,
  useAppRegistry,
} from '@/hooks/queries/use-organizations';
import { formatDate, formatDateTime, formatNumber, fullName } from '@/lib/format';
import type { OrganizationMember } from '@/types/orgs';

export function OrganizationDetailPage() {
  const { appId, orgId } = useParams<{ appId: string; orgId: string }>();
  const { data: registry } = useAppRegistry();
  const app = registry?.find((entry) => entry.id === appId);

  const { data: detail, isLoading, error } = useOrganizationDetail(appId, orgId);
  const { data: users, isLoading: usersLoading } = useOrganizationUsers(appId, orgId);
  const capabilities = detail?.capabilities;
  const { data: roles, isLoading: rolesLoading } = useOrganizationRoles(appId, orgId);
  const { data: audit } = useAuditLog(appId, orgId);
  const updateMember = useUpdateMember(appId, orgId);

  const [creditsOpen, setCreditsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memberToToggle, setMemberToToggle] = useState<OrganizationMember | null>(null);
  const [defaultsOpen, setDefaultsOpen] = useState(false);

  const organization = detail?.organization;

  if (error) {
    return (
      <>
        <PageHeader title="Organization" />
        <Card>
          <EmptyState title="Could not load this organization" description={(error as Error).message} />
        </Card>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-3">
        <Link to={`/organizations/${appId}`}>
          <ArrowLeft className="size-4" />
          Back to {app?.name ?? 'organizations'}
        </Link>
      </Button>

      <PageHeader
        title={isLoading ? 'Loading…' : (organization?.name ?? 'Organization')}
        description={[organization?.email, organization?.phone].filter(Boolean).join(' · ')}
        actions={
          organization && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border-transparent',
                  organization.is_active
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400',
                )}
              >
                {organization.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{organization.has_purchased ? 'Purchased' : 'Trial'}</Badge>
              <Button variant="outline" size="sm" onClick={() => setDefaultsOpen(true)}>
                <Wrench className="size-4" />
                Check defaults
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCreditsOpen(true)}>
                <Wallet className="size-4" />
                Adjust credits
              </Button>
              <Button size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="size-4" />
                Settings
              </Button>
            </div>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Members"
          value={formatNumber(users?.meta.total)}
          icon={Users}
          loading={usersLoading}
        />
        <StatCard
          label="SMS credits"
          value={formatNumber(detail?.smsBalance?.credit_balance ?? 0)}
          hint={
            detail?.smsBalance?.bonus_credits_received
              ? `${formatNumber(detail.smsBalance.bonus_credits_received)} bonus received`
              : undefined
          }
          icon={Send}
          loading={isLoading}
        />
        <StatCard
          label="Branches"
          value={formatNumber(detail?.branches.length)}
          icon={Building2}
          loading={isLoading}
        />
        <StatCard
          label={capabilities?.hasDynamicRoles ? 'Roles' : 'Role model'}
          value={
            capabilities?.hasDynamicRoles
              ? formatNumber(roles?.data.length)
              : 'Fixed'
          }
          hint={capabilities?.hasDynamicRoles ? 'Custom roles' : 'Static role list'}
          icon={ShieldCheck}
          loading={isLoading || rolesLoading}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          {capabilities?.hasSubApps && <TabsTrigger value="subapps">Sub-apps</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Currency" value={organization?.currency} />
                    <Detail label="Theme" value={organization?.theme_name} />
                    <Detail label="SMS sender ID" value={organization?.sms_sender_id} />
                    {capabilities?.hasAiDailyLimit && (
                      <Detail label="AI daily limit" value={organization?.ai_daily_limit} />
                    )}
                    <Detail
                      label="Trial ends"
                      value={organization?.trial_end_date ? formatDate(organization.trial_end_date) : '—'}
                    />
                    <Detail label="Onboarded" value={formatDate(organization?.created_at)} />
                    <Detail label="Address" value={organization?.address} className="col-span-2" />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Branding</CardTitle>
                  <CardDescription>
                    Editing lands in Phase 7; this is the organization's current palette.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {organization?.logo && (
                    <img
                      src={String(organization.logo)}
                      alt=""
                      className="h-12 w-auto rounded border bg-muted object-contain p-1"
                    />
                  )}
                  <BrandColorsPreview value={organization?.brand_colors} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">Recent admin actions</CardTitle>
                  </div>
                  <CardDescription>
                    Changes made to this organization from the admin console.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {audit?.unavailable ? (
                    <EmptyState
                      title="Audit log unavailable"
                      description="Run supabase_migrations/20260817_admin_audit_log.sql in the main project to start recording admin actions."
                    />
                  ) : audit?.data.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead className="w-56">By</TableHead>
                          <TableHead className="w-44">When</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audit.data.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <p className="font-medium">{entry.summary ?? entry.action}</p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {entry.action}
                              </p>
                            </TableCell>
                            <TableCell className="truncate">{entry.actor_email ?? '—'}</TableCell>
                            <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState title="No admin actions yet" />
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Branches</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {detail?.branches.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.branches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">{branch.name || '—'}</TableCell>
                            <TableCell>{branch.location || '—'}</TableCell>
                            <TableCell>{branch.contact || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {branch.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState title="No branches" />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="overflow-hidden py-0">
            {usersLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : users?.data.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="w-40">Role</TableHead>
                    <TableHead className="w-36">Phone</TableHead>
                    {capabilities?.membershipFlags?.map((flag) => (
                      <TableHead key={flag} className="w-32">
                        {flag.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Joined</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <p className="font-medium">
                          {fullName(member.firstName, member.lastName)}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.roleName || member.role?.replace(/_/g, ' ') || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.phone || '—'}</TableCell>
                      {capabilities?.membershipFlags?.map((flag) => (
                        <TableCell key={flag}>{member.flags[flag] ? 'Yes' : 'No'}</TableCell>
                      ))}
                      <TableCell>
                        <Badge variant="outline">{member.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMemberToToggle(member)}
                          disabled={updateMember.isPending}
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No members" />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          {rolesLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : roles?.dynamic ? (
            <div className="grid gap-4 md:grid-cols-2">
              {roles.data.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {role.type?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {role.description && <CardDescription>{role.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <PermissionSummary permissions={role.permissions} />
                  </CardContent>
                </Card>
              ))}
              {!roles.data.length && (
                <Card className="md:col-span-2">
                  <EmptyState title="No roles defined" />
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fixed role list</CardTitle>
                <CardDescription>
                  {app?.name} does not use a roles table — membership carries a role value plus
                  per-user overrides.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {roles?.staticRoles.map((role) => (
                  <Badge key={role} variant="outline" className="capitalize">
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sms" className="mt-4">
          <Card className="overflow-hidden py-0">
            {detail?.recentSmsTransactions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="w-28 text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-44">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.recentSmsTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right tabular-nums',
                          transaction.type === 'usage' ? 'text-destructive' : 'text-emerald-600',
                        )}
                      >
                        {transaction.type === 'usage' ? '−' : '+'}
                        {formatNumber(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.description || '—'}
                      </TableCell>
                      <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No SMS activity" />
            )}
          </Card>
        </TabsContent>

        {capabilities?.hasSubApps && (
          <TabsContent value="subapps" className="mt-4">
            <Card className="overflow-hidden py-0">
              {detail?.subApps.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App</TableHead>
                      <TableHead className="w-40">Access levels</TableHead>
                      <TableHead className="w-32">Installed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.subApps.map((subApp) => (
                      <TableRow key={subApp.id}>
                        <TableCell>
                          <p className="font-medium">{subApp.name ?? 'Unknown app'}</p>
                          {subApp.description && (
                            <p className="text-xs text-muted-foreground">{subApp.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Array.isArray(subApp.access_levels)
                            ? subApp.access_levels.join(', ')
                            : '—'}
                        </TableCell>
                        <TableCell>{formatDate(subApp.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No sub-apps installed" />
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AdjustCreditsDialog
        open={creditsOpen}
        onOpenChange={setCreditsOpen}
        appId={appId}
        orgId={orgId}
        organizationName={organization?.name}
        currentBalance={detail?.smsBalance?.credit_balance ?? 0}
      />

      <DefaultsCheckDialog
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        appId={appId}
        orgId={orgId}
        organizationName={organization?.name}
      />

      <OrganizationSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        appId={appId}
        orgId={orgId}
        organization={organization}
        capabilities={capabilities}
      />

      <ConfirmDialog
        open={Boolean(memberToToggle)}
        onOpenChange={(open) => !open && setMemberToToggle(null)}
        title={memberToToggle?.isActive ? 'Deactivate this member?' : 'Activate this member?'}
        description={
          memberToToggle
            ? memberToToggle.isActive
              ? `${memberToToggle.email ?? 'This member'} will lose access to ${organization?.name ?? 'the organization'}.`
              : `${memberToToggle.email ?? 'This member'} will regain access to ${organization?.name ?? 'the organization'}.`
            : undefined
        }
        confirmLabel={memberToToggle?.isActive ? 'Deactivate' : 'Activate'}
        destructive={memberToToggle?.isActive ?? false}
        onConfirm={() => {
          if (!memberToToggle) return;
          updateMember.mutate({
            membershipId: memberToToggle.id,
            is_active: !memberToToggle.isActive,
          });
        }}
      />
    </>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value?: unknown;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate">{value === null || value === undefined || value === '' ? '—' : String(value)}</dd>
    </div>
  );
}

/** Roles store permissions as a module → {enabled, actions[]} map. */
function PermissionSummary({ permissions }: { permissions: unknown }) {
  if (!permissions || typeof permissions !== 'object') {
    return <p className="text-sm text-muted-foreground">No permissions recorded.</p>;
  }

  const entries = Object.entries(permissions as Record<string, { enabled?: boolean }>);
  const enabled = entries.filter(([, value]) => value?.enabled);

  if (!enabled.length) {
    return <p className="text-sm text-muted-foreground">No modules enabled.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {enabled.map(([module]) => (
        <Badge key={module} variant="secondary" className="capitalize">
          {module.replace(/_/g, ' ')}
        </Badge>
      ))}
    </div>
  );
}
