import { useState } from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import { useIssues, useUpdateIssue } from '@/hooks/queries/use-site-data';
import { formatDateTime, truncate } from '@/lib/format';
import type { Issue } from '@/types/site';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  high: 'border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400',
  medium: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  low: 'border-transparent bg-muted text-muted-foreground',
};

export function IssuesPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams({
    status: 'open',
  });
  const { data, isLoading, error } = useIssues(queryParams);
  const updateIssue = useUpdateIssue();
  const [selected, setSelected] = useState<Issue | null>(null);

  const columns: DataTableColumn<Issue>[] = [
    {
      key: 'title',
      header: 'Issue',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {truncate(row.error_message ?? row.description, 70)}
          </p>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      className: 'w-28',
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn('capitalize', SEVERITY_STYLES[row.severity?.toLowerCase()] ?? SEVERITY_STYLES.low)}
        >
          {row.severity}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      className: 'w-36',
      cell: (row) => <span className="text-muted-foreground">{row.category}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-32',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Logged',
      className: 'w-44',
      cell: (row) => formatDateTime(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader title="Issues" description="Errors logged by the backend and product apps." />

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={error as Error | null}
        page={page}
        limit={limit}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, error, component…"
        onRowClick={setSelected}
        emptyTitle="No issues"
        emptyDescription="Nothing matches this filter."
        toolbar={
          <FilterSelect
            value={filters.status}
            onChange={(value) => setFilter('status', value)}
            placeholder="Status"
            allLabel="All statuses"
            options={[
              { value: 'open', label: 'Open' },
              { value: 'investigating', label: 'Investigating' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'ignored', label: 'Ignored' },
            ]}
          />
        }
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.category} · {selected.issue_type} · {formatDateTime(selected.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-96 space-y-3 overflow-y-auto text-sm">
                {selected.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}
                {selected.error_message && (
                  <div>
                    <p className="text-xs text-muted-foreground">Error</p>
                    <p className="rounded-md bg-muted p-2 font-mono text-xs">
                      {selected.error_message}
                    </p>
                  </div>
                )}
                {selected.url && (
                  <div>
                    <p className="text-xs text-muted-foreground">Endpoint</p>
                    <p className="font-mono text-xs">{selected.url}</p>
                  </div>
                )}
                {selected.stack_trace && (
                  <div>
                    <p className="text-xs text-muted-foreground">Stack trace</p>
                    <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs">
                      {selected.stack_trace}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.status !== 'resolved' && (
                  <Button
                    onClick={() =>
                      updateIssue.mutate(
                        { id: selected.id, status: 'resolved' },
                        { onSuccess: () => setSelected(null) },
                      )
                    }
                  >
                    Mark resolved
                  </Button>
                )}
                {selected.status !== 'ignored' && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateIssue.mutate(
                        { id: selected.id, status: 'ignored' },
                        { onSuccess: () => setSelected(null) },
                      )
                    }
                  >
                    Ignore
                  </Button>
                )}
                {selected.status !== 'open' && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateIssue.mutate(
                        { id: selected.id, status: 'open' },
                        { onSuccess: () => setSelected(null) },
                      )
                    }
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
