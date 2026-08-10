import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { CheckCircle2, Loader2, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../lib/endpoints';

/**
 * Shared landing page for in-app purchases made from ANY FMT product
 * (Print Suite Pro, Church Hub 360, Stock Flow, …), on desktop or web.
 *
 * Desktop apps run from a file:// URL that Paystack cannot redirect to, so they
 * send the customer here instead. Crediting is NOT this page's job — the
 * Paystack webhook credits the organisation server-side whatever the browser
 * does. This page only reports what already happened and tells the customer
 * where to go next.
 *
 * Query params (all optional, so a bare visit still renders sensibly):
 *   reference / trxref — appended by Paystack
 *   appId              — which product's database to look the purchase up in
 *   app                — display name, e.g. "Print Suite Pro"
 *   product            — "sms" | "storage", for the wording only
 */

type Status = 'checking' | 'success' | 'pending' | 'unknown';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s, then fall back to the reassuring message

export default function PaymentCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const appId = searchParams.get('appId');
  const appName = searchParams.get('app');
  const product = searchParams.get('product');

  // Without a reference+appId there is nothing to look up (e.g. a website
  // purchase, which records itself synchronously at checkout).
  const canPoll = Boolean(reference && appId);
  const [status, setStatus] = useState<Status>(canPoll ? 'checking' : 'unknown');
  const [credits, setCredits] = useState<number | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!canPoll) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/payments/purchase-status/${encodeURIComponent(
            reference!
          )}?appId=${encodeURIComponent(appId!)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;

          if (data.status === 'success') {
            setCredits(data.creditsPurchased ?? null);
            setStatus('success');
            return;
          }
        }
      } catch {
        // Offline or a blip — the webhook still credits, so just try again.
      }

      if (cancelled) return;
      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) {
        setStatus('pending');
        return;
      }
      timer = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canPoll, reference, appId]);

  const returnTarget = appName || 'your app';
  const productLabel = product === 'storage' ? 'storage' : 'SMS credits';

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="text-center shadow-lg">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              {/* Reaching this page means Paystack completed the charge, so the
                  payment is a success either way. Only the crediting may still
                  be in flight — that is a neutral "in progress", not a warning,
                  and dressing it as one contradicts the heading. */}
              {status === 'checking' ? (
                <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
              ) : (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'checking' ? 'Confirming your payment…' : 'Payment received'}
            </CardTitle>
            <CardDescription>
              {status === 'checking'
                ? 'This usually takes just a few seconds.'
                : status === 'success'
                  ? credits
                    ? `${Number(credits).toLocaleString()} SMS credits have been added.`
                    : `Your ${productLabel} have been added.`
                  : `Your ${productLabel} are being added now.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border bg-muted/50 p-3 text-left text-sm">
              <Monitor className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">
                You can close this tab and return to{' '}
                <span className="font-medium text-foreground">{returnTarget}</span>.
                {status !== 'success' &&
                  ' Your balance updates on its own — there is nothing else to do here.'}
              </p>
            </div>

            {status === 'pending' && (
              <p className="text-sm text-muted-foreground">
                This can take a few moments to appear. If it hasn't shown up shortly,
                contact support with the reference below.
              </p>
            )}

            {reference && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="font-medium">Reference:</span>{' '}
                <span className="break-all">{reference}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
