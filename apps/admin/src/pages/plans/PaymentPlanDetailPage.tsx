import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Copy, Loader2, Mail, MessageSquare, Send } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@repo/ui';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RecordPaymentDialog } from '@/components/payment-plans/RecordPaymentDialog';
import { usePlan, usePlanStatusAction, useSendPlanLink } from '@/hooks/queries/use-payment-plans';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { contactLabel } from '@/lib/plan-schedule';

type Confirm = 'suspend' | 'reinstate' | 'cancel' | null;

export function PaymentPlanDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading } = usePlan(id);
  const send = useSendPlanLink(id);
  const statusAction = usePlanStatusAction(id);
  const [recording, setRecording] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { plan, position, payments, events } = data;
  const open = !['completed', 'cancelled'].includes(plan.status);
  const customer = plan.billing_details?.organizationName || plan.organization_name || plan.customer_name || 'Customer';

  const deliver = (via: 'email' | 'sms' | 'none') =>
    send.mutate(via, {
      onSuccess: async ({ link, delivered }) => {
        if (via === 'none') {
          await navigator.clipboard.writeText(link).catch(() => undefined);
          toast.success('Link copied');
        } else if (delivered.email || delivered.sms) {
          toast.success(`Link sent by ${via === 'sms' ? 'SMS' : 'email'}`);
        } else {
          toast.error(`Could not send by ${via === 'sms' ? 'SMS' : 'email'}. Copy the link instead.`);
        }
      },
    });

  return (
    <>
      <Link to="/plans" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Payment plans
      </Link>
      <PageHeader
        title={customer}
        actions={
          <>
            <StatusBadge status={plan.status} />
            {open && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={send.isPending}>
                    {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {plan.link_sent_at ? 'Resend link' : 'Send link'}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => deliver('email')}>
                    <Mail className="size-4" /> Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deliver('sms')}>
                    <MessageSquare className="size-4" /> SMS
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deliver('none')}>
                    <Copy className="size-4" /> Copy link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {open && plan.status !== 'draft' && <Button onClick={() => setRecording(true)}>Record payment</Button>}
            {open && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More actions">
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {plan.status === 'active' && <DropdownMenuItem onClick={() => setConfirm('suspend')}>Suspend access</DropdownMenuItem>}
                  {plan.status === 'suspended' && <DropdownMenuItem onClick={() => setConfirm('reinstate')}>Reinstate access</DropdownMenuItem>}
                  <DropdownMenuItem className="text-destructive" onClick={() => setConfirm('cancel')}>
                    Cancel plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={formatCurrency(plan.total_amount)} hint={Number(plan.surcharge_percent) > 0 ? `${plan.surcharge_percent}% surcharge` : undefined} />
        <StatCard label="Paid" value={formatCurrency(plan.amount_paid)} />
        <StatCard label="Balance" value={formatCurrency(position.balance)} />
        <StatCard
          label="Due now"
          value={formatCurrency(position.dueNow)}
          hint={position.daysOverdue > 0 ? `${position.daysOverdue} days overdue` : position.next ? `Next ${formatDate(position.next.due_date)}` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {position.rows.map((row) => (
                <div key={row.seq} className="flex items-center justify-between border-t px-6 py-3 text-sm">
                  <div>
                    <p className="font-medium">{row.seq === 0 ? 'Deposit' : `Instalment ${row.seq}`}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(row.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums">
                      {formatCurrency(row.amount)}
                      {row.paid > 0 && row.paid < row.amount && (
                        <span className="text-xs text-muted-foreground"> ({formatCurrency(row.paid)} paid)</span>
                      )}
                    </span>
                    <StatusBadge status={row.status} className="w-24 justify-center" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 && <p className="border-t px-6 py-4 text-sm text-muted-foreground">No payments yet</p>}
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-t px-6 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium tabular-nums">{formatCurrency(payment.amount_paid ?? payment.amount)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="capitalize">{payment.method || payment.provider}</span> ·{' '}
                      {formatDateTime(payment.confirmed_at ?? payment.created_at)}
                      {payment.recorded_by ? ` · ${payment.recorded_by}` : ''}
                      {payment.details?.note ? ` · ${payment.details.note}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="App" value={plan.app_title} />
              <Row label="Contact" value={contactLabel(plan.contact, plan.contact_type)} />
              {plan.customer_name && <Row label="Name" value={plan.customer_name} />}
              {plan.billing_details && (
                <>
                  <Row label="Organization" value={plan.billing_details.organizationName} />
                  <Row label="Email" value={plan.billing_details.organizationEmail} />
                  {plan.billing_details.phoneNumber && <Row label="Phone" value={plan.billing_details.phoneNumber} />}
                </>
              )}
              {plan.organization_id && (
                <Row label="Organization ID" value={<span className="font-mono text-xs">{plan.organization_id}</span>} />
              )}
              <Row label="Grace" value={`${plan.grace_days} days`} />
              {plan.link && (
                <Row
                  label="Link"
                  value={
                    <button className="truncate text-left text-primary underline-offset-2 hover:underline" onClick={() => deliver('none')}>
                      Copy
                    </button>
                  }
                />
              )}
              {plan.notes && <p className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2">{plan.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="text-sm">
                  <p>{event.summary || event.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.created_at)}
                    {event.actor && event.actor !== 'system' ? ` · ${event.actor}` : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordPaymentDialog
        open={recording}
        onOpenChange={setRecording}
        planId={plan.id}
        balance={position.balance}
        suggested={position.dueNow || position.next?.remaining || position.balance}
        needsBillingDetails={!plan.billing_details}
        defaults={{ organizationName: plan.organization_name ?? '', contact: plan.contact, contactType: plan.contact_type, name: plan.customer_name ?? '' }}
      />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(next) => !next && setConfirm(null)}
        title={confirm === 'suspend' ? 'Suspend access?' : confirm === 'reinstate' ? 'Reinstate access?' : 'Cancel this plan?'}
        description={
          confirm === 'suspend'
            ? `${customer} will be locked out of ${plan.app_title} until they pay or you reinstate them.`
            : confirm === 'reinstate'
              ? `${customer} gets access to ${plan.app_title} again.`
              : 'The link stops working and no more reminders are sent. App access is not changed.'
        }
        confirmLabel={confirm === 'suspend' ? 'Suspend' : confirm === 'reinstate' ? 'Reinstate' : 'Cancel plan'}
        destructive={confirm !== 'reinstate'}
        onConfirm={async () => {
          if (confirm) await statusAction.mutateAsync({ action: confirm });
          setConfirm(null);
        }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  );
}
