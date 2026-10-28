import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Checkbox } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { DiscountCodeDialog } from '@/components/discounts/DiscountCodeDialog';
import { useListParams } from '@/hooks/use-list-params';
import { useDiscountCodes, useSaveDiscountCode } from '@/hooks/queries/use-discounts';
import { useProvisionableApps } from '@/hooks/queries/use-provisioning';
import { formatCurrency, formatDate } from '@/lib/format';
import type { DiscountCode } from '@/types/discounts';

export function DiscountCodesPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();
  const { data, isLoading, error } = useDiscountCodes(queryParams);
  const { data: apps } = useProvisionableApps();
  const save = useSaveDiscountCode();
  const [editing, setEditing] = useState<{ code: DiscountCode | null } | null>(null);

  const appName = (id: string) => apps?.find((a) => a.productId === id)?.title ?? 'Unknown app';

  const columns: DataTableColumn<DiscountCode>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-mono font-medium">{row.code}</p>
          {row.description && <p className="truncate text-xs text-muted-foreground">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Discount',
      className: 'w-28',
      cell: (row) => (row.value_type === 'percent' ? `${Number(row.value)}%` : formatCurrency(row.value)),
    },
    {
      key: 'apps',
      header: 'Apps',
      className: 'w-44',
      cell: (row) => (
        <span className="line-clamp-2 text-sm">{row.app_ids.length ? row.app_ids.map(appName).join(', ') : 'All apps'}</span>
      ),
    },
    {
      key: 'dates',
      header: 'Valid',
      className: 'w-44',
      cell: (row) =>
        row.starts_at || row.ends_at ? (
          <span className="text-sm">
            {row.starts_at ? formatDate(row.starts_at) : 'Now'} – {row.ends_at ? formatDate(row.ends_at) : 'no end'}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Always</span>
        ),
    },
    {
      key: 'uses',
      header: 'Used',
      className: 'w-32 text-right',
      cell: (row) => (
        <div className="text-right tabular-nums">
          <p>
            {row.uses}
            {row.max_uses ? ` / ${row.max_uses}` : ''}
          </p>
          {row.total_discounted > 0 && <p className="text-xs text-muted-foreground">−{formatCurrency(row.total_discounted)}</p>}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      className: 'w-20',
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.is_active}
            aria-label={row.is_active ? "Turn off" : "Turn on"}
            onCheckedChange={(checked) => save.mutate({ id: row.id, input: { isActive: checked === true } })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Discount codes"
        actions={
          <Button onClick={() => setEditing({ code: null })}>
            <Plus className="size-4" />
            New code
          </Button>
        }
      />
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
        searchPlaceholder="Search codes…"
        onRowClick={(row) => setEditing({ code: row })}
        emptyTitle="No discount codes"
        toolbar={
          <FilterSelect
            value={filters.status}
            onChange={(value) => setFilter('status', value)}
            placeholder="Status"
            allLabel="All codes"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        }
      />
      <DiscountCodeDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} code={editing?.code} />
    </>
  );
}
