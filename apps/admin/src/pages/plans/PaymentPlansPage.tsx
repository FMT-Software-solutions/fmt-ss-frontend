import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Inbox, Plus, Wallet } from 'lucide-react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreatePlanDialog } from '@/components/payment-plans/CreatePlanDialog';
import { useListParams } from '@/hooks/use-list-params';
import { usePlanRequests, usePlans, usePlanSummary, useUpdateRequest } from '@/hooks/queries/use-payment-plans';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { contactLabel } from '@/lib/plan-schedule';
import type { PlanListRow, PlanRequest } from '@/types/payment-plans';

export function PaymentPlansPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = usePlanSummary();
  const [tab, setTab] = useState('plans');
  const [creating, setCreating] = useState<{ request: PlanRequest | null } | null>(null);

  return (
    <>
      <PageHeader
        title="Payment plans"
        actions={
          <Button onClick={() => setCreating({ request: null })}>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New requests" value={summary?.newRequests} icon={Inbox} loading={summaryLoading} />
        <StatCard label="Active plans" value={summary?.active} icon={CalendarClock} loading={summaryLoading} />
        <StatCard label="Overdue" value={summary?.overdue} icon={AlertTriangle} loading={summaryLoading} />
        <StatCard
          label="Outstanding"
          value={summary ? formatCurrency(summary.outstanding) : undefined}
          hint={summary ? `${formatCurrency(summary.dueNow)} due now` : undefined}
          icon={Wallet}
          loading={summaryLoading}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="requests">
            Requests{summary?.newRequests ? ` (${summary.newRequests})` : ''}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plans">
          <PlansTable onOpen={(id) => navigate(`/plans/${id}`)} />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsTable onCreatePlan={(request) => setCreating({ request })} />
        </TabsContent>
      </Tabs>

      <CreatePlanDialog
        open={Boolean(creating)}
        onOpenChange={(open) => !open && setCreating(null)}
        request={creating?.request}
        onCreated={(detail) => navigate(`/plans/${detail.plan.id}`)}
      />
    </>
  );
}

function PlansTable({ onOpen }: { onOpen: (id: string) => void }) {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams();
  const { data, isLoading, error } = usePlans(queryParams);

  const columns: DataTableColumn<PlanListRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {row.billing_details?.organizationName || row.organization_name || row.customer_name || '—'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{contactLabel(row.contact, row.contact_type)}</p>
        </div>
      ),
    },
    { key: 'app', header: 'App', className: 'w-36', cell: (row) => row.app_title },
    {
      key: 'paid',
      header: 'Paid',
      className: 'w-44 text-right',
      cell: (row) => (
        <span className="tabular-nums">
          {formatCurrency(row.amount_paid)}
          <span className="text-muted-foreground"> / {formatCurrency(row.total_amount)}</span>
        </span>
      ),
    },
    {
      key: 'next',
      header: 'Next due',
      className: 'w-40',
      cell: (row) =>
        row.status === 'completed' || row.status === 'cancelled' ? (
          '—'
        ) : row.days_overdue > 0 ? (
          <span className="text-destructive">{row.days_overdue}d overdue</span>
        ) : (
          formatDate(row.next_due_date)
        ),
    },
    { key: 'status', header: 'Status', className: 'w-28', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
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
      searchPlaceholder="Search customer, contact or app…"
      onRowClick={(row) => onOpen(row.id)}
      emptyTitle="No payment plans"
      toolbar={
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilter('status', value)}
          placeholder="Status"
          allLabel="All statuses"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'active', label: 'Active' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      }
    />
  );
}

function RequestsTable({ onCreatePlan }: { onCreatePlan: (request: PlanRequest) => void }) {
  const { page, limit, filters, queryParams, setPage, setSearch, setFilter } = useListParams({ status: 'new' });
  const { data, isLoading, error } = usePlanRequests(queryParams);
  const update = useUpdateRequest();
  const navigate = useNavigate();

  const columns: DataTableColumn<PlanRequest>[] = [
    {
      key: 'who',
      header: 'From',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name || row.organization_name || '—'}</p>
          <p className="truncate text-xs text-muted-foreground">
            {contactLabel(row.contact, row.contact_type)}
            {row.name && row.organization_name ? ` · ${row.organization_name}` : ''}
          </p>
          {row.message && <p className="mt-1 line-clamp-2 text-xs">{row.message}</p>}
        </div>
      ),
    },
    { key: 'app', header: 'App', className: 'w-36', cell: (row) => row.app_title ?? '—' },
    { key: 'date', header: 'Received', className: 'w-44', cell: (row) => formatDateTime(row.created_at) },
    { key: 'status', header: 'Status', className: 'w-28', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-52 text-right',
      cell: (row) =>
        row.status === 'new' ? (
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: row.id, status: 'declined' })}>
              Decline
            </Button>
            <Button size="sm" onClick={() => onCreatePlan(row)}>
              Create plan
            </Button>
          </div>
        ) : row.plan_id ? (
          <Button size="sm" variant="outline" onClick={() => navigate(`/plans/${row.plan_id}`)}>
            Open plan
          </Button>
        ) : null,
    },
  ];

  return (
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
      searchPlaceholder="Search name, contact or app…"
      emptyTitle="No requests"
      toolbar={
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilter('status', value)}
          placeholder="Status"
          allLabel="All requests"
          options={[
            { value: 'new', label: 'New' },
            { value: 'planned', label: 'Planned' },
            { value: 'declined', label: 'Declined' },
          ]}
        />
      }
    />
  );
}
