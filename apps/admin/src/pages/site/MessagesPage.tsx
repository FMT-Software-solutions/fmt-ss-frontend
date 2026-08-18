import { useState } from 'react';
import { Archive, ArchiveRestore, Mail, MailOpen } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import { useMessages, useUpdateMessage } from '@/hooks/queries/use-site-data';
import { formatDateTime, truncate } from '@/lib/format';
import type { Message } from '@/types/site';

export function MessagesPage() {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams({
    state: 'unread',
  });
  const { data, isLoading, error } = useMessages(queryParams);
  const updateMessage = useUpdateMessage();
  const [selected, setSelected] = useState<Message | null>(null);

  const columns: DataTableColumn<Message>[] = [
    {
      key: 'name',
      header: 'From',
      cell: (row) => (
        <div className="min-w-0">
          <p className={row.read_at ? 'truncate' : 'truncate font-medium'}>{row.name || '—'}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      cell: (row) => <span className="text-muted-foreground">{truncate(row.message, 70)}</span>,
    },
    {
      key: 'status',
      header: 'Email',
      className: 'w-28',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Received',
      className: 'w-44',
      cell: (row) => formatDateTime(row.created_at),
    },
  ];

  return (
    <>
      <PageHeader
        title="Messages"
        description="Contact form submissions from the website."
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
        searchPlaceholder="Search name, email or message…"
        onRowClick={(row) => {
          setSelected(row);
          if (!row.read_at) updateMessage.mutate({ id: row.id, read: true });
        }}
        emptyTitle="No messages"
        emptyDescription="Nothing matches this filter yet."
        toolbar={
          <FilterSelect
            value={filters.state}
            onChange={(value) => setFilter('state', value)}
            placeholder="State"
            allLabel="All messages"
            options={[
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        }
      />

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name || 'Message'}</DialogTitle>
                <DialogDescription>
                  {selected.email} · {formatDateTime(selected.created_at)}
                </DialogDescription>
              </DialogHeader>

              <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm">
                {selected.message}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateMessage.mutate(
                      { id: selected.id, read: !selected.read_at },
                      { onSuccess: () => setSelected(null) },
                    )
                  }
                >
                  {selected.read_at ? <Mail /> : <MailOpen />}
                  Mark as {selected.read_at ? 'unread' : 'read'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    updateMessage.mutate(
                      { id: selected.id, archived: !selected.archived_at },
                      { onSuccess: () => setSelected(null) },
                    )
                  }
                >
                  {selected.archived_at ? <ArchiveRestore /> : <Archive />}
                  {selected.archived_at ? 'Restore' : 'Archive'}
                </Button>
                {selected.email && (
                  <Button asChild>
                    <a href={`mailto:${selected.email}`}>Reply by email</a>
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
