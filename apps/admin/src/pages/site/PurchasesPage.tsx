import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import { usePurchaseDetail, usePurchases } from '@/hooks/queries/use-site-data';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Purchase, PurchaseItem } from '@/types/site';

function itemLabel(item: PurchaseItem, index: number) {
  return item.name || item.title || item.productId || `Item ${index + 1}`;
}

export function PurchasesPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();
  const { data, isLoading, error } = usePurchases(queryParams);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: detailLoading } = usePurchaseDetail(selectedId);

  const columns: DataTableColumn<Purchase>[] = [
    {
      key: 'organization',
      header: 'Customer',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.organizations?.name || '—'}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.organizations?.email || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (row) => (
        <span className="font-mono text-xs">{row.payment_reference || row.client_reference}</span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      className: 'w-28',
      cell: (row) => <span className="capitalize">{row.payment_provider || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'w-32 text-right',
      cell: (row) => <span className="tabular-nums">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-32',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Date',
      className: 'w-44',
      cell: (row) => formatDateTime(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader title="Purchases" description="Payments recorded against organizations." />

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
        searchPlaceholder="Search payment reference…"
        onRowClick={(row) => setSelectedId(row.id)}
        emptyTitle="No purchases"
        toolbar={
          <>
            <FilterSelect
              value={filters.status}
              onChange={(value) => setFilter('status', value)}
              placeholder="Status"
              allLabel="All statuses"
              options={[
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
            <FilterSelect
              value={filters.provider}
              onChange={(value) => setFilter('provider', value)}
              placeholder="Provider"
              allLabel="All providers"
              options={[
                { value: 'paystack', label: 'Paystack' },
                { value: 'hubtel', label: 'Hubtel' },
                { value: 'manual', label: 'Manual' },
              ]}
            />
          </>
        }
      />

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase detail</DialogTitle>
            <DialogDescription>
              {detail?.payment_reference ?? 'Loading…'}
            </DialogDescription>
          </DialogHeader>

          {detailLoading && <Skeleton className="h-40 w-full" />}

          {detail && !detailLoading && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Amount</dt>
                  <dd className="font-medium">{formatCurrency(detail.amount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd><StatusBadge status={detail.status} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Provider</dt>
                  <dd className="capitalize">{detail.payment_provider || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Method</dt>
                  <dd className="capitalize">{detail.payment_method || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Organization</dt>
                  <dd>{detail.organizations?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd>{formatDateTime(detail.created_at)}</dd>
                </div>
              </dl>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Items</p>
                <ul className="space-y-1">
                  {(Array.isArray(detail.items) ? detail.items : []).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="truncate">{itemLabel(item, index)}</span>
                      <span className="tabular-nums">{formatCurrency(item.price)}</span>
                    </li>
                  ))}
                  {(!detail.items || detail.items.length === 0) && (
                    <li className="text-muted-foreground">No line items recorded.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
