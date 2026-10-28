import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Checkbox,
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
} from '@repo/ui';
import { toast } from 'sonner';
import { useProvisionableApps } from '@/hooks/queries/use-provisioning';
import { useSaveDiscountCode } from '@/hooks/queries/use-discounts';
import type { DiscountCode } from '@/types/discounts';

interface DiscountCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this code; omit to create one. */
  code?: DiscountCode | null;
}

export function DiscountCodeDialog({ open, onOpenChange, code }: DiscountCodeDialogProps) {
  const save = useSaveDiscountCode();
  return (
    <Dialog open={open} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{code ? `Edit ${code.code}` : 'New discount code'}</DialogTitle>
        </DialogHeader>
        {open && <CodeForm key={code?.id ?? 'new'} code={code} save={save} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : '');
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);
const optionalNumber = (value: string) => (value.trim() === '' ? null : Number(value));

function CodeForm({
  code,
  save,
  onDone,
}: {
  code?: DiscountCode | null;
  save: ReturnType<typeof useSaveDiscountCode>;
  onDone: () => void;
}) {
  const { data: apps } = useProvisionableApps();
  const [name, setName] = useState(code?.code ?? '');
  const [description, setDescription] = useState(code?.description ?? '');
  const [valueType, setValueType] = useState<'percent' | 'fixed'>(code?.value_type ?? 'percent');
  const [value, setValue] = useState(code ? String(code.value) : '');
  const [appIds, setAppIds] = useState<string[]>(code?.app_ids ?? []);
  const [minTotal, setMinTotal] = useState(code?.min_total != null ? String(code.min_total) : '');
  const [maxDiscount, setMaxDiscount] = useState(code?.max_discount != null ? String(code.max_discount) : '');
  const [startsAt, setStartsAt] = useState(toLocalInput(code?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(code?.ends_at ?? null));
  const [maxUses, setMaxUses] = useState(code?.max_uses != null ? String(code.max_uses) : '');
  const [perCustomer, setPerCustomer] = useState(String(code?.per_customer_limit ?? 1));
  const [firstPurchaseOnly, setFirstPurchaseOnly] = useState(code?.first_purchase_only ?? false);

  const numeric = Number(value);
  const valid =
    /^[A-Za-z0-9_-]{2,40}$/.test(name.trim()) && numeric > 0 && (valueType === 'fixed' || numeric <= 100);

  const submit = () =>
    save.mutate(
      {
        id: code?.id,
        input: {
          code: name.trim().toUpperCase(),
          description: description.trim() || undefined,
          valueType,
          value: numeric,
          appIds,
          minTotal: optionalNumber(minTotal),
          maxDiscount: valueType === 'percent' ? optionalNumber(maxDiscount) : null,
          startsAt: fromLocalInput(startsAt),
          endsAt: fromLocalInput(endsAt),
          maxUses: optionalNumber(maxUses),
          perCustomerLimit: Math.max(1, Math.trunc(Number(perCustomer) || 1)),
          firstPurchaseOnly,
        },
      },
      {
        onSuccess: () => {
          toast.success(code ? 'Code updated' : 'Code created');
          onDone();
        },
      },
    );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dc-code">Code</Label>
          <Input id="dc-code" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="LAUNCH20" />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="space-y-2">
            <Label htmlFor="dc-value">Discount</Label>
            <Input id="dc-value" type="number" step="any" min="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Select value={valueType} onValueChange={(v) => setValueType(v as 'percent' | 'fixed')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="fixed">GHS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="dc-description">Note</Label>
          <Input id="dc-description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Apps</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-md border p-3">
            {apps?.map((app) => (
              <label key={app.productId} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={appIds.includes(app.productId)}
                  onCheckedChange={(checked) =>
                    setAppIds((ids) => (checked ? [...ids, app.productId] : ids.filter((id) => id !== app.productId)))
                  }
                />
                {app.title}
              </label>
            ))}
            {!appIds.length && <span className="text-xs text-muted-foreground">None ticked = every app</span>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dc-min">Minimum order (GHS)</Label>
          <Input id="dc-min" type="number" step="any" min="0" value={minTotal} onChange={(e) => setMinTotal(e.target.value)} />
        </div>
        {valueType === 'percent' && (
          <div className="space-y-2">
            <Label htmlFor="dc-max">Max discount (GHS)</Label>
            <Input id="dc-max" type="number" step="any" min="0.01" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="dc-start">Starts</Label>
          <Input id="dc-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dc-end">Ends</Label>
          <Input id="dc-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dc-uses">Total uses</Label>
          <Input id="dc-uses" type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dc-per">Uses per customer</Label>
          <Input id="dc-per" type="number" min="1" value={perCustomer} onChange={(e) => setPerCustomer(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <Checkbox checked={firstPurchaseOnly} onCheckedChange={(checked) => setFirstPurchaseOnly(checked === true)} />
          First purchase only
        </label>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!valid || save.isPending}>
          {save.isPending && <Loader2 className="size-4 animate-spin" />}
          {code ? 'Save' : 'Create code'}
        </Button>
      </DialogFooter>
    </>
  );
}
