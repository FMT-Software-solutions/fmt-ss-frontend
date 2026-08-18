import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useListParams } from '@/hooks/use-list-params';
import { useDeleteSubscriber, useSubscribers } from '@/hooks/queries/use-site-data';
import { formatDate } from '@/lib/format';
import type { Subscriber } from '@/types/site';

export function NewsletterPage() {
  const { page, limit, queryParams, setPage, setSearch } = useListParams();
  const { data, isLoading, error } = useSubscribers(queryParams);
  const deleteSubscriber = useDeleteSubscriber();
  const [removing, setRemoving] = useState<Subscriber | null>(null);

  const columns: DataTableColumn<Subscriber>[] = [
    { key: 'email', header: 'Email', cell: (row) => <span className="font-medium">{row.email}</span> },
    {
      key: 'subscribedAt',
      header: 'Subscribed',
      className: 'w-40',
      cell: (row) => formatDate(row.subscribedAt ?? row.created_at),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      cell: (row) => (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => setRemoving(row)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={
          data ? `${data.meta.total} subscriber${data.meta.total === 1 ? '' : 's'}.` : 'Subscriber list.'
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
        searchPlaceholder="Search email…"
        emptyTitle="No subscribers yet"
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this subscriber?"
        description={
          removing ? `${removing.email} will be deleted permanently.` : undefined
        }
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (removing) deleteSubscriber.mutate({ id: removing.id });
        }}
      />
    </>
  );
}
