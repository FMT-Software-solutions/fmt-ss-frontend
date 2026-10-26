import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { getStoreOrder, type StoreOrderStatus } from "@/lib/store-order";

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;

type View = "checking" | "completed" | "problem" | "waiting" | "missing";

/**
 * Where buyers land after paying. Polls the order; the server confirms it
 * with Paystack or Hubtel, so this works even if a webhook was missed.
 */
export default function OrderCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const reference = searchParams.get("reference") || searchParams.get("clientReference") || "";
  const [order, setOrder] = useState<StoreOrderStatus | null>(null);
  const [view, setView] = useState<View>(reference ? "checking" : "missing");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();

    const poll = async () => {
      try {
        const next = await getStoreOrder(reference);
        if (cancelled) return;
        setOrder(next);
        if (next.status === "completed") return setView("completed");
        if (next.status === "underpaid" || next.status === "failed") return setView("problem");
      } catch {
        if (cancelled) return;
      }
      if (Date.now() - started > GIVE_UP_MS) return setView("waiting");
      timer = setTimeout(poll, POLL_MS);
    };
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reference, attempt]);

  const titles = order?.items.map((i) => i.title).filter(Boolean).join(", ");

  const content: Record<View, { icon: ReactNode; title: string; body?: string }> = {
    checking: {
      icon: <Loader2 className="h-14 w-14 animate-spin text-primary" />,
      title: "Confirming payment",
    },
    completed: {
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      title: "Payment successful",
      body: `${titles ? `${titles} is ready. ` : ""}Your login details are on the way to your email.`,
    },
    problem: {
      icon: <AlertCircle className="h-14 w-14 text-destructive" />,
      title: "Payment not confirmed",
      body: "The amount received does not match this order. Our team has been notified.",
    },
    waiting: {
      icon: <Clock className="h-14 w-14 text-amber-500" />,
      title: "Still waiting for the payment",
      body: "If you approved it, it can take a few minutes. We'll email you once it's confirmed.",
    },
    missing: {
      icon: <AlertCircle className="h-14 w-14 text-muted-foreground" />,
      title: "Order not found",
    },
  };
  const { icon, title, body } = content[view];

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      {view === "completed" && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={400} gravity={0.12} />
      )}
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">{icon}</div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {body && <CardDescription>{body}</CardDescription>}
        </CardHeader>
        {reference && (
          <CardContent>
            <div className="p-3 bg-muted rounded-md text-sm">
              <span className="font-medium">Reference:</span> {reference}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex justify-center gap-3">
          {view === "waiting" && <Button onClick={() => {
                setView("checking");
                setAttempt((n) => n + 1);
              }}>Check again</Button>}
          {(view === "problem" || view === "waiting") && (
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Contact us
            </Button>
          )}
          {(view === "completed" || view === "missing") && (
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              Browse apps
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
