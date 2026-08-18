import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@repo/ui';
import { useUpdateOrganization } from '@/hooks/queries/use-organizations';
import type { AppCapabilities, OrganizationDetail } from '@/types/orgs';

interface OrganizationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string | undefined;
  orgId: string | undefined;
  organization: OrganizationDetail['organization'] | undefined;
  capabilities: AppCapabilities | undefined;
}

/** `2026-08-17T00:00:00Z` → `2026-08-17` for a native date input. */
function toDateInput(value: unknown): string {
  if (!value || typeof value !== 'string') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function OrganizationSettingsDialog({
  open,
  onOpenChange,
  appId,
  orgId,
  organization,
  capabilities,
}: OrganizationSettingsDialogProps) {
  const update = useUpdateOrganization(appId, orgId);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    sms_sender_id: '',
    ai_daily_limit: '',
    is_active: true,
    has_purchased: false,
    trial_end_date: '',
  });

  // Refill whenever the dialog opens so it always reflects stored values.
  useEffect(() => {
    if (!open || !organization) return;
    setForm({
      name: String(organization.name ?? ''),
      email: String(organization.email ?? ''),
      phone: String(organization.phone ?? ''),
      address: String(organization.address ?? ''),
      sms_sender_id: String(organization.sms_sender_id ?? ''),
      ai_daily_limit:
        organization.ai_daily_limit === null || organization.ai_daily_limit === undefined
          ? ''
          : String(organization.ai_daily_limit),
      is_active: Boolean(organization.is_active),
      has_purchased: Boolean(organization.has_purchased),
      trial_end_date: toDateInput(organization.trial_end_date),
    });
  }, [open, organization]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Only send what actually changed, so the audit entry stays meaningful.
  const buildPatch = () => {
    const patch: Record<string, unknown> = {};
    const original: Partial<OrganizationDetail['organization']> = organization ?? {};

    if (form.name.trim() && form.name !== String(original.name ?? '')) patch.name = form.name.trim();
    if (form.email.trim() && form.email !== String(original.email ?? '')) patch.email = form.email.trim();
    if (form.phone !== String(original.phone ?? '')) patch.phone = form.phone.trim();
    if (form.address !== String(original.address ?? '')) patch.address = form.address.trim();
    if (form.sms_sender_id !== String(original.sms_sender_id ?? '')) {
      patch.sms_sender_id = form.sms_sender_id.trim();
    }
    if (form.is_active !== Boolean(original.is_active)) patch.is_active = form.is_active;
    if (form.has_purchased !== Boolean(original.has_purchased)) {
      patch.has_purchased = form.has_purchased;
    }
    if (form.trial_end_date !== toDateInput(original.trial_end_date) && form.trial_end_date) {
      patch.trial_end_date = new Date(`${form.trial_end_date}T23:59:59Z`).toISOString();
    }
    if (
      capabilities?.hasAiDailyLimit &&
      form.ai_daily_limit !== '' &&
      Number(form.ai_daily_limit) !== Number(original.ai_daily_limit ?? NaN)
    ) {
      patch.ai_daily_limit = Number(form.ai_daily_limit);
    }

    return patch;
  };

  const patch = open ? buildPatch() : {};
  const changeCount = Object.keys(patch).length;

  return (
    <Dialog open={open} onOpenChange={(next) => !update.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Organization settings</DialogTitle>
          <DialogDescription>
            Changes are written straight to the app's database and recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input id="org-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-email">Email</Label>
              <Input
                id="org-email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">Phone</Label>
              <Input id="org-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-address">Address</Label>
            <Input
              id="org-address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-sender">SMS sender ID</Label>
              <Input
                id="org-sender"
                maxLength={11}
                value={form.sms_sender_id}
                onChange={(e) => set('sms_sender_id', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Max 11 characters, Arkesel approved.</p>
            </div>
            {capabilities?.hasAiDailyLimit && (
              <div className="space-y-2">
                <Label htmlFor="org-ai">AI daily limit</Label>
                <Input
                  id="org-ai"
                  inputMode="numeric"
                  value={form.ai_daily_limit}
                  onChange={(e) => set('ai_daily_limit', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="org-active"
                checked={form.is_active}
                onCheckedChange={(checked) => set('is_active', checked === true)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="org-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Unchecking suspends the organization inside the app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="org-purchased"
                checked={form.has_purchased}
                onCheckedChange={(checked) => set('has_purchased', checked === true)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="org-purchased">Purchased</Label>
                <p className="text-xs text-muted-foreground">
                  Marking as purchased ends the trial; some apps clear the trial date
                  automatically.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-trial">Trial ends</Label>
              <Input
                id="org-trial"
                type="date"
                value={form.trial_end_date}
                disabled={form.has_purchased}
                onChange={(e) => set('trial_end_date', e.target.value)}
              />
              {form.has_purchased && (
                <p className="text-xs text-muted-foreground">
                  Not applicable while the organization is marked as purchased.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Cancel
          </Button>
          <Button
            disabled={changeCount === 0 || update.isPending}
            onClick={() =>
              update.mutate(patch, { onSuccess: () => onOpenChange(false) })
            }
          >
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            {changeCount === 0 ? 'No changes' : `Save ${changeCount} change${changeCount === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
