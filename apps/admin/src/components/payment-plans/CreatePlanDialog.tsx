import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/ui';
import { useProvisionableApps } from '@/hooks/queries/use-provisioning';
import { useCreatePlan, usePlanQuote } from '@/hooks/queries/use-payment-plans';
import { formatCurrency, formatDate } from '@/lib/format';
import { previewSchedule, totalWithSurcharge } from '@/lib/plan-schedule';
import type { Frequency, PlanDetail, PlanRequest } from '@/types/payment-plans';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: PlanRequest | null;
  onCreated: (detail: PlanDetail) => void;
}

const num = (value: string) => (value.trim() === '' ? NaN : Number(value));

export function CreatePlanDialog({ open, onOpenChange, request, onCreated }: CreatePlanDialogProps) {
  const create = useCreatePlan();
  return (
    <Dialog open={open} onOpenChange={(next) => !create.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New payment plan</DialogTitle>
        </DialogHeader>
        {/* Keyed so the form starts fresh from the request each time it opens. */}
        {open && (
          <PlanForm
            key={request?.id ?? 'new'}
            request={request}
            create={create}
            onCancel={() => onOpenChange(false)}
            onCreated={(detail) => {
              onOpenChange(false);
              onCreated(detail);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlanForm({
  request,
  create,
  onCancel,
  onCreated,
}: {
  request?: PlanRequest | null;
  create: ReturnType<typeof useCreatePlan>;
  onCancel: () => void;
  onCreated: (detail: PlanDetail) => void;
}) {
  const { data: apps } = useProvisionableApps();

  const [appId, setAppId] = useState(request?.app_id ?? '');
  const [contact, setContact] = useState(
    request ? (request.contact_type === 'phone' ? `0${request.contact.slice(3)}` : request.contact) : '',
  );
  const [customerName, setCustomerName] = useState(request?.name ?? '');
  const [organizationName, setOrganizationName] = useState(request?.organization_name ?? '');
  // Empty means "use the app's default" (price and instalment settings in Sanity).
  const [priceInput, setPrice] = useState('');
  const [surchargeInput, setSurcharge] = useState('');
  const [depositInput, setDeposit] = useState('');
  const [countInput, setCount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [graceDays, setGraceDays] = useState('7');
  const [notes, setNotes] = useState('');

  const quote = usePlanQuote(appId || undefined);
  const defaults = quote.data?.defaults ?? { depositPercent: 30, count: 3, surchargePercent: 0 };
  const price = priceInput === '' ? String(quote.data?.price ?? '') : priceInput;
  const surcharge = surchargeInput === '' ? String(defaults.surchargePercent) : surchargeInput;
  const count = countInput === '' ? String(defaults.count) : countInput;
  const total = totalWithSurcharge(num(price) || 0, num(surcharge) || 0);
  const deposit =
    depositInput === '' ? (total > 0 ? String(Math.round((total * defaults.depositPercent) / 100)) : '') : depositInput;

  const schedule = useMemo(
    () => previewSchedule(total, num(deposit), Math.trunc(num(count)), frequency),
    [total, deposit, count, frequency],
  );
  const valid = Boolean(appId) && contact.trim().length >= 5 && schedule.length > 0;

  const submit = () => {
    if (!valid) return;
    create.mutate(
      {
        requestId: request?.id,
        appId,
        contact: contact.trim(),
        customerName: customerName.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        basePrice: num(price),
        surchargePercent: num(surcharge) || 0,
        deposit: num(deposit),
        count: Math.trunc(num(count)),
        frequency,
        graceDays: Math.trunc(num(graceDays)),
        notes: notes.trim() || undefined,
      },
      { onSuccess: onCreated },
    );
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>App</Label>
          <Select value={appId} onValueChange={(value) => { setAppId(value); setPrice(''); setDeposit(''); setSurcharge(''); setCount(''); }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an app" />
            </SelectTrigger>
            <SelectContent>
              {apps?.map((app) => (
                <SelectItem key={app.productId} value={app.productId}>
                  {app.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-contact">Email or phone</Label>
          <Input id="plan-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-name">Customer name</Label>
          <Input id="plan-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="plan-org">Organization</Label>
          <Input id="plan-org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-price">Price (GHS)</Label>
          <Input id="plan-price" type="number" step="any" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-surcharge">Surcharge %</Label>
          <Input id="plan-surcharge" type="number" step="any" min="0" value={surcharge} onChange={(e) => setSurcharge(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-deposit">Deposit (GHS)</Label>
          <Input id="plan-deposit" type="number" step="any" min="1" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="plan-count">Instalments</Label>
            <Input id="plan-count" type="number" min="0" max="36" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Every</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Week</SelectItem>
                <SelectItem value="biweekly">2 weeks</SelectItem>
                <SelectItem value="monthly">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-grace">Grace days</Label>
          <Input id="plan-grace" type="number" min="0" max="60" value={graceDays} onChange={(e) => setGraceDays(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="plan-notes">Notes</Label>
          <Textarea id="plan-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {schedule.length > 0 && (
        <div className="rounded-md border">
          <div className="flex justify-between border-b px-3 py-2 text-sm font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {schedule.map((row) => (
              <div key={row.seq} className="flex justify-between px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">
                  {row.seq === 0 ? 'Deposit' : `#${row.seq}`} · {formatDate(row.due_date)}
                </span>
                <span className="tabular-nums">{formatCurrency(row.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={create.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!valid || create.isPending}>
          {create.isPending && <Loader2 className="size-4 animate-spin" />}
          Create plan
        </Button>
      </DialogFooter>
    </>
  );
}
