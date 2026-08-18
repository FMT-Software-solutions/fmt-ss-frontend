import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Loader2,
  Mail,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  cn,
} from '@repo/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useListParams } from '@/hooks/use-list-params';
import {
  useCreateProvisioningPurchase,
  usePreflight,
  useProvisionableApps,
  useProvisioningHistory,
  useRunProvisioning,
  useSendConfirmationEmail,
} from '@/hooks/queries/use-provisioning';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { BillingDetails, ManualPurchase, PreflightResult } from '@/types/provisioning';

type Step = 1 | 2 | 3;

const EMPTY_DETAILS: BillingDetails = {
  organizationName: '',
  organizationEmail: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address: { street: '', city: '', state: '', country: 'Ghana', postalCode: '' },
};

export function ProvisioningPage() {
  const [step, setStep] = useState<Step>(1);
  const [details, setDetails] = useState<BillingDetails>(EMPTY_DETAILS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'buy' | 'trial' | 'free'>('buy');
  const [note, setNote] = useState('');
  // The organization's billing email and the owner's login are often
  // different, so the owner email is captured separately.
  const [sameOwnerEmail, setSameOwnerEmail] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [createdPurchaseId, setCreatedPurchaseId] = useState<string | null>(null);
  const [provisioned, setProvisioned] = useState(false);

  const { data: apps, isLoading: appsLoading } = useProvisionableApps();
  const preflightMutation = usePreflight();
  const createPurchase = useCreateProvisioningPurchase();
  const runProvisioning = useRunProvisioning();
  const sendEmail = useSendConfirmationEmail();

  const history = useListParams();
  const { data: historyData, isLoading: historyLoading, error: historyError } =
    useProvisioningHistory(history.queryParams);

  const selectedApps = useMemo(
    () => (apps ?? []).filter((app) => selected[app.productId]),
    [apps, selected],
  );
  const total = useMemo(
    () => (mode === 'buy' ? selectedApps.reduce((sum, app) => sum + (app.price ?? 0), 0) : 0),
    [selectedApps, mode],
  );

  const ownerEmailValid = sameOwnerEmail || /\S+@\S+\.\S+/.test(ownerEmail);
  const detailsValid =
    details.organizationName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(details.organizationEmail) &&
    ownerEmailValid;

  const effectiveOwnerEmail = sameOwnerEmail
    ? details.organizationEmail.trim()
    : ownerEmail.trim();

  const items = selectedApps.map((app) => ({
    productId: app.productId,
    quantity: 1,
    price: mode === 'buy' ? app.price : 0,
    title: app.title,
  }));

  const reset = () => {
    setStep(1);
    setDetails(EMPTY_DETAILS);
    setSelected({});
    setMode('buy');
    setNote('');
    setPreflight(null);
    setCreatedOrgId(null);
    setCreatedPurchaseId(null);
    setProvisioned(false);
    setSameOwnerEmail(true);
    setOwnerEmail('');
  };

  const goToReview = async () => {
    const result = await preflightMutation.mutateAsync({
      email: details.organizationEmail.trim(),
      ownerEmail: sameOwnerEmail ? undefined : effectiveOwnerEmail,
      productIds: selectedApps.map((app) => app.productId),
    });
    setPreflight(result);
    setStep(3);
  };

  const onboard = async () => {
    const purchase = await createPurchase.mutateAsync({
      billingDetails: details,
      items,
      total,
      isExistingOrg: Boolean(preflight?.organization),
      note: note.trim() || undefined,
    });
    setCreatedOrgId(purchase.organizationId);
    setCreatedPurchaseId(purchase.purchase.id);

    const result = await runProvisioning.mutateAsync({
      organizationId: purchase.organizationId,
      purchaseId: purchase.purchase.id,
      billingDetails: details,
      apps: selectedApps.map((app) => ({
        productId: app.productId,
        userEmail: sameOwnerEmail ? undefined : effectiveOwnerEmail,
      })),
      mode,
    });
    setProvisioned(true);

    if (result.summary.failed > 0) {
      toastFailures(result.errors);
    }
  };

  const historyColumns: DataTableColumn<ManualPurchase>[] = [
    {
      key: 'organization',
      header: 'Customer',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.organizations?.name ?? '—'}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.organizations?.email ?? '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Apps',
      cell: (row) => (
        <span className="text-muted-foreground">
          {(row.items ?? []).map((item) => item.title || item.name).filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      className: 'w-44',
      cell: (row) => <span className="font-mono text-xs">{row.client_reference}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'w-28 text-right',
      cell: (row) => <span className="tabular-nums">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-28',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      className: 'w-44',
      cell: (row) => formatDateTime(row.created_at),
    },
  ];

  const busy = createPurchase.isPending || runProvisioning.isPending;

  return (
    <>
      <PageHeader
        title="Provisioning"
        description="Onboard an organization onto one or more apps."
        actions={
          step !== 1 || createdOrgId ? (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-4" />
              Start over
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {([1, 2, 3] as Step[]).map((value) => (
              <div key={value} className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-medium',
                    step === value
                      ? 'bg-primary text-primary-foreground'
                      : step > value
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {step > value ? <Check className="size-3.5" /> : value}
                </span>
                <span className={cn('text-sm', step === value ? 'font-medium' : 'text-muted-foreground')}>
                  {value === 1 ? 'Customer' : value === 2 ? 'Apps' : 'Review'}
                </span>
                {value < 3 && <Separator className="mx-2 w-8" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Organization name" required>
                  <Input
                    value={details.organizationName}
                    onChange={(e) => setDetails({ ...details, organizationName: e.target.value })}
                    placeholder="Acme Printing Ltd"
                  />
                </Field>
                <Field label="Organization email" required>
                  <Input
                    type="email"
                    value={details.organizationEmail}
                    onChange={(e) => setDetails({ ...details, organizationEmail: e.target.value })}
                    placeholder="owner@acme.com"
                  />
                </Field>
                <Field label="Contact first name">
                  <Input
                    value={details.firstName ?? ''}
                    onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
                  />
                </Field>
                <Field label="Contact last name">
                  <Input
                    value={details.lastName ?? ''}
                    onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={details.phoneNumber ?? ''}
                    onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                    placeholder="0244000000"
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={details.address?.city ?? ''}
                    onChange={(e) =>
                      setDetails({ ...details, address: { ...details.address, city: e.target.value } })
                    }
                  />
                </Field>
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="same-owner-email"
                    checked={sameOwnerEmail}
                    onCheckedChange={(checked) => setSameOwnerEmail(checked === true)}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="same-owner-email">
                      Owner signs in with the organization email
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Uncheck when the person who logs in uses a different address from the
                      organization's billing email.
                    </p>
                  </div>
                </div>

                {!sameOwnerEmail && (
                  <Field label="Owner login email" required>
                    <Input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="manager@acme.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      The owner account is created with this address and receives the temporary
                      password.
                    </p>
                  </Field>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                The organization is matched by its email. An existing customer is reused rather than
                duplicated, and keeps the same organization id across every app.
              </p>

              <div className="flex justify-end">
                <Button disabled={!detailsValid} onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-2">
                  <Label>Access type</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Purchase</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="free">Free access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total:{' '}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                {appsLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}

                {apps?.map((app) => (
                  <label
                    key={app.productId}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
                      selected[app.productId] && 'border-primary bg-primary/5',
                      !app.provisioningReady && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <Checkbox
                      checked={Boolean(selected[app.productId])}
                      disabled={!app.provisioningReady}
                      onCheckedChange={(checked) =>
                        setSelected({ ...selected, [app.productId]: checked === true })
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{app.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.provisioningReady
                          ? app.appName
                            ? `Managed app · ${app.appName}`
                            : 'Provisions via its own Supabase project'
                          : 'No provisioning configuration in Sanity'}
                      </p>
                    </div>
                    <span className="tabular-nums text-sm">{formatCurrency(app.price)}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  disabled={selectedApps.length === 0 || preflightMutation.isPending}
                  onClick={() => void goToReview()}
                >
                  {preflightMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  Review
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{details.organizationName}</p>
                  <p className="text-muted-foreground">{details.organizationEmail}</p>
                  {details.phoneNumber && <p className="text-muted-foreground">{details.phoneNumber}</p>}
                  <p className="pt-1 text-xs text-muted-foreground">
                    Owner signs in as{' '}
                    <span className="font-medium text-foreground">{effectiveOwnerEmail}</span>
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-xs text-muted-foreground">Order</p>
                  <p className="font-medium capitalize">
                    {mode === 'buy' ? 'Purchase' : mode} · {formatCurrency(total)}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedApps.map((app) => app.title).join(', ')}
                  </p>
                  {mode !== 'buy' && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      Provisions with a 30-day trial period; adjust the end date afterwards from the
                      organization's settings.
                    </p>
                  )}
                </div>
              </div>

              {preflight && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pre-flight checks</p>
                  {preflight.organization ? (
                    <Notice tone="info">
                      Existing customer <strong>{preflight.organization.name}</strong> will be reused,
                      keeping the same organization id.
                    </Notice>
                  ) : (
                    <Notice tone="ok">New customer — an organization will be created.</Notice>
                  )}
                  {preflight.apps.map((app) => {
                    const warnings: string[] = [];
                    if (app.entitlement) {
                      warnings.push(`already has ${app.entitlement.status} access`);
                    }
                    if (app.existingUserInProductApp) {
                      warnings.push(
                        `${app.existingUserInProductApp.name ?? 'a user'} already has an account in this app`,
                      );
                    }
                    if (app.existingInProductApp) {
                      warnings.push(`an organization already exists in this app`);
                    }
                    return warnings.length ? (
                      <Notice key={app.productId} tone="warn">
                        <strong>{app.title}</strong>: {warnings.join('; ')}. Provisioning will update
                        the existing access rather than create a duplicate.
                      </Notice>
                    ) : (
                      <Notice key={app.productId} tone="ok">
                        <strong>{app.title}</strong>: ready to provision.
                      </Notice>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="prov-note">Internal note (optional)</Label>
                <Input
                  id="prov-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Paid by bank transfer on 12 Aug"
                />
              </div>

              {provisioned ? (
                <div className="space-y-3">
                  <Notice tone="ok">
                    <CircleCheck className="mr-1 inline size-4" />
                    Provisioning complete. The owner has been emailed their login details for each
                    app.
                  </Notice>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        sendEmail.mutate({ organizationDetails: details, items, total })
                      }
                      disabled={sendEmail.isPending}
                    >
                      {sendEmail.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Mail className="size-4" />
                      )}
                      Send purchase confirmation
                    </Button>
                    {createdOrgId && (
                      <Button variant="outline" onClick={reset}>
                        Onboard another customer
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={busy}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button onClick={() => void onboard()} disabled={busy}>
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    <UserPlus className="size-4" />
                    {createPurchase.isPending
                      ? 'Creating purchase…'
                      : runProvisioning.isPending
                        ? 'Provisioning…'
                        : 'Create and provision'}
                  </Button>
                </div>
              )}

              {createdPurchaseId && !provisioned && (
                <Notice tone="warn">
                  The purchase was created but provisioning did not finish. Use “Create and
                  provision” again — the customer will not be duplicated.
                </Notice>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Manual purchases</h2>
          <p className="text-sm text-muted-foreground">
            Customers onboarded from this console.
          </p>
        </div>
        <DataTable
          columns={historyColumns}
          rows={historyData?.data}
          rowKey={(row) => row.id}
          loading={historyLoading}
          error={historyError as Error | null}
          page={history.page}
          limit={history.limit}
          total={historyData?.meta.total ?? 0}
          onPageChange={history.setPage}
          onSearchChange={history.setSearch}
          searchPlaceholder="Search reference…"
          emptyTitle="No manual purchases yet"
        />
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'info';
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        tone === 'ok' && 'border-emerald-500/30 bg-emerald-500/10',
        tone === 'warn' && 'border-amber-500/30 bg-amber-500/10',
        tone === 'info' && 'border-blue-500/30 bg-blue-500/10',
      )}
    >
      {tone === 'warn' && <AlertTriangle className="mr-1 inline size-4 text-amber-600" />}
      {children}
    </div>
  );
}

/** Surfaced individually so a partial failure names the app that failed. */
function toastFailures(errors: { productId: string; error?: string }[]) {
  errors.forEach((failure) =>
    toast.error(`Provisioning failed: ${failure.error ?? failure.productId}`),
  );
}
