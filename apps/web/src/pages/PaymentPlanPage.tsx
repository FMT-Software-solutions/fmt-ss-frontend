import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaystackPayment } from "react-paystack";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from "@repo/ui";
import { Form } from "@/components/ui/form";
import { OrganizationDetailsForm } from "@/components/checkout/OrganizationDetailsForm";
import { BillingAddressForm } from "@/components/checkout/BillingAddressForm";
import { checkoutSchema, type CheckoutFormData } from "@/lib/checkout-schema";
import { PlanApiError, planApi, planSession, type CustomerPlan } from "@/lib/payment-plan";

const ghs = (n: number) => `GHS ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const STATUS_TONE: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  due: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  overdue: "bg-red-500/15 text-red-700 dark:text-red-400",
  upcoming: "bg-muted text-muted-foreground",
};

/**
 * A customer's payment plan, opened from the link we send. Verify with a
 * code, accept with organization details, then pay what's due; payments are
 * confirmed by the server with Paystack/Hubtel before they count.
 */
export default function PaymentPlanPage() {
  const { token = "" } = useParams<{ token: string }>();
  const [session, setSession] = useState(() => planSession.get(token));

  const summary = useQuery({
    queryKey: ["plan-link", token],
    queryFn: () => planApi.summary(token),
    retry: false,
  });

  const plan = useQuery({
    queryKey: ["plan", token, session],
    queryFn: async () => {
      try {
        return await planApi.plan(token, session);
      } catch (error) {
        if (error instanceof PlanApiError && error.status === 401) {
          planSession.clear(token);
          setSession(null);
        }
        throw error;
      }
    },
    enabled: Boolean(session) && summary.isSuccess,
    retry: false,
  });

  if (summary.isLoading) return <Centered><Loader2 className="h-8 w-8 animate-spin text-primary" /></Centered>;
  if (summary.error) {
    return (
      <Centered>
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">{(summary.error as Error).message}</p>
      </Centered>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{summary.data!.appTitle} payment plan</h1>
      {!session || plan.isError ? (
        <VerifyStep
          token={token}
          maskedContact={summary.data!.maskedContact}
          onVerified={(s) => {
            planSession.set(token, s);
            setSession(s);
          }}
        />
      ) : plan.isLoading || !plan.data ? (
        <Centered><Loader2 className="h-8 w-8 animate-spin text-primary" /></Centered>
      ) : (
        <PlanView token={token} session={session} plan={plan.data} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">{children}</div>;
}

// ---------------------------------------------------------------- verify

function VerifyStep({ token, maskedContact, onVerified }: { token: string; maskedContact: string; onVerified: (session: string) => void }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      await planApi.sendCode(token);
      setSent(true);
      toast.success(`Code sent to ${maskedContact}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { session } = await planApi.verify(token, code);
      onVerified(session);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-4 w-4" /> Verify it's you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">We'll send a 6-digit code to {maskedContact}.</p>
        {sent ? (
          <form onSubmit={verify} className="space-y-3">
            <Label htmlFor="plan-code">Code</Label>
            <Input
              id="plan-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={send} disabled={busy}>
              Send a new code
            </Button>
          </form>
        ) : (
          <Button className="w-full" onClick={send} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------- plan

function PlanView({ token, session, plan }: { token: string; session: string; plan: CustomerPlan }) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["plan", token] });

  return (
    <div className="space-y-6">
      {plan.status === "suspended" && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Access is paused. Pay what's due to restore it.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total" value={ghs(plan.total)} />
        <Stat label="Paid" value={ghs(plan.amountPaid)} />
        <Stat
          label={plan.status === "completed" ? "Balance" : plan.dueNow > 0 ? "Due now" : "Next payment"}
          value={ghs(plan.status === "completed" ? 0 : plan.dueNow > 0 ? plan.dueNow : (plan.next?.remaining ?? 0))}
          hint={
            plan.daysOverdue > 0
              ? `${plan.daysOverdue} days overdue`
              : plan.next && plan.status !== "completed" && plan.status !== "sent"
                ? day(plan.next.due_date)
                : undefined
          }
          danger={plan.daysOverdue > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {plan.status === "completed" ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold">Fully paid</p>
              </CardContent>
            </Card>
          ) : !plan.accepted ? (
            <AcceptStep token={token} session={session} plan={plan} onAccepted={refresh} />
          ) : (
            // Keyed on what's paid so the amount resets to the new suggestion after each payment.
            <PayPanel key={plan.amountPaid} token={token} session={session} plan={plan} onPaid={refresh} />
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {plan.schedule.map((row) => (
                <div key={row.seq} className="flex items-center justify-between border-t px-6 py-3 text-sm">
                  <div>
                    <p className="font-medium">{row.seq === 0 ? "Deposit" : `Instalment ${row.seq}`}</p>
                    <p className="text-xs text-muted-foreground">{plan.status === "sent" && row.seq === 0 ? "Today" : day(row.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">{ghs(row.amount)}</span>
                    <Badge variant="outline" className={cn("w-20 justify-center border-transparent capitalize", STATUS_TONE[row.status])}>
                      {row.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {plan.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {plan.payments.map((p) => (
                  <div key={p.reference} className="flex justify-between border-t px-6 py-3 text-sm">
                    <span className="text-muted-foreground">{new Date(p.confirmed_at).toLocaleDateString("en-GB")}</span>
                    <span className="tabular-nums">{ghs(p.amount_paid)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, danger }: { label: string; value: string; hint?: string; danger?: boolean }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className={cn("text-xs", danger ? "text-destructive" : "text-muted-foreground")}>{hint}</p>}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------- accept

function AcceptStep({ token, session, plan, onAccepted }: { token: string; session: string; plan: CustomerPlan; onAccepted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [firstName = "", ...rest] = (plan.customerName ?? "").split(" ");
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      organizationDetails: {
        firstName,
        lastName: rest.join(" "),
        organizationName: plan.organizationName ?? "",
        organizationEmail: plan.contactType === "email" ? plan.contact : "",
        phoneNumber: plan.contactType === "phone" ? `0${plan.contact.slice(3)}` : "",
      },
      billingAddress: { street: "", city: "", state: "", country: "Ghana", postalCode: "" },
      paymentMethod: "paystack",
    },
    mode: "onChange",
  });

  const submit = form.handleSubmit(async (values) => {
    setBusy(true);
    try {
      await planApi.accept(token, session, { ...values.organizationDetails, address: values.billingAddress });
      onAccepted();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-6">
        <OrganizationDetailsForm form={form} />
        <BillingAddressForm form={form} />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept plan · Pay deposit {ghs(plan.deposit)}
        </Button>
      </form>
    </Form>
  );
}

// ---------------------------------------------------------------- pay

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;
const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
const hubtelAvailable = import.meta.env.VITE_HUBTEL_ENABLED !== "false";

function PayPanel({ token, session, plan, onPaid }: { token: string; session: string; plan: CustomerPlan; onPaid: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("clientReference");
  const [amount, setAmount] = useState(String(plan.suggested));
  const [provider, setProvider] = useState<"hubtel" | "paystack">(hubtelAvailable ? "hubtel" : "paystack");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState<"checking" | "slow" | null>(reference ? "checking" : null);
  const initializePayment = usePaystackPayment({ publicKey });

  // After paying (popup success or Hubtel return), wait for the server to confirm.
  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const poll = async () => {
      try {
        const payment = await planApi.payment(reference);
        if (cancelled) return;
        if (payment.status === "completed") {
          toast.success(`${ghs(payment.amountPaid ?? payment.amount)} received`);
          setWaiting(null);
          setSearchParams({}, { replace: true });
          onPaid();
          return;
        }
      } catch {
        if (cancelled) return;
      }
      if (Date.now() - started > GIVE_UP_MS) {
        setWaiting("slow");
        return;
      }
      timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reference, onPaid, setSearchParams]);

  const value = Number(amount);
  const valid = value + 0.009 >= plan.minimum && value <= plan.balance + 0.009;
  const first = plan.status === "sent";

  const pay = async () => {
    setBusy(true);
    try {
      const start = await planApi.pay(token, session, Math.round(value * 100) / 100, provider);
      if (start.provider === "hubtel") {
        window.location.assign(start.checkoutUrl);
        return;
      }
      initializePayment({
        config: {
          reference: start.reference,
          email: start.email,
          amount: Math.round(start.amount * 100),
          currency: "GHS",
          channels: ["mobile_money", "card"],
        },
        onSuccess: () => {
          setBusy(false);
          setWaiting("checking");
          setSearchParams({ reference: start.reference }, { replace: true });
        },
        onClose: () => setBusy(false),
      });
    } catch (error) {
      toast.error((error as Error).message);
      setBusy(false);
    }
  };

  if (waiting) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          {waiting === "checking" ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Confirming payment</p>
            </>
          ) : (
            <>
              <AlertCircle className="h-10 w-10 text-amber-500" />
              <p className="font-medium">Still waiting for the payment</p>
              <Button variant="outline" onClick={() => { setSearchParams({}, { replace: true }); setWaiting(null); }}>
                Back
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{first ? "Pay deposit" : "Make a payment"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pay-amount">Amount (GHS)</Label>
          <Input
            id="pay-amount"
            type="number"
            step="any"
            min={plan.minimum}
            max={plan.balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          {!first && (
            <div className="flex flex-wrap gap-2">
              {plan.dueNow > 0 && <Chip onClick={() => setAmount(String(plan.dueNow))}>Due now</Chip>}
              {plan.next && plan.dueNow <= 0 && <Chip onClick={() => setAmount(String(plan.next!.remaining))}>Next instalment</Chip>}
              <Chip onClick={() => setAmount(String(plan.balance))}>Full balance</Chip>
            </div>
          )}
          {!valid && amount !== "" && (
            <p className="text-xs text-destructive">
              {value < plan.minimum ? `At least ${ghs(plan.minimum)}` : `At most ${ghs(plan.balance)}`}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {hubtelAvailable && (
            <MethodButton active={provider === "hubtel"} onClick={() => setProvider("hubtel")}>
              <img src="/momo.png" alt="" className="h-6 object-contain" />
              Mobile Money or Card
            </MethodButton>
          )}
          <MethodButton active={provider === "paystack"} onClick={() => setProvider("paystack")}>
            Paystack
          </MethodButton>
        </div>

        <Button size="lg" className="w-full" disabled={!valid || busy || (provider === "paystack" && !publicKey)} onClick={pay}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay {valid ? ghs(value) : ""}
        </Button>
      </CardContent>
    </Card>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
      {children}
    </button>
  );
}

function MethodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-3 text-left text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
      )}
    >
      {children}
    </button>
  );
}
