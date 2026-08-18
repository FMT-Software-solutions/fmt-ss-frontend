import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import { useQuotes, useUpdateQuote } from '@/hooks/queries/use-site-data';
import { formatDate, fullName } from '@/lib/format';
import type { Quote } from '@/types/site';

const QUOTE_STATUSES = [
  { value: 'requested', label: 'Requested' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'pending-customer-feedback', label: 'Pending customer' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function QuotesPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();
  const { data, isLoading, error } = useQuotes(queryParams);
  const updateQuote = useUpdateQuote();
  const [selected, setSelected] = useState<Quote | null>(null);

  const columns: DataTableColumn<Quote>[] = [
    {
      key: 'name',
      header: 'Requester',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{fullName(row.first_name, row.last_name)}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'company', header: 'Company', cell: (row) => row.company || '—' },
    { key: 'service_type', header: 'Service', cell: (row) => row.service_type },
    { key: 'budget', header: 'Budget', cell: (row) => row.budget },
    {
      key: 'status',
      header: 'Status',
      className: 'w-40',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Requested',
      className: 'w-32',
      cell: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader title="Quotes" description="Quote requests submitted from the website." />

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
        searchPlaceholder="Search name, email, company…"
        onRowClick={setSelected}
        emptyTitle="No quote requests"
        toolbar={
          <FilterSelect
            value={filters.status}
            onChange={(value) => setFilter('status', value)}
            placeholder="Status"
            allLabel="All statuses"
            options={QUOTE_STATUSES}
            className="w-48"
          />
        }
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{fullName(selected.first_name, selected.last_name)}</DialogTitle>
                <DialogDescription>
                  {selected.email} · {selected.contact_number_1}
                  {selected.contact_number_2 ? ` · ${selected.contact_number_2}` : ''}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Company</dt>
                  <dd>{selected.company || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Service</dt>
                  <dd>{selected.service_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Budget</dt>
                  <dd>{selected.budget}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Requested</dt>
                  <dd>{formatDate(selected.created_at)}</dd>
                </div>
              </dl>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm">
                  {selected.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selected.status}
                  onValueChange={(status) => {
                    updateQuote.mutate({ id: selected.id, status });
                    setSelected({ ...selected, status });
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUOTE_STATUSES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
