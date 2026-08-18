import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, TriangleAlert } from 'lucide-react';
import { Badge, Card, cn } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { EmptyState } from '@/components/shared/EmptyState';
import { AppSwitcher } from '@/components/shared/AppSwitcher';
import { useListParams } from '@/hooks/use-list-params';
import { useAppOrganizations, useAppRegistry } from '@/hooks/queries/use-organizations';
import { formatDate, formatNumber } from '@/lib/format';
import type { OrganizationRow } from '@/types/orgs';

export function OrganizationsPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { data: registry, isLoading: registryLoading } = useAppRegistry();
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();

  // No app in the URL: land on the first configured one.
  useEffect(() => {
    if (!appId && registry?.length) {
      const first = registry.find((app) => app.configured) ?? registry[0];
      navigate(`/organizations/${first.id}`, { replace: true });
    }
  }, [appId, registry, navigate]);

  const activeApp = registry?.find((app) => app.id === appId);
  const { data, isLoading, error } = useAppOrganizations(
    activeApp?.configured ? appId : undefined,
    queryParams,
  );

  const columns: DataTableColumn<OrganizationRow>[] = [
    {
      key: 'name',
      header: 'Organization',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name || '—'}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email || '—'}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', className: 'w-36', cell: (row) => row.phone || '—' },
    {
      key: 'members',
      header: 'Members',
      className: 'w-24 text-right',
      cell: (row) => <span className="tabular-nums">{formatNumber(row.memberCount)}</span>,
    },
    {
      key: 'credits',
      header: 'SMS credits',
      className: 'w-28 text-right',
      cell: (row) => (
        <span className={cn('tabular-nums', row.smsCredits < 20 && 'text-destructive')}>
          {formatNumber(row.smsCredits)}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      className: 'w-28',
      cell: (row) =>
        row.has_purchased ? (
          <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            Purchased
          </Badge>
        ) : (
          <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">
            Trial
          </Badge>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-24',
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent',
            row.is_active
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/15 text-red-600 dark:text-red-400',
          )}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Onboarded',
      className: 'w-32',
      cell: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader
        title="Organizations"
        description={
          activeApp
            ? `Organizations onboarded onto ${activeApp.name}.`
            : 'Organizations onboarded onto each product app.'
        }
        actions={
          <AppSwitcher
            apps={registry}
            value={appId}
            loading={registryLoading}
            onChange={(nextAppId) => navigate(`/organizations/${nextAppId}`)}
          />
        }
      />

      {activeApp && !activeApp.configured ? (
        <Card>
          <EmptyState
            icon={TriangleAlert}
            title={`${activeApp.name} is not connected`}
            description="The backend has no Supabase credentials for this app, so its organizations cannot be listed."
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey={(row) => row.id}
          loading={isLoading || registryLoading}
          error={error as Error | null}
          page={page}
          limit={limit}
          total={data?.meta.total ?? 0}
          onPageChange={setPage}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, phone…"
          onRowClick={(row) => navigate(`/organizations/${appId}/${row.id}`)}
          emptyTitle="No organizations"
          emptyDescription={
            activeApp ? `No organizations match this filter in ${activeApp.name}.` : undefined
          }
          toolbar={
            <>
              <FilterSelect
                value={filters.isActive}
                onChange={(value) => setFilter('isActive', value)}
                placeholder="Status"
                allLabel="All statuses"
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
                className="w-36"
              />
              <FilterSelect
                value={filters.hasPurchased}
                onChange={(value) => setFilter('hasPurchased', value)}
                placeholder="Plan"
                allLabel="All plans"
                options={[
                  { value: 'true', label: 'Purchased' },
                  { value: 'false', label: 'Trial' },
                ]}
                className="w-36"
              />
            </>
          }
        />
      )}

      {!registryLoading && !registry?.length && (
        <Card>
          <EmptyState icon={Building2} title="No product apps registered" />
        </Card>
      )}
    </>
  );
}
