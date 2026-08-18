import { Badge } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import { useTrainingRegistrations } from '@/hooks/queries/use-site-data';
import { formatDate, fullName } from '@/lib/format';
import type { TrainingRegistration } from '@/types/site';

export function TrainingPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();
  const { data, isLoading, error } = useTrainingRegistrations(queryParams);

  const columns: DataTableColumn<TrainingRegistration>[] = [
    {
      key: 'name',
      header: 'Participant',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{fullName(row.first_name, row.last_name)}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', className: 'w-36', cell: (row) => row.phone || '—' },
    { key: 'company', header: 'Company', cell: (row) => row.company || '—' },
    {
      key: 'training_slug',
      header: 'Training',
      cell: (row) => <span className="font-mono text-xs">{row.training_slug}</span>,
    },
    {
      key: 'kind',
      header: 'Kind',
      className: 'w-28',
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.kind}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-32',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Registered',
      className: 'w-32',
      cell: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader
        title="Training"
        description="Standard and custom training registrations, combined."
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(row) => `${row.kind}-${row.id}`}
        loading={isLoading}
        error={error as Error | null}
        page={page}
        limit={limit}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, training…"
        emptyTitle="No registrations"
        toolbar={
          <FilterSelect
            value={filters.status}
            onChange={(value) => setFilter('status', value)}
            placeholder="Status"
            allLabel="All statuses"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        }
      />
    </>
  );
}
