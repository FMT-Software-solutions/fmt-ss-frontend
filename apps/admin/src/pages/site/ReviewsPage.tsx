import { useState } from 'react';
import { Check, Star, X } from 'lucide-react';
import { Button, Badge, cn } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useListParams } from '@/hooks/use-list-params';
import { useReviews, useUpdateReview } from '@/hooks/queries/use-site-data';
import { formatDate, truncate } from '@/lib/format';
import type { Review } from '@/types/site';

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'size-3.5',
            index < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams({
    status: 'pending',
  });
  const { data, isLoading, error } = useReviews(queryParams);
  const updateReview = useUpdateReview();
  const [rejecting, setRejecting] = useState<Review | null>(null);

  const columns: DataTableColumn<Review>[] = [
    {
      key: 'name',
      header: 'Reviewer',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[row.position, row.company].filter(Boolean).join(', ') || row.email}
          </p>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Review',
      cell: (row) => <span className="text-muted-foreground">{truncate(row.content, 60)}</span>,
    },
    { key: 'rating', header: 'Rating', className: 'w-28', cell: (row) => <Rating value={row.rating} /> },
    {
      key: 'type',
      header: 'Type',
      className: 'w-28',
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.type === 'app-specific' ? 'App' : 'General'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-32',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <StatusBadge status={row.status} />
          {row.is_featured && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
        </div>
      ),
    },
    { key: 'created_at', header: 'Received', className: 'w-32', cell: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      header: '',
      className: 'w-52',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.status !== 'approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateReview.mutate({ id: row.id, status: 'approved' })}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              variant={row.is_featured ? 'secondary' : 'outline'}
              onClick={() => updateReview.mutate({ id: row.id, is_featured: !row.is_featured })}
            >
              <Star className={cn('size-3.5', row.is_featured && 'fill-current')} />
              {row.is_featured ? 'Unfeature' : 'Feature'}
            </Button>
          )}
          {row.status !== 'rejected' && (
            <Button size="sm" variant="ghost" onClick={() => setRejecting(row)}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve reviews and choose which appear on the website."
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
        searchPlaceholder="Search reviewer or content…"
        emptyTitle="No reviews"
        emptyDescription="Nothing matches this filter."
        toolbar={
          <>
            <FilterSelect
              value={filters.status}
              onChange={(value) => setFilter('status', value)}
              placeholder="Status"
              allLabel="All statuses"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <FilterSelect
              value={filters.type}
              onChange={(value) => setFilter('type', value)}
              placeholder="Type"
              allLabel="All types"
              options={[
                { value: 'general', label: 'General' },
                { value: 'app-specific', label: 'App specific' },
              ]}
            />
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this review?"
        description={
          rejecting
            ? `${rejecting.name}'s review will be hidden from the website.`
            : undefined
        }
        confirmLabel="Reject"
        destructive
        onConfirm={() => {
          if (rejecting) updateReview.mutate({ id: rejecting.id, status: 'rejected' });
        }}
      />
    </>
  );
}
